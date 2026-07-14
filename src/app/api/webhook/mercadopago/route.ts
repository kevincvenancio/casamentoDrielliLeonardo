import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  fetchPaymentInfo,
  verifyWebhookSignature,
} from "@/lib/mercadopago";
import { createSupabaseWebhookStore } from "@/lib/webhook-store";
import { processPaymentNotification } from "@/lib/webhook-core";

export const dynamic = "force-dynamic";

/**
 * Webhook do Mercado Pago.
 *
 * Regras criticas:
 * - Valida a assinatura (x-signature + x-request-id, HMAC SHA256).
 * - O payload NAO e fonte de verdade: extrai data.id e consulta a API.
 * - Idempotencia obrigatoria (mp_payment_id unico + checagem de estado final).
 * - Handler enxuto; responde 200 apos processar (MP tem timeout curto).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    // Sem secret configurado nao ha como validar; rejeita.
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const url = new URL(req.url);
  // data.id pode vir no body ou como query param (?data.id=).
  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const dataId =
    payload?.data?.id?.toString() ??
    url.searchParams.get("data.id") ??
    url.searchParams.get("id");

  // Tipo de notificacao: so processamos 'payment'.
  const type = payload?.type ?? url.searchParams.get("type") ?? payload?.topic;

  // 1. Valida assinatura. Requisicoes nao assinadas sao rejeitadas.
  const signatureOk = verifyWebhookSignature({
    signatureHeader: req.headers.get("x-signature"),
    requestId: req.headers.get("x-request-id"),
    dataId,
    secret,
  });
  if (!signatureOk) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  // Notificacoes que nao sao de pagamento: apenas 200 (nada a fazer).
  if (type && type !== "payment") {
    return NextResponse.json({ received: true }, { status: 200 });
  }
  if (!dataId) {
    return NextResponse.json({ error: "missing data.id" }, { status: 400 });
  }

  try {
    // 2. Consulta o status REAL na API do MP.
    const info = await fetchPaymentInfo(dataId);

    // 3. Processa (idempotente) via nucleo testavel.
    const supabase = createServiceClient();
    const store = createSupabaseWebhookStore(supabase);
    const outcome = await processPaymentNotification({ info, store });

    return NextResponse.json({ received: true, outcome }, { status: 200 });
  } catch (err) {
    // Erro ao processar: 500 faz o MP reenviar (nosso fluxo e idempotente).
    const message = err instanceof Error ? err.message : "processing error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
