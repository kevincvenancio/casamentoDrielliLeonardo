import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase";
import { validateManualPix } from "@/lib/manual-pix";

export const dynamic = "force-dynamic";

/**
 * Lancamento manual de Pix direto (feito pelo QR, fora do Mercado Pago).
 *
 * Vira um payment ja aprovado e sem gift_id: entra no total arrecadado
 * e nao consome estoque de nenhum presente.
 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: { donorName?: unknown; amount?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const input = validateManualPix(body);
  if (!input.ok) {
    return NextResponse.json({ error: input.error }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("payments").insert({
    gift_id: null,
    buyer_name: input.donorName,
    amount_cents: input.amountCents,
    status: "approved",
    source: "pix_manual",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

/**
 * Remove um lancamento manual (para corrigir erro de digitacao).
 * So apaga linhas `pix_manual`: pagamento do Mercado Pago nunca sai daqui.
 */
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Informe o id." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id)
    .eq("source", "pix_manual")
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Lançamento não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
