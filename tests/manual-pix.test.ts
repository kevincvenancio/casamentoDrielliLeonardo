import { describe, it, expect } from "vitest";
import { parseBRLToCents, validateManualPix } from "@/lib/manual-pix";

describe("parseBRLToCents", () => {
  it.each([
    ["150", 15000],
    ["150,5", 15050],
    ["150,50", 15050],
    ["0,99", 99],
    ["1.500", 150000],
    ["1.500,00", 150000],
    ["12.345,67", 1234567],
    ["1.000.000", 100000000],
    ["R$ 1.500,00", 150000],
    ["r$150", 15000],
    ["  200  ", 20000],
    ["1 500", 150000],
    ["150.50", 15050],
    ["150.5", 15050],
  ])("le %s como %i centavos", (input, cents) => {
    expect(parseBRLToCents(input)).toBe(cents);
  });

  it.each([
    "",
    "abc",
    "-50",
    "1,500,00",
    "150,505",
    "1.50,00",
    "15.00.00",
    "9999999999999",
  ])("recusa %j", (input) => {
    expect(parseBRLToCents(input)).toBeNull();
  });
});

describe("validateManualPix", () => {
  it("aceita nome e valor validos, limpando os espacos do nome", () => {
    expect(
      validateManualPix({ donorName: "  Tia   Marta ", amount: "300,00" })
    ).toEqual({ ok: true, donorName: "Tia Marta", amountCents: 30000 });
  });

  it("exige nome", () => {
    const res = validateManualPix({ donorName: "   ", amount: "100" });
    expect(res.ok).toBe(false);
  });

  it("recusa nome que nao e texto", () => {
    expect(validateManualPix({ donorName: 42, amount: "100" }).ok).toBe(false);
  });

  it("recusa valor zero", () => {
    const res = validateManualPix({ donorName: "Ana", amount: "0,00" });
    expect(res).toEqual({
      ok: false,
      error: "O valor precisa ser maior que zero.",
    });
  });

  it("recusa valor como numero (o formulario sempre manda texto)", () => {
    expect(validateManualPix({ donorName: "Ana", amount: 100 }).ok).toBe(false);
  });

  it("recusa valor acima do teto", () => {
    const res = validateManualPix({ donorName: "Ana", amount: "100.000,01" });
    expect(res.ok).toBe(false);
  });

  it("aceita exatamente o teto", () => {
    const res = validateManualPix({ donorName: "Ana", amount: "100.000,00" });
    expect(res).toEqual({ ok: true, donorName: "Ana", amountCents: 10000000 });
  });
});
