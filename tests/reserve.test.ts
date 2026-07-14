import { describe, it, expect } from "vitest";
import { reserveGift, type ReserveStore } from "@/lib/reserve-core";
import type { Gift } from "@/lib/types";

/**
 * Store em memoria que imita o UPDATE ... WHERE status='available'
 * de forma atomica: apenas o PRIMEIRO reserveIfAvailable "afeta linha".
 */
function makeStore(initial: Gift): ReserveStore {
  const g = { ...initial };
  return {
    async getGift(id) {
      return id === g.id ? { ...g } : null;
    },
    async reserveIfAvailable(id, until) {
      if (id !== g.id) return false;
      if (g.status !== "available") return false; // WHERE status='available'
      g.status = "reserved";
      g.reserved_until = until;
      return true;
    },
  };
}

function baseGift(over: Partial<Gift> = {}): Gift {
  return {
    id: "gift-1",
    title: "Item",
    description: null,
    image_url: null,
    price_cents: 10000,
    status: "available",
    reserved_until: null,
    sort_order: 1,
    created_at: new Date().toISOString(),
    ...over,
  };
}

describe("reserva de presente", () => {
  it("reserva com sucesso quando disponivel", async () => {
    const store = makeStore(baseGift());
    const res = await reserveGift({ giftId: "gift-1", store });
    expect(res.ok).toBe(true);
  });

  it("retorna 404 quando o presente nao existe", async () => {
    const store = makeStore(baseGift());
    const res = await reserveGift({ giftId: "inexistente", store });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(404);
  });

  it("retorna 409 quando o presente ja esta reservado/pago", async () => {
    const store = makeStore(baseGift({ status: "reserved" }));
    const res = await reserveGift({ giftId: "gift-1", store });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(409);
  });

  it("corrida entre dois checkouts: o segundo recebe 409", async () => {
    const store = makeStore(baseGift());

    // Ambos leem 'available' e tentam reservar. A reserva condicional e
    // atomica: so o primeiro ganha; o segundo recebe 0 linhas -> 409.
    const [first, second] = await Promise.all([
      reserveGift({ giftId: "gift-1", store }),
      reserveGift({ giftId: "gift-1", store }),
    ]);

    const oks = [first, second].filter((r) => r.ok);
    const conflicts = [first, second].filter((r) => !r.ok);

    expect(oks).toHaveLength(1);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].ok).toBe(false);
    if (!conflicts[0].ok) expect(conflicts[0].status).toBe(409);
  });
});
