import { describe, it, expect } from "vitest";
import { reserveGiftUnit, type ReserveStore } from "@/lib/reserve-core";

/**
 * Store em memoria que imita a funcao SQL `reserve_gift_unit`:
 * conta o que ja foi reservado/vendido e so entao "insere o payment".
 *
 * O FOR UPDATE do Postgres serializa checkouts concorrentes do mesmo
 * presente; aqui o JS e single-threaded e o corpo do reserveUnit nao tem
 * await, entao a serializacao acontece de graca -- mesma semantica.
 */
function makeStore(gift: {
  id?: string;
  stockTotal: number | null;
  active?: boolean;
  priceCents?: number;
  title?: string;
}): ReserveStore & { taken: number } {
  const id = gift.id ?? "gift-1";
  const state = { taken: 0 };

  return {
    get taken() {
      return state.taken;
    },
    async reserveUnit({ giftId }) {
      if (giftId !== id) {
        return {
          outcome: "not_found",
          paymentId: null,
          unitPriceCents: null,
          giftTitle: null,
        };
      }
      if (gift.active === false) {
        return {
          outcome: "inactive",
          paymentId: null,
          unitPriceCents: null,
          giftTitle: gift.title ?? "Item",
        };
      }
      if (gift.stockTotal !== null && state.taken >= gift.stockTotal) {
        return {
          outcome: "sold_out",
          paymentId: null,
          unitPriceCents: null,
          giftTitle: gift.title ?? "Item",
        };
      }
      state.taken++;
      return {
        outcome: "ok",
        paymentId: `pay-${state.taken}`,
        unitPriceCents: gift.priceCents ?? 10000,
        giftTitle: gift.title ?? "Item",
      };
    },
  };
}

const comprar = (store: ReserveStore, giftId = "gift-1") =>
  reserveGiftUnit({ giftId, buyerName: "Fulano", store });

describe("reserva de unidade", () => {
  it("reserva com sucesso e devolve preco e titulo vindos do banco", async () => {
    const store = makeStore({
      stockTotal: null,
      priceCents: 25000,
      title: "Jogo de taças de cristal",
    });

    const res = await comprar(store);

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.paymentId).toBe("pay-1");
      expect(res.priceCents).toBe(25000);
      expect(res.giftTitle).toBe("Jogo de taças de cristal");
    }
  });

  it("retorna 404 quando o presente nao existe", async () => {
    const store = makeStore({ stockTotal: null });
    const res = await comprar(store, "inexistente");

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(404);
  });

  it("retorna 409 quando o presente esta desativado", async () => {
    const store = makeStore({ stockTotal: null, active: false });
    const res = await comprar(store);

    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(409);
  });
});

describe("compras repetidas do mesmo presente", () => {
  it("estoque ilimitado: o presente continua compravel indefinidamente", async () => {
    const store = makeStore({ stockTotal: null });

    const compras = [];
    for (let i = 0; i < 25; i++) compras.push(await comprar(store));

    expect(compras.every((r) => r.ok)).toBe(true);
    expect(store.taken).toBe(25);
  });

  it("estoque 10: dez compras passam, a decima primeira da 409", async () => {
    const store = makeStore({
      stockTotal: 10,
      title: "Jogo de taças de cristal",
    });

    const dez = [];
    for (let i = 0; i < 10; i++) dez.push(await comprar(store));
    expect(dez.every((r) => r.ok)).toBe(true);

    const decimaPrimeira = await comprar(store);
    expect(decimaPrimeira.ok).toBe(false);
    if (!decimaPrimeira.ok) expect(decimaPrimeira.status).toBe(409);
    expect(store.taken).toBe(10);
  });

  it("corrida: checkouts simultaneos nao furam o estoque", async () => {
    const store = makeStore({ stockTotal: 3 });

    const resultados = await Promise.all(
      Array.from({ length: 8 }, () => comprar(store))
    );

    expect(resultados.filter((r) => r.ok)).toHaveLength(3);
    expect(resultados.filter((r) => !r.ok)).toHaveLength(5);
    expect(store.taken).toBe(3);
  });
});

describe("contrato com o SQL", () => {
  it("falha alto se a RPC devolver 'ok' sem os dados da reserva", async () => {
    const store: ReserveStore = {
      async reserveUnit() {
        return {
          outcome: "ok",
          paymentId: null,
          unitPriceCents: null,
          giftTitle: null,
        };
      },
    };

    await expect(comprar(store)).rejects.toThrow(/reserve_gift_unit/);
  });
});
