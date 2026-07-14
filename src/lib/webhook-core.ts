import type { MpPaymentInfo } from "./mercadopago";
import type { Payment, PaymentStatus } from "./types";

/**
 * Abstracao de persistencia usada pelo processamento do webhook.
 * Implementada com Supabase em producao e com um mock nos testes.
 */
export interface WebhookStore {
  /** Busca payment pelo mp_payment_id (rede de idempotencia). */
  findByMpPaymentId(mpPaymentId: string): Promise<Payment | null>;
  /** Busca o registro de payment pelo id (external_reference). */
  findById(paymentId: string): Promise<Payment | null>;
  /** Atualiza status/dados do payment. */
  updatePayment(
    paymentId: string,
    patch: {
      status: PaymentStatus;
      mpPaymentId: string;
      amountCents?: number | null;
      buyerEmail?: string | null;
      raw: unknown;
    }
  ): Promise<void>;
  /** Atualiza o status do gift. clearReserved limpa reserved_until. */
  setGiftStatus(
    giftId: string,
    status: "available" | "paid",
    opts?: { clearReserved?: boolean }
  ): Promise<void>;
}

export type WebhookOutcome =
  | "duplicate"
  | "not_found"
  | "approved"
  | "rejected"
  | "refunded"
  | "pending";

const FINAL_STATUSES: PaymentStatus[] = ["approved", "rejected", "refunded"];

/**
 * Nucleo do processamento do webhook. Puro em relacao a IO externo:
 * recebe o status ja consultado na API do MP + um store injetavel.
 *
 * Garante idempotencia e a maquina de estados presente/pagamento.
 */
export async function processPaymentNotification(args: {
  info: MpPaymentInfo;
  store: WebhookStore;
}): Promise<WebhookOutcome> {
  const { info, store } = args;

  // 1. Idempotencia: se ja processamos este mp_payment_id ate um estado
  //    final, nao repetimos o efeito.
  const existing = await store.findByMpPaymentId(info.id);
  if (existing && FINAL_STATUSES.includes(existing.status)) {
    return "duplicate";
  }

  // 2. Localiza o registro de payment via external_reference.
  const paymentId = info.external_reference;
  if (!paymentId) return "not_found";
  const payment = await store.findById(paymentId);
  if (!payment) return "not_found";

  const amountCents =
    info.transaction_amount != null
      ? Math.round(info.transaction_amount * 100)
      : payment.amount_cents;

  // 3. Maquina de estados baseada no status REAL vindo da API do MP.
  if (info.status === "approved") {
    await store.updatePayment(paymentId, {
      status: "approved",
      mpPaymentId: info.id,
      amountCents,
      buyerEmail: info.payer_email,
      raw: info.raw,
    });
    if (payment.gift_id) {
      await store.setGiftStatus(payment.gift_id, "paid");
    }
    return "approved";
  }

  if (info.status === "rejected" || info.status === "cancelled") {
    await store.updatePayment(paymentId, {
      status: "rejected",
      mpPaymentId: info.id,
      amountCents,
      buyerEmail: info.payer_email,
      raw: info.raw,
    });
    if (payment.gift_id) {
      await store.setGiftStatus(payment.gift_id, "available", {
        clearReserved: true,
      });
    }
    return "rejected";
  }

  if (info.status === "refunded" || info.status === "charged_back") {
    await store.updatePayment(paymentId, {
      status: "refunded",
      mpPaymentId: info.id,
      amountCents,
      buyerEmail: info.payer_email,
      raw: info.raw,
    });
    if (payment.gift_id) {
      await store.setGiftStatus(payment.gift_id, "available", {
        clearReserved: true,
      });
    }
    return "refunded";
  }

  // pending / in_process / authorized: registra mas nao altera o gift.
  await store.updatePayment(paymentId, {
    status: "pending",
    mpPaymentId: info.id,
    amountCents,
    buyerEmail: info.payer_email,
    raw: info.raw,
  });
  return "pending";
}
