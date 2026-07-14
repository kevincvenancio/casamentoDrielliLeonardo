import type { SupabaseClient } from "@supabase/supabase-js";
import type { WebhookStore } from "./webhook-core";
import type { Payment, PaymentStatus } from "./types";

/** Implementacao do WebhookStore sobre o Supabase (service role). */
export function createSupabaseWebhookStore(
  supabase: SupabaseClient
): WebhookStore {
  return {
    async findByMpPaymentId(mpPaymentId: string): Promise<Payment | null> {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("mp_payment_id", mpPaymentId)
        .maybeSingle();
      return (data as Payment) ?? null;
    },

    async findById(paymentId: string): Promise<Payment | null> {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .maybeSingle();
      return (data as Payment) ?? null;
    },

    async updatePayment(paymentId, patch): Promise<void> {
      const update: Record<string, unknown> = {
        status: patch.status as PaymentStatus,
        mp_payment_id: patch.mpPaymentId,
        raw_payload: patch.raw,
        updated_at: new Date().toISOString(),
      };
      if (patch.amountCents != null) update.amount_cents = patch.amountCents;
      if (patch.buyerEmail != null) update.buyer_email = patch.buyerEmail;

      const { error } = await supabase
        .from("payments")
        .update(update)
        .eq("id", paymentId);
      if (error) throw new Error(error.message);
    },

    async setGiftStatus(giftId, status, opts): Promise<void> {
      const update: Record<string, unknown> = { status };
      if (opts?.clearReserved) update.reserved_until = null;
      const { error } = await supabase
        .from("gifts")
        .update(update)
        .eq("id", giftId);
      if (error) throw new Error(error.message);
    },
  };
}
