"use client";

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";
import { observeReveal } from "@/lib/motion";

type Props = {
  /** Uma linha por item. Cada linha quebra sozinha se nao couber. */
  lines: string | string[];
  as?: ElementType;
  className?: string;
  /** Intervalo entre palavras, em ms. */
  stagger?: number;
  delay?: number;
  style?: CSSProperties;
};

/**
 * Titulo que sobe palavra a palavra, cada uma saindo de dentro da propria
 * mascara -- como se o texto fosse impresso de baixo para cima.
 *
 * As palavras ja vem no HTML do servidor: quem tem JS desligado ou leitor de
 * tela recebe a frase inteira, normal. O que o JS faz e so acrescentar a
 * classe que dispara a subida.
 */
export function SplitText({
  lines,
  as: Tag = "span",
  className,
  stagger = 55,
  delay = 0,
  style,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return observeReveal(ref.current);
  }, []);

  const rows = Array.isArray(lines) ? lines : [lines];

  // O contador de palavras atravessa as linhas: a cascata continua de uma
  // linha para a outra em vez de reiniciar.
  let wordIndex = 0;

  return (
    <Tag
      // eslint-disable-next-line -- ref polimorfico: o elemento muda conforme `as`
      ref={ref as any}
      data-split=""
      className={className}
      style={{
        ["--stagger" as string]: `${stagger}ms`,
        ...(delay ? { ["--reveal-delay" as string]: `${delay}ms` } : null),
        ...style,
      }}
    >
      {rows.map((row, r) => (
        <span className="split-line" key={r}>
          {row.split(" ").map((word, w) => {
            const i = wordIndex++;
            return (
              // O espaco vive FORA da mascara: dentro dela seria cortado
              // junto com a palavra e tudo colaria.
              <span key={`${r}-${w}`}>
                {w > 0 ? " " : null}
                <span className="split-word">
                  <span style={{ ["--i" as string]: i }}>{word}</span>
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
