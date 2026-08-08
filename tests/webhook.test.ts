import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import {
  processPaymentNotification,
  type WebhookStore,
} from "@/lib/webhook-core";
import { verifyWebhookSignature } from "@/lib/mercadopago";
import type { Payment } from "@/lib/types";
import type { MpPaymentInfo } from "@/lib/mercadopago";
import { computeGiftStock } from "@/lib/stock";

/** Store em memoria que imita o comportamento do Supabase. */
function makeStore(seed: { payments: Payment[] }) {
  const payments = new Map(seed.payments.map((p) => [p.id, { ...p }]));
  const calls = { updatePayment: 0 };

  const store: WebhookStore = {
    async findByMpPaymentId(mpPaymentId) {
      for (const p of payments.values()) {
        if (p.mp_payment_id === mpPaymentId) return { ...p };
      }
      return null;
    },
    async findById(id) {
      const p = payments.get(id);
      return p ? { ...p } : null;
    },
    async updatePayment(id, patch) {
      calls.updatePayment++;
      const p = payments.get(id);
      if (!p) throw new Error("payment nao existe");
      p.status = patch.status;
      p.mp_payment_id = patch.mpPaymentId;
      if (patch.amountCents != null) p.amount_cents = patch.amountCents;
      if (patch.buyerEmail != null) p.buyer_email = patch.buyerEmail;
      p.raw_payload = patch.raw;
    },
  };

  return { store, payments, calls };
}

/** Recalcula o estoque a partir dos payments, como o site faz. */
function estoque(
  payments: Map<string, Payment>,
  stockTotal: number | null,
  giftId = "gift-1"
) {
  const rows = [...payments.values()]
    .filter((p) => p.gift_id === giftId)
    .map((p) => ({ status: p.status, reserved_until: p.reserved_until }));
  return computeGiftStock({ stock_total: stockTotal }, rows);
}

function payment(over: Partial<Payment> = {}): Payment {
  return {
    id: "pay-1",
    gift_id: "gift-1",
    mp_preference_id: "pref-1",
    mp_payment_id: null,
    buyer_name: "Fulano",
    buyer_email: "fulano@example.com",
    amount_cents: 10000,
    status: "pending",
    reserved_until: new Date(Date.now() + 600_000).toISOString(),
    raw_payload: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...over,
  };
}

function mpInfo(over: Partial<MpPaymentInfo> = {}): MpPaymentInfo {
  return {
    id: "mp-123",
    status: "approved",
    external_reference: "pay-1",
    transaction_amount: 100,
    payer_email: "fulano@example.com",
    raw: { id: "mp-123", status: "approved" },
    ...over,
  };
}

describe("webhook - idempotencia", () => {
  it("notificacao duplicada do mesmo mp_payment_id nao gera efeito duplo", async () => {
    const { store, payments, calls } = makeStore({
      payments: [payment({ status: "approved", mp_payment_id: "mp-123" })],
    });

    const outcome = await processPaymentNotification({
      info: mpInfo({ id: "mp-123", status: "approved" }),
      store,
    });

    expect(outcome).toBe("duplicate");
    // Nenhuma escrita adicional deve ocorrer.
    expect(calls.updatePayment).toBe(0);
    // E o estoque nao e consumido duas vezes.
    expect(estoque(payments, 10).paidCount).toBe(1);
  });
});

describe("webhook - maquina de estados", () => {
  it("pagamento aprovado consome uma unidade do estoque", async () => {
    const { store, payments } = makeStore({ payments: [payment()] });

    const outcome = await processPaymentNotification({
      info: mpInfo({ status: "approved" }),
      store,
    });

    expect(outcome).toBe("approved");
    expect(payments.get("pay-1")!.status).toBe("approved");
    expect(payments.get("pay-1")!.mp_payment_id).toBe("mp-123");

    const stock = estoque(payments, 10);
    expect(stock.paidCount).toBe(1);
    expect(stock.remaining).toBe(9);
  });

  it("pagamento rejeitado devolve a unidade ao estoque", async () => {
    const { store, payments } = makeStore({ payments: [payment()] });

    const outcome = await processPaymentNotification({
      info: mpInfo({ status: "rejected" }),
      store,
    });

    expect(outcome).toBe("rejected");
    expect(payments.get("pay-1")!.status).toBe("rejected");
    expect(estoque(payments, 10).remaining).toBe(10);
  });

  it("estorno devolve a unidade ao estoque", async () => {
    const { store, payments } = makeStore({ payments: [payment()] });

    const outcome = await processPaymentNotification({
      info: mpInfo({ status: "refunded" }),
      store,
    });

    expect(outcome).toBe("refunded");
    expect(estoque(payments, 10).remaining).toBe(10);
  });

  it("pagamento pendente mantem apenas a reserva", async () => {
    const { store, payments } = makeStore({ payments: [payment()] });

    const outcome = await processPaymentNotification({
      info: mpInfo({ status: "in_process" }),
      store,
    });

    expect(outcome).toBe("pending");
    const stock = estoque(payments, 10);
    expect(stock.paidCount).toBe(0);
    expect(stock.reservedCount).toBe(1);
  });

  it("duas compras do MESMO presente sao aprovadas de forma independente", async () => {
    const { store, payments } = makeStore({
      payments: [
        payment({ id: "pay-1" }),
        payment({ id: "pay-2", buyer_name: "Ciclana" }),
      ],
    });

    await processPaymentNotification({
      info: mpInfo({ id: "mp-1", external_reference: "pay-1" }),
      store,
    });
    await processPaymentNotification({
      info: mpInfo({ id: "mp-2", external_reference: "pay-2" }),
      store,
    });

    expect(payments.get("pay-1")!.status).toBe("approved");
    expect(payments.get("pay-2")!.status).toBe("approved");

    // Presente ilimitado continua na lista mesmo depois das duas compras.
    expect(estoque(payments, null).soldOut).toBe(false);
    expect(estoque(payments, 10).paidCount).toBe(2);
  });
});

describe("webhook - assinatura", () => {
  const secret = "super-secret";
  const dataId = "mp-123";
  const requestId = "req-abc";
  const ts = "1700000000";

  function sign(id: string) {
    const manifest = `id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`;
    return crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  }

  it("assinatura valida e aceita", () => {
    const v1 = sign(dataId);
    const ok = verifyWebhookSignature({
      signatureHeader: `ts=${ts},v1=${v1}`,
      requestId,
      dataId,
      secret,
    });
    expect(ok).toBe(true);
  });

  it("assinatura invalida e rejeitada", () => {
    const ok = verifyWebhookSignature({
      signatureHeader: `ts=${ts},v1=deadbeef`,
      requestId,
      dataId,
      secret,
    });
    expect(ok).toBe(false);
  });

  it("requisicao sem header de assinatura e rejeitada", () => {
    const ok = verifyWebhookSignature({
      signatureHeader: null,
      requestId,
      dataId,
      secret,
    });
    expect(ok).toBe(false);
  });
});
