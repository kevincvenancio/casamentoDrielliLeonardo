import type { Gift } from "./types";

/**
 * Store abstrato para a logica de reserva de presente.
 * Implementado com Supabase em producao e mock nos testes.
 */
export interface ReserveStore {
  getGift(id: string): Promise<Gift | null>;
  /**
   * Reserva condicional: UPDATE ... WHERE id = ? AND status = 'available'.
   * Retorna true SOMENTE se uma linha foi afetada (ganhou a corrida).
   */
  reserveIfAvailable(id: string, reservedUntilIso: string): Promise<boolean>;
}

export type ReserveResult =
  | { ok: true; gift: Gift }
  | { ok: false; status: 404 | 409; error: string };

const RESERVE_MINUTES = 20;

/**
 * Valida disponibilidade e tenta reservar o presente por 20 minutos.
 * - 404 se nao existir
 * - 409 se nao estiver 'available' OU se perder a corrida da reserva
 */
export async function reserveGift(args: {
  giftId: string;
  store: ReserveStore;
  now?: number;
}): Promise<ReserveResult> {
  const { giftId, store } = args;
  const now = args.now ?? Date.now();

  const gift = await store.getGift(giftId);
  if (!gift) {
    return { ok: false, status: 404, error: "Presente nao encontrado." };
  }
  if (gift.status !== "available") {
    return {
      ok: false,
      status: 409,
      error: "Este presente nao esta mais disponivel.",
    };
  }

  const reservedUntil = new Date(now + RESERVE_MINUTES * 60_000).toISOString();
  const won = await store.reserveIfAvailable(giftId, reservedUntil);
  if (!won) {
    return {
      ok: false,
      status: 409,
      error: "Este presente acabou de ser reservado por outra pessoa.",
    };
  }

  return { ok: true, gift };
}
