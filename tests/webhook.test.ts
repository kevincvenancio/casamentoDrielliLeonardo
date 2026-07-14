import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import {
  processPaymentNotification,
  type WebhookStore,
} from "@/lib/webhook-core";
import { verifyWebhookSignature } from "@/lib/mercadopago";
import type { Gift, Payment } from "@/lib/types";
import type { MpPaymentInfo } from "@/lib/mercadopago";

/** Store em memoria que imita o comportamento do Supabase. */
function makeStore(seed: { gifts: Gift[]; payments: Payment[] }) {
  const gifts = new Map(seed.gifts.map((g) => [g.id, { ...g }]));
  const payments = new Map(seed.payments.map((p) => [p.id, { ...p }]));
  const calls = { updatePayment: 0, setGiftStatus: 0 };

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
    async setGiftStatus(giftId, status, opts) {
      calls.setGiftStatus++;
      const g = gifts.get(giftId);
      if (!g) throw new Error("gift nao existe");
      g.status = status;
      if (opts?.clearReserved) g.reserved_until = null;
    },
  };

  return { store, gifts, payments, calls };
}

function gift(over: Partial<Gift> = {}): Gift {
  return {
    id: "gift-1",
    title: "Item",
    description: null,
    image_url: null,
    price_cents: 10000,
    status: "reserved",
    reserved_until: new Date(Date.now() + 600000).toISOString(),
    sort_order: 1,
    created_at: new Date().toISOString(),
    ...over,
  };
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
    const { store, gifts, calls } = makeStore({
      gifts: [gift({ status: "paid" })],
      payments: [
        payment({ status: "approved", mp_payment_id: "mp-123" }),
      ],
    });

    const outcome = await processPaymentNotification({
      info: mpInfo({ id: "mp-123", status: "approved" }),
      store,
    });

    expect(outcome).toBe("duplicate");
    // Nenhuma escrita adicional deve ocorrer.
    expect(calls.updatePayment).toBe(0);
    expect(calls.setGiftStatus).toBe(0);
    expect(gifts.get("gift-1")!.status).toBe("paid");
  });
});

describe("webhook - maquina de estados", () => {
  it("pagamento aprovado marca gift como paid", async () => {
    const { store, gifts, payments } = makeStore({
      gifts: [gift({ status: "reserved" })],
      payments: [payment()],
    });

    const outcome = await processPaymentNotification({
      info: mpInfo({ status: "approved" }),
      store,
    });

    expect(outcome).toBe("approved");
    expect(gifts.get("gift-1")!.status).toBe("paid");
    expect(payments.get("pay-1")!.status).toBe("approved");
    expect(payments.get("pay-1")!.mp_payment_id).toBe("mp-123");
  });

  it("pagamento rejeitado devolve o presente para 'available'", async () => {
    const { store, gifts, payments } = makeStore({
      gifts: [gift({ status: "reserved" })],
      payments: [payment()],
    });

    const outcome = await processPaymentNotification({
      info: mpInfo({ status: "rejected" }),
      store,
    });

    expect(outcome).toBe("rejected");
    expect(gifts.get("gift-1")!.status).toBe("available");
    expect(gifts.get("gift-1")!.reserved_until).toBeNull();
    expect(payments.get("pay-1")!.status).toBe("rejected");
  });

  it("pagamento pendente registra mas nao altera o gift", async () => {
    const { store, gifts, calls } = makeStore({
      gifts: [gift({ status: "reserved" })],
      payments: [payment()],
    });

    const outcome = await processPaymentNotification({
      info: mpInfo({ status: "in_process" }),
      store,
    });

    expect(outcome).toBe("pending");
    expect(gifts.get("gift-1")!.status).toBe("reserved");
    expect(calls.setGiftStatus).toBe(0);
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
