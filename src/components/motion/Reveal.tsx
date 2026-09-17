"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { observeReveal } from "@/lib/motion";

type RevealVariant = "up" | "blur" | "clip" | "left" | "right" | "scale";

type Props = {
  children: ReactNode;
  /** Forma de entrada. "up" (padrao) sobe; "clip" descortina de cima para baixo. */
  variant?: RevealVariant;
  /** Atraso em ms -- use para escalonar itens de uma mesma lista. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  /** Elemento renderizado. `span` quando o pai for um paragrafo ou titulo. */
  as?: "div" | "span" | "li" | "section" | "header" | "p" | "figure";
};

const variantVars: Record<RevealVariant, CSSProperties> = {
  up: {},
  blur: { ["--reveal-y" as string]: "16px" },
  clip: {},
  left: { ["--reveal-x" as string]: "-36px", ["--reveal-y" as string]: "0px" },
  right: { ["--reveal-x" as string]: "36px", ["--reveal-y" as string]: "0px" },
  scale: { ["--reveal-scale" as string]: "1.06", ["--reveal-y" as string]: "0px" },
};

/**
 * Revela o bloco quando ele entra na tela. A animacao mora no CSS
 * (`[data-reveal]` em globals.css); aqui so ligamos o observador.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  style,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return observeReveal(ref.current);
  }, []);

  return (
    <Tag
      // eslint-disable-next-line -- ref polimorfico: o elemento muda conforme `as`
      ref={ref as any}
      data-reveal={variant === "blur" || variant === "clip" ? variant : ""}
      className={className}
      style={{
        ...variantVars[variant],
        ...(delay ? { ["--reveal-delay" as string]: `${delay}ms` } : null),
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
