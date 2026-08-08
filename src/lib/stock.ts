import type { Gift } from "./types";

/**
 * Calculo de estoque de um presente.
 *
 * A disponibilidade e DERIVADA dos pagamentos, nunca de um contador
 * guardado em `gifts`:
 *   vendidos   = payments 'approved'
 *   reservados = payments 'pending' com reserved_until ainda no futuro
 *   restante   = stock_total - (vendidos + reservados)
 *
 * Assim nao existe contador para dessincronizar, a reserva de 20 min
 * expira sozinha (basta a janela passar) e um pagamento rejeitado
 * libera a vaga sem nenhuma escrita extra.
 */

/** Linha de `payments` no minimo necessario para contar estoque. */
export interface StockPaymentRow {
  status: string;
  reserved_until: string | null;
}

export interface GiftStock {
  /** Compras aprovadas: unidades efetivamente vendidas. */
  paidCount: number;
  /** Checkouts pendentes dentro da janela de reserva. */
  reservedCount: number;
  /** Unidades ainda compraveis. null = ilimitado. */
  remaining: number | null;
  /** true quando nao da para comprar agora. */
  soldOut: boolean;
  /**
   * Por que esgotou:
   * - "paid": as unidades foram vendidas mesmo (definitivo).
   * - "reserved": ha checkouts em andamento segurando as ultimas
   *   unidades -- volta a ficar disponivel quando a janela vencer.
   */
  soldOutReason: "paid" | "reserved" | null;
}

export type GiftWithStock = Gift & GiftStock;

/**
 * @param gift    presente (so `stock_total` importa aqui)
 * @param rows    pagamentos DESTE presente (outros status sao ignorados)
 * @param nowMs   instante de referencia, injetavel para teste
 */
export function computeGiftStock(
  gift: Pick<Gift, "stock_total">,
  rows: StockPaymentRow[],
  nowMs: number = Date.now()
): GiftStock {
  let paidCount = 0;
  let reservedCount = 0;

  for (const row of rows) {
    if (row.status === "approved") {
      paidCount++;
      continue;
    }
    // Pendente so segura unidade enquanto a janela de reserva vale.
    // Sem reserved_until (registro anterior ao estoque) nao segura nada.
    if (row.status === "pending" && row.reserved_until) {
      const until = Date.parse(row.reserved_until);
      if (Number.isFinite(until) && until > nowMs) reservedCount++;
    }
    // rejected / refunded nao ocupam vaga.
  }

  if (gift.stock_total == null) {
    return {
      paidCount,
      reservedCount,
      remaining: null,
      soldOut: false,
      soldOutReason: null,
    };
  }

  const remaining = Math.max(0, gift.stock_total - paidCount - reservedCount);
  const soldOut = remaining === 0;

  return {
    paidCount,
    reservedCount,
    remaining,
    soldOut,
    // Se o estoque ja foi todo vendido, esgotou de vez. Se ainda ha
    // unidades nao vendidas, quem esta segurando sao as reservas.
    soldOutReason: soldOut ? (paidCount >= gift.stock_total ? "paid" : "reserved") : null,
  };
}

/** Agrupa as linhas de pagamento por gift_id para o calculo em lote. */
export function groupPaymentsByGift(
  rows: Array<StockPaymentRow & { gift_id: string | null }>
): Map<string, StockPaymentRow[]> {
  const map = new Map<string, StockPaymentRow[]>();
  for (const row of rows) {
    if (!row.gift_id) continue;
    const list = map.get(row.gift_id);
    if (list) list.push(row);
    else map.set(row.gift_id, [row]);
  }
  return map;
}
