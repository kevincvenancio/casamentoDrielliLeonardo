import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase";
import { createPreference } from "@/lib/mercadopago";
import {
  reserveGiftUnit,
  type ReserveStore,
  type ReserveUnitRow,
} from "@/lib/reserve-core";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * ReserveStore sobre a funcao SQL `reserve_gift_unit` (migration 0003).
 * Toda a checagem de estoque + criacao do payment acontece la dentro, numa
 * unica transacao com FOR UPDATE na linha do presente -- e o que impede
 * dois cliques simultaneos furarem o estoque.
 */
function supabaseReserveStore(supabase: SupabaseClient): ReserveStore {
  return {
    async reserveUnit({ giftId, buyerName, buyerEmail, reserveMinutes }) {
      const { data, error } = await supabase.rpc("reserve_gift_unit", {
        p_gift_id: giftId,
        p_buyer_name: buyerName,
        p_buyer_email: buyerEmail,
        p_reserve_minutes: reserveMinutes,
      });
      if (error) throw new Error(error.message);

      const row = (Array.isArray(data) ? data[0] : data) as
        | {
            outcome: ReserveUnitRow["outcome"];
            payment_id: string | null;
            unit_price_cents: number | null;
            gift_title: string | null;
          }
        | undefined;
      if (!row) throw new Error("reserve_gift_unit nao retornou resultado.");

      return {
        outcome: row.outcome,
        paymentId: row.payment_id,
        unitPriceCents: row.unit_price_cents,
        giftTitle: row.gift_title,
      };
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
  // Sem isso, um id malformado viraria erro de cast no Postgres (500).
  if (!UUID_RE.test(giftId)) {
    return NextResponse.json(
      { error: "Presente nao encontrado." },
      { status: 404 }
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

  // 1. Reserva uma unidade e cria o payment 'pending' (preco lido do banco,
  //    NUNCA do client). Sem estoque -> 409. Ver reserve-core.ts.
  const reservation = await reserveGiftUnit({
    giftId,
    buyerName,
    buyerEmail: buyerEmail ?? null,
    store: supabaseReserveStore(supabase),
  });
  if (!reservation.ok) {
    return NextResponse.json(
      { error: reservation.error },
      { status: reservation.status }
    );
  }

  // 2. Cria a preferencia no MP usando payments.id como external_reference.
  try {
    const pref = await createPreference({
      title: reservation.giftTitle,
      amountCents: reservation.priceCents,
      externalReference: reservation.paymentId,
      buyerEmail: buyerEmail ?? null,
      siteUrl,
    });

    await supabase
      .from("payments")
      .update({ mp_preference_id: pref.id })
      .eq("id", reservation.paymentId);

    // 3. Retorna a init_point para o client redirecionar.
    return NextResponse.json({ init_point: pref.init_point });
  } catch (err) {
    // Rollback: marcar o payment como rejeitado ja devolve a unidade ao
    // estoque -- a vaga so existia porque o payment estava 'pending'.
    await supabase
      .from("payments")
      .update({ status: "rejected", reserved_until: null })
      .eq("id", reservation.paymentId);
    const message = err instanceof Error ? err.message : "Erro no checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
