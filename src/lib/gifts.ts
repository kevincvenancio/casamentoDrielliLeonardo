import { createServiceClient } from "./supabase";
import { computeGiftStock, groupPaymentsByGift, type GiftWithStock } from "./stock";
import type { Gift } from "./types";

/**
 * Lista os presentes ativos ja com o estoque calculado.
 *
 * Duas consultas em paralelo (presentes + pagamentos que ocupam vaga) e a
 * agregacao em memoria. Para o volume deste site -- dezenas de presentes e
 * algumas centenas de pagamentos -- isso e mais simples e mais barato que
 * uma view agregada, e mantem o calculo em codigo testavel (stock.ts).
 *
 * Nao existe mais expiracao "lazy" de reservas: uma reserva vencida
 * simplesmente para de contar, sem UPDATE nenhum.
 */
export async function listGifts(
  opts: { includeInactive?: boolean } = {}
): Promise<GiftWithStock[]> {
  const supabase = createServiceClient();

  let giftsQuery = supabase.from("gifts").select("*");
  // O painel precisa enxergar tambem os presentes desativados.
  if (!opts.includeInactive) giftsQuery = giftsQuery.eq("active", true);

  const [giftsRes, paymentsRes] = await Promise.all([
    giftsQuery
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    // Só aprovados e pendentes podem ocupar vaga.
    supabase
      .from("payments")
      .select("gift_id, status, reserved_until")
      .in("status", ["approved", "pending"]),
  ]);

  if (giftsRes.error) throw new Error(giftsRes.error.message);
  if (paymentsRes.error) throw new Error(paymentsRes.error.message);

  const gifts = (giftsRes.data ?? []) as Gift[];
  const byGift = groupPaymentsByGift(paymentsRes.data ?? []);
  const now = Date.now();

  return gifts.map((gift) => ({
    ...gift,
    ...computeGiftStock(gift, byGift.get(gift.id) ?? [], now),
  }));
}
