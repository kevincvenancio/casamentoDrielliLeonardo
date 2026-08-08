/** Janela em que um checkout pendente segura uma unidade do presente. */
export const RESERVE_MINUTES = 20;

/** Resultado bruto da funcao SQL `reserve_gift_unit`. */
export type ReserveOutcome = "ok" | "not_found" | "inactive" | "sold_out";

export interface ReserveUnitRow {
  outcome: ReserveOutcome;
  paymentId: string | null;
  unitPriceCents: number | null;
  giftTitle: string | null;
}

/**
 * Store abstrato da reserva. Implementado com a RPC do Supabase em
 * producao e com um mock nos testes.
 */
export interface ReserveStore {
  /**
   * Reserva UMA unidade do presente e cria o payment pendente, de forma
   * atomica (a funcao SQL trava a linha do presente com FOR UPDATE antes
   * de contar o estoque). Nao lanca em caso de indisponibilidade: devolve
   * o `outcome` correspondente.
   */
  reserveUnit(input: {
    giftId: string;
    buyerName: string;
    buyerEmail: string | null;
    reserveMinutes: number;
  }): Promise<ReserveUnitRow>;
}

export type ReserveResult =
  | { ok: true; paymentId: string; priceCents: number; giftTitle: string }
  | { ok: false; status: 404 | 409; error: string };

/**
 * Reserva uma unidade e traduz o resultado em resposta HTTP.
 * - 404 se o presente nao existir
 * - 409 se estiver desativado ou sem estoque
 *
 * Um presente com `stock_total = null` (ilimitado) nunca da 409 por
 * estoque: pode ser comprado quantas vezes quiserem.
 */
export async function reserveGiftUnit(args: {
  giftId: string;
  buyerName: string;
  buyerEmail?: string | null;
  store: ReserveStore;
}): Promise<ReserveResult> {
  const row = await args.store.reserveUnit({
    giftId: args.giftId,
    buyerName: args.buyerName,
    buyerEmail: args.buyerEmail ?? null,
    reserveMinutes: RESERVE_MINUTES,
  });

  if (row.outcome === "not_found") {
    return { ok: false, status: 404, error: "Presente nao encontrado." };
  }

  if (row.outcome === "inactive") {
    return {
      ok: false,
      status: 409,
      error: "Este presente nao esta mais disponivel.",
    };
  }

  if (row.outcome === "sold_out") {
    return {
      ok: false,
      status: 409,
      error:
        "As unidades deste presente acabaram (ou estao em pagamento). Tente outro, ou volte em alguns minutos.",
    };
  }

  // outcome === "ok": o SQL garante os tres campos preenchidos. Se vier
  // vazio, e bug de contrato -- falha alto em vez de seguir com dado meia-boca.
  if (!row.paymentId || row.unitPriceCents == null || !row.giftTitle) {
    throw new Error(
      "reserve_gift_unit devolveu 'ok' sem payment_id/preco/titulo."
    );
  }

  return {
    ok: true,
    paymentId: row.paymentId,
    priceCents: row.unitPriceCents,
    giftTitle: row.giftTitle,
  };
}
