/**
 * Pagina de presentes "avulsa": o link que se manda para quem quer
 * presentear o casal mas nao foi convidado. Mostra so a lista e o Pix --
 * nada de local, horario, RSVP nem menu levando ao resto do site.
 *
 * O resto do site continua publico; isto so evita que o link entregue de
 * bandeja o que a pessoa nao precisa ver.
 */
export const GIFT_ONLY_PATH = "/presentear";

export function isGiftOnly(pathname: string | null): boolean {
  return (
    pathname === GIFT_ONLY_PATH ||
    (pathname?.startsWith(`${GIFT_ONLY_PATH}/`) ?? false)
  );
}

/**
 * Para onde o Mercado Pago devolve a pessoa depois do pagamento. Quem veio
 * da pagina avulsa volta para telas de retorno que tambem nao mostram o
 * resto do site.
 */
export type CheckoutOrigin = "site" | "avulso";

export function returnBasePath(origin: CheckoutOrigin): string {
  return origin === "avulso" ? GIFT_ONLY_PATH : "/pagamento";
}
