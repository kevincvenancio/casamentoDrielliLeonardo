import { createServiceClient } from "./supabase";
import type { Gift } from "./types";

/**
 * Expiracao LAZY de reservas: presentes 'reserved' cuja reserved_until ja
 * passou voltam para 'available'. Chamado antes de ler a lista.
 * Simples e suficiente para o volume deste projeto (sem cron job).
 */
export async function expireStaleReservations(): Promise<void> {
  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();
  await supabase
    .from("gifts")
    .update({ status: "available", reserved_until: null })
    .eq("status", "reserved")
    .lt("reserved_until", nowIso);
}

/** Le a lista de presentes ja com as reservas expiradas liberadas. */
export async function listGifts(): Promise<Gift[]> {
  await expireStaleReservations();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("gifts")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Gift[];
}
