"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";

function diff(target: number) {
  const now = Date.now();
  const delta = Math.max(0, target - now);
  const days = Math.floor(delta / 86_400_000);
  const hours = Math.floor((delta % 86_400_000) / 3_600_000);
  const minutes = Math.floor((delta % 3_600_000) / 60_000);
  const seconds = Math.floor((delta % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

/**
 * Contagem regressiva.
 *
 * Cada unidade fica numa moldura propria, e as quatro se movem em velocidades
 * ligeiramente diferentes conforme a pagina rola (`--depth` crescente): elas
 * parecem estar em planos distintos, e nao coladas num mesmo painel.
 */
export function Countdown({ dateIso }: { dateIso: string }) {
  const target = new Date(dateIso).getTime();

  // Comeca nulo de proposito: o servidor e o browser calculariam segundos
  // diferentes e o React acusaria erro de hidratacao, derrubando a pagina
  // inteira para renderizacao no client. O relogio so comeca apos montar.
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const items = [
    { label: "dias", value: t?.days, depth: -18 },
    { label: "horas", value: t?.hours, depth: -6 },
    { label: "min", value: t?.minutes, depth: 6 },
    { label: "seg", value: t?.seconds, depth: 18 },
  ];

  return (
    <div className="flex items-stretch justify-center gap-3 sm:gap-5 lg:gap-7">
      {items.map((it, i) => (
        <div
          key={it.label}
          className="layer w-full max-w-[9.5rem] flex-1"
          style={{ ["--depth" as string]: it.depth }}
        >
          <Reveal
            delay={i * 110}
            className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[1.25rem] border border-gold/25 bg-white/60 px-2 py-6 backdrop-blur-sm sm:px-5 sm:py-9"
          >
            {/* Brilho no topo do cartão, como luz batendo de cima. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gold/20 to-transparent"
            />
            <span className="relative block font-serif text-[2.4rem] font-light leading-none tabular-nums text-ink sm:text-6xl lg:text-7xl">
              {it.value === undefined ? (
                "--"
              ) : (
                // A chave troca junto com o valor: o número entra animado,
                // em vez de simplesmente aparecer trocado.
                <span
                  key={it.value}
                  className="animate-fade-up inline-block"
                  style={{ animationDuration: "0.55s" }}
                >
                  {String(it.value).padStart(2, "0")}
                </span>
              )}
            </span>
            <span className="relative mt-3 text-[0.6rem] uppercase tracking-[0.24em] text-stone sm:text-[0.68rem]">
              {it.label}
            </span>
          </Reveal>
        </div>
      ))}
    </div>
  );
}
