import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase";
import { createPreference } from "@/lib/mercadopago";
import { expireStaleReservations } from "@/lib/gifts";
import { reserveGift, type ReserveStore } from "@/lib/reserve-core";
import type { Gift } from "@/lib/types";

export const dynamic = "force-dynamic";

/** ReserveStore sobre Supabase (service role). */
function supabaseReserveStore(supabase: SupabaseClient): ReserveStore {
  return {
    async getGift(id) {
      const { data } = await supabase
        .from("gifts")
        .select("*")
        .eq("id", id)
        .maybeSingle<Gift>();
      return data ?? null;
    },
    async reserveIfAvailable(id, until) {
      const { data } = await supabase
        .from("gifts")
        .update({ status: "reserved", reserved_until: until })
        .eq("id", id)
        .eq("status", "available")
        .select("id");
      return !!data && data.length > 0;
    },
  };
}

export async function POST(req: NextRequest) {
  let body: { giftId?: string; buyerName?: string; buyerEmail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const { giftId, buyerName, buyerEmail } = body;
  if (!giftId || !buyerName) {
    return NextResponse.json(
      { error: "giftId e buyerName sao obrigatorios." },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SITE_URL nao configurado." },
      { status: 500 }
    );
  }

  const supabase = createServiceClient();

  // Libera reservas expiradas antes de tentar reservar (lazy).
  await expireStaleReservations();

  // 1+2. Le o presente do banco (NUNCA confie no preco do client) e faz a
  //      reserva condicional (UPDATE ... WHERE status = 'available').
  //      Se perder a corrida, retorna 409. Ver reserve-core.ts.
  const reservation = await reserveGift({
    giftId,
    store: supabaseReserveStore(supabase),
  });
  if (!reservation.ok) {
    return NextResponse.json(
      { error: reservation.error },
      { status: reservation.status }
    );
  }
  const gift = reservation.gift;

  // 3. Cria o registro de payment 'pending' PRIMEIRO, para usar o id como
  //    external_reference na preferencia do MP.
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      gift_id: gift.id,
      buyer_name: buyerName,
      buyer_email: buyerEmail ?? null,
      amount_cents: gift.price_cents,
      status: "pending",
    })
    .select("id")
    .single();

  if (payErr || !payment) {
    // rollback da reserva
    await supabase
      .from("gifts")
      .update({ status: "available", reserved_until: null })
      .eq("id", giftId);
    return NextResponse.json(
      { error: payErr?.message ?? "Falha ao registrar pagamento." },
      { status: 500 }
    );
  }

  // 4. Cria a preferencia no Mercado Pago.
  try {
    const pref = await createPreference({
      title: gift.title,
      amountCents: gift.price_cents,
      externalReference: payment.id,
      buyerEmail: buyerEmail ?? null,
      siteUrl,
    });

    await supabase
      .from("payments")
      .update({ mp_preference_id: pref.id })
      .eq("id", payment.id);

    // 5. Retorna a init_point para o client redirecionar.
    return NextResponse.json({ init_point: pref.init_point });
  } catch (err) {
    // rollback: libera presente e marca payment como rejeitado.
    await supabase
      .from("gifts")
      .update({ status: "available", reserved_until: null })
      .eq("id", giftId);
    await supabase
      .from("payments")
      .update({ status: "rejected" })
      .eq("id", payment.id);
    const message = err instanceof Error ? err.message : "Erro no checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
