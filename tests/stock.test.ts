import { describe, it, expect } from "vitest";
import {
  computeGiftStock,
  groupPaymentsByGift,
  type StockPaymentRow,
} from "@/lib/stock";

const NOW = Date.parse("2026-01-10T12:00:00.000Z");
const futuro = new Date(NOW + 10 * 60_000).toISOString();
const passado = new Date(NOW - 10 * 60_000).toISOString();

const aprovado: StockPaymentRow = { status: "approved", reserved_until: null };
const reservaAtiva: StockPaymentRow = {
  status: "pending",
  reserved_until: futuro,
};
const reservaVencida: StockPaymentRow = {
  status: "pending",
  reserved_until: passado,
};

describe("estoque ilimitado (stock_total = null)", () => {
  it("nunca esgota, por mais que vendam", () => {
    const rows = Array.from({ length: 50 }, () => aprovado);
    const stock = computeGiftStock({ stock_total: null }, rows, NOW);

    expect(stock.paidCount).toBe(50);
    expect(stock.remaining).toBeNull();
    expect(stock.soldOut).toBe(false);
    expect(stock.soldOutReason).toBeNull();
  });
});

describe("estoque limitado", () => {
  it("desconta vendidos e reservas ativas", () => {
    const stock = computeGiftStock(
      { stock_total: 10 },
      [aprovado, aprovado, aprovado, reservaAtiva],
      NOW
    );

    expect(stock.paidCount).toBe(3);
    expect(stock.reservedCount).toBe(1);
    expect(stock.remaining).toBe(6);
    expect(stock.soldOut).toBe(false);
  });

  it("reserva vencida nao segura mais a unidade", () => {
    const stock = computeGiftStock({ stock_total: 1 }, [reservaVencida], NOW);

    expect(stock.reservedCount).toBe(0);
    expect(stock.remaining).toBe(1);
    expect(stock.soldOut).toBe(false);
  });

  it("pendente sem reserved_until (registro antigo) nao segura unidade", () => {
    const stock = computeGiftStock(
      { stock_total: 1 },
      [{ status: "pending", reserved_until: null }],
      NOW
    );
    expect(stock.remaining).toBe(1);
  });

  it("rejeitado e estornado devolvem a vaga", () => {
    const stock = computeGiftStock(
      { stock_total: 2 },
      [
        { status: "rejected", reserved_until: futuro },
        { status: "refunded", reserved_until: null },
      ],
      NOW
    );
    expect(stock.remaining).toBe(2);
    expect(stock.soldOut).toBe(false);
  });

  it("esgotado por venda e definitivo", () => {
    const stock = computeGiftStock(
      { stock_total: 2 },
      [aprovado, aprovado],
      NOW
    );

    expect(stock.remaining).toBe(0);
    expect(stock.soldOut).toBe(true);
    expect(stock.soldOutReason).toBe("paid");
  });

  it("esgotado apenas por reservas e temporario", () => {
    const stock = computeGiftStock(
      { stock_total: 2 },
      [aprovado, reservaAtiva],
      NOW
    );

    expect(stock.soldOut).toBe(true);
    // Ainda ha 1 unidade nao vendida: volta se a reserva vencer.
    expect(stock.soldOutReason).toBe("reserved");
  });

  it("nunca devolve restante negativo", () => {
    // Cenario possivel: um Pix aprovado depois da janela de reserva.
    const stock = computeGiftStock(
      { stock_total: 1 },
      [aprovado, aprovado, aprovado],
      NOW
    );
    expect(stock.remaining).toBe(0);
    expect(stock.paidCount).toBe(3);
  });
});

describe("agrupamento por presente", () => {
  it("separa os pagamentos por gift_id e ignora orfaos", () => {
    const map = groupPaymentsByGift([
      { ...aprovado, gift_id: "a" },
      { ...aprovado, gift_id: "a" },
      { ...reservaAtiva, gift_id: "b" },
      { ...aprovado, gift_id: null },
    ]);

    expect(map.get("a")).toHaveLength(2);
    expect(map.get("b")).toHaveLength(1);
    expect(map.size).toBe(2);
  });
});
