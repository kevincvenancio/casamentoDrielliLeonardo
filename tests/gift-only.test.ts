import { describe, it, expect, vi, afterEach } from "vitest";
import { isGiftOnly, returnBasePath } from "@/lib/gift-only";
import { createPreference } from "@/lib/mercadopago";

describe("isGiftOnly", () => {
  it.each([
    ["/presentear", true],
    ["/presentear/sucesso", true],
    ["/presentear/erro", true],
    ["/presentes", false],
    ["/presenteara", false],
    ["/", false],
    [null, false],
  ])("%s -> %s", (pathname, expected) => {
    expect(isGiftOnly(pathname)).toBe(expected);
  });
});

describe("createPreference: telas de retorno", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  async function backUrlsFor(returnPath?: string) {
    vi.stubEnv("MP_ACCESS_TOKEN", "test-token");
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ id: "pref", init_point: "https://mp" })),
    );
    vi.stubGlobal("fetch", fetchMock);

    await createPreference({
      title: "Jogo de panelas",
      amountCents: 15000,
      externalReference: "ref",
      siteUrl: "https://site.test",
      returnPath,
    });

    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    return JSON.parse(init.body as string).back_urls;
  }

  it("o site volta para /pagamento", async () => {
    expect(await backUrlsFor(returnBasePath("site"))).toEqual({
      success: "https://site.test/pagamento/sucesso",
      pending: "https://site.test/pagamento/pendente",
      failure: "https://site.test/pagamento/erro",
    });
  });

  it("sem returnPath continua em /pagamento", async () => {
    expect((await backUrlsFor()).success).toBe(
      "https://site.test/pagamento/sucesso",
    );
  });

  it("a pagina avulsa volta para /presentear", async () => {
    expect(await backUrlsFor(returnBasePath("avulso"))).toEqual({
      success: "https://site.test/presentear/sucesso",
      pending: "https://site.test/presentear/pendente",
      failure: "https://site.test/presentear/erro",
    });
  });
});
