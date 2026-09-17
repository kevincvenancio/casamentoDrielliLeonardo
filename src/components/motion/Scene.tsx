"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { observeScene, type SceneMode } from "@/lib/motion";

type SceneProps = {
  children: ReactNode;
  /** Ver `SceneMode` em src/lib/motion.ts. */
  mode?: SceneMode;
  className?: string;
  style?: CSSProperties;
  /** Recebe o progresso (0 a 1) a cada frame. Use so quando o CSS nao basta. */
  onProgress?: (p: number) => void;
  as?: "div" | "section" | "header" | "footer";
};

/**
 * Delimita um trecho de rolagem e publica o progresso dele na variavel CSS
 * `--p`, que todos os descendentes herdam. As camadas (`<Layer>`) leem essa
 * variavel para se mover em velocidades diferentes.
 */
export function Scene({
  children,
  mode = "through",
  className,
  style,
  onProgress,
  as: Tag = "div",
}: SceneProps) {
  const ref = useRef<HTMLElement>(null);

  // O callback fica num ref: se ele entrasse nas dependencias do efeito, uma
  // funcao escrita direto no JSX (nova a cada render) faria a cena se
  // registrar e se cancelar sem parar.
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;

  useEffect(() => {
    if (!ref.current) return;
    return observeScene(ref.current, mode, {
      onProgress: (p) => progressRef.current?.(p),
    });
  }, [mode]);

  return (
    // eslint-disable-next-line -- ref polimorfico: o elemento muda conforme `as`
    <Tag ref={ref as any} className={className} style={style}>
      {children}
    </Tag>
  );
}

type LayerProps = {
  children?: ReactNode;
  /**
   * Distancia do plano, em pixels de deslocamento ao longo da cena inteira.
   * Negativo sobe (plano de fundo, mais lento); positivo desce.
   * Fundo ~ -40, meio ~ 60, frente ~ 160.
   */
  depth?: number;
  /** Deslocamento horizontal, na mesma escala de `depth`. */
  depthX?: number;
  /** Escala fixa da camada -- util para fundos que precisam de folga ao mover. */
  scale?: number;
  /** Quanto a camada cresce do inicio ao fim da cena (0.12 = +12%). */
  zoom?: number;
  /** Quanto a camada se apaga ao longo da cena (1 = some por completo). */
  fade?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "span" | "figure";
  /** Camadas puramente decorativas saem da arvore de acessibilidade. */
  "aria-hidden"?: boolean | "true" | "false";
};

/**
 * Uma camada dentro de uma `<Scene>`. So mexe em `transform`, entao o
 * navegador compoe na GPU sem repintar.
 */
export function Layer({
  children,
  depth = 0,
  depthX,
  scale,
  zoom,
  fade,
  className,
  style,
  as: Tag = "div",
  "aria-hidden": ariaHidden,
}: LayerProps) {
  return (
    <Tag
      aria-hidden={ariaHidden}
      className={`layer ${className ?? ""}`}
      style={{
        ["--depth" as string]: depth,
        ...(depthX ? { ["--depth-x" as string]: depthX } : null),
        ...(scale ? { ["--layer-scale" as string]: scale } : null),
        ...(zoom ? { ["--zoom" as string]: zoom } : null),
        ...(fade ? { ["--fade" as string]: fade } : null),
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
