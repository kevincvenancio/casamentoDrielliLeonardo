/**
 * Validacao do lancamento manual de Pix no painel.
 *
 * Modulo puro (sem IO): roda no formulario, para mostrar o valor
 * interpretado enquanto a pessoa digita, e na API, que e quem decide.
 */

/** Teto de um lancamento: pega erro de digitacao (um zero a mais). */
export const MAX_MANUAL_PIX_CENTS = 100_000_00; // R$ 100.000,00
export const MAX_DONOR_NAME_LENGTH = 120;

/**
 * Le um valor em reais escrito como uma pessoa escreveria e devolve
 * centavos, ou null se nao der para ler sem adivinhar.
 *
 * Aceita: "150", "150,5", "150,50", "1.500", "1.500,00", "R$ 1.500,00"
 * e tambem o ponto decimal de teclado americano: "150.50".
 *
 * Um ponto seguido de exatamente 3 digitos e separador de milhar
 * ("1.500" = mil e quinhentos), como se escreve no Brasil.
 *
 * A conta e feita em inteiros: nada de float no caminho do dinheiro.
 */
export function parseBRLToCents(input: string): number | null {
  const s = input.replace(/R\$/gi, "").replace(/\s+/g, "");

  let inteiro: string;
  let fracao: string;

  let m: RegExpMatchArray | null;
  if ((m = s.match(/^(\d{1,3}(?:\.\d{3})+)(?:,(\d{1,2}))?$/))) {
    // 1.500 / 1.500,00
    inteiro = m[1].replace(/\./g, "");
    fracao = m[2] ?? "";
  } else if ((m = s.match(/^(\d+)(?:,(\d{1,2}))?$/))) {
    // 150 / 150,50
    inteiro = m[1];
    fracao = m[2] ?? "";
  } else if ((m = s.match(/^(\d+)\.(\d{1,2})$/))) {
    // 150.50
    inteiro = m[1];
    fracao = m[2];
  } else {
    return null;
  }

  // Inteiro gigante estouraria a precisao antes de chegar no teto.
  if (inteiro.replace(/^0+/, "").length > 9) return null;

  return Number(inteiro) * 100 + Number(fracao.padEnd(2, "0"));
}

export type ManualPixInput =
  | { ok: true; donorName: string; amountCents: number }
  | { ok: false; error: string };

/** Valida o que veio do formulario. Mensagens prontas para a tela. */
export function validateManualPix(body: {
  donorName?: unknown;
  amount?: unknown;
}): ManualPixInput {
  const donorName =
    typeof body.donorName === "string"
      ? body.donorName.trim().replace(/\s+/g, " ")
      : "";
  if (!donorName) {
    return { ok: false, error: "Informe o nome de quem fez o Pix." };
  }
  if (donorName.length > MAX_DONOR_NAME_LENGTH) {
    return {
      ok: false,
      error: `Nome muito longo (máximo de ${MAX_DONOR_NAME_LENGTH} caracteres).`,
    };
  }

  const amountCents =
    typeof body.amount === "string" ? parseBRLToCents(body.amount) : null;
  if (amountCents == null) {
    return {
      ok: false,
      error: "Valor inválido. Use, por exemplo, 150 ou 1.500,00.",
    };
  }
  if (amountCents <= 0) {
    return { ok: false, error: "O valor precisa ser maior que zero." };
  }
  if (amountCents > MAX_MANUAL_PIX_CENTS) {
    return {
      ok: false,
      error: "Valor acima de R$ 100.000,00. Confira se não sobrou um zero.",
    };
  }

  return { ok: true, donorName, amountCents };
}
