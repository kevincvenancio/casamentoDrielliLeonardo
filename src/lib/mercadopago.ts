import crypto from "crypto";

const MP_API = "https://api.mercadopago.com";

export interface MpPaymentInfo {
  id: string;
  status: string; // approved | rejected | cancelled | pending | in_process | refunded ...
  external_reference: string | null;
  transaction_amount: number | null;
  payer_email: string | null;
  raw: unknown;
}

function accessToken(): string {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN nao configurado.");
  return token;
}

/**
 * Cria uma preferencia de checkout (Checkout Pro).
 * Retorna preference id + init_point (URL para redirecionar o comprador).
 */
export async function createPreference(input: {
  title: string;
  amountCents: number;
  externalReference: string;
  buyerEmail?: string | null;
  siteUrl: string;
}): Promise<{ id: string; init_point: string }> {
  const body = {
    items: [
      {
        id: input.externalReference,
        title: input.title,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number((input.amountCents / 100).toFixed(2)),
      },
    ],
    payer: input.buyerEmail ? { email: input.buyerEmail } : undefined,
    external_reference: input.externalReference,
    back_urls: {
      success: `${input.siteUrl}/pagamento/sucesso`,
      pending: `${input.siteUrl}/pagamento/pendente`,
      failure: `${input.siteUrl}/pagamento/erro`,
    },
    auto_return: "approved",
    notification_url: `${input.siteUrl}/api/webhook/mercadopago`,
  };

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao criar preferencia MP (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    id: string;
    init_point: string;
    sandbox_init_point?: string;
  };
  // init_point respeita o ambiente do access token (sandbox vs producao).
  return { id: data.id, init_point: data.init_point ?? data.sandbox_init_point };
}

/**
 * Busca o status REAL de um pagamento na API do MP.
 * O payload do webhook nao e fonte de verdade; sempre consultamos aqui.
 */
export async function fetchPaymentInfo(
  paymentId: string
): Promise<MpPaymentInfo> {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao consultar pagamento MP (${res.status}): ${text}`);
  }
  const data = (await res.json()) as any;
  return {
    id: String(data.id),
    status: String(data.status),
    external_reference: data.external_reference ?? null,
    transaction_amount: data.transaction_amount ?? null,
    payer_email: data.payer?.email ?? null,
    raw: data,
  };
}

/**
 * Valida a assinatura do webhook do Mercado Pago.
 * Header x-signature: "ts=<timestamp>,v1=<hash>"
 * Manifest: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 * HMAC-SHA256(manifest, MP_WEBHOOK_SECRET) === v1
 */
export function verifyWebhookSignature(params: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
  secret: string;
}): boolean {
  const { signatureHeader, requestId, dataId, secret } = params;
  if (!signatureHeader || !dataId || !secret) return false;

  const parts = signatureHeader.split(",").reduce<Record<string, string>>(
    (acc, part) => {
      const [k, v] = part.split("=").map((s) => s.trim());
      if (k && v) acc[k] = v;
      return acc;
    },
    {}
  );

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  // data.id deve ser minusculo quando alfanumerico, conforme docs MP.
  const normalizedId = dataId.toLowerCase();
  const manifest = `id:${normalizedId};request-id:${requestId ?? ""};ts:${ts};`;

  const computed = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(v1, "hex")
    );
  } catch {
    return false;
  }
}
