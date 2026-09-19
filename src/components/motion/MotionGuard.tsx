"use client";

import { useEffect } from "react";

/**
 * Rede de seguranca do desempenho.
 *
 * O script inline do layout so consegue adivinhar o porte do aparelho pelos
 * dados que o navegador expoe -- e varios nao expoem nada. Este componente
 * mede o que realmente importa: a taxa de quadros durante a primeira rolagem
 * de verdade. Se o aparelho nao esta dando conta, ele entra em modo leve
 * (`data-lite`), que desliga desfoques e texturas e deixa so as camadas em
 * movimento.
 *
 * A medicao dura poucos segundos e depois se desliga sozinha: nada fica
 * rodando em segundo plano pelo resto da visita.
 */
export function MotionGuard() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.lite === "1") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frames = 0;
    let start = 0;
    let raf = 0;
    let measuring = false;
    let finished = false;

    function sample(now: number) {
      if (!start) start = now;
      frames++;
      const elapsed = now - start;

      // Amostra de 1,2s: tempo suficiente para separar um aparelho travando
      // de um solavanco isolado.
      if (elapsed < 1200) {
        raf = requestAnimationFrame(sample);
        return;
      }

      const fps = (frames * 1000) / elapsed;
      finished = true;
      measuring = false;
      if (fps < 38) root.dataset.lite = "1";
      cleanup();
    }

    function onFirstScroll() {
      if (measuring || finished) return;
      measuring = true;
      frames = 0;
      start = 0;
      raf = requestAnimationFrame(sample);
    }

    function cleanup() {
      window.removeEventListener("scroll", onFirstScroll);
      if (raf) cancelAnimationFrame(raf);
    }

    window.addEventListener("scroll", onFirstScroll, { passive: true });

    // Ninguem rolou em 15s? A medicao perdeu a validade -- encerra.
    const giveUp = window.setTimeout(() => {
      if (!measuring) {
        finished = true;
        cleanup();
      }
    }, 15_000);

    return () => {
      window.clearTimeout(giveUp);
      cleanup();
    };
  }, []);

  return null;
}
