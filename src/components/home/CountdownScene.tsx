"use client";

import { wedding } from "@/config/wedding";
import { Countdown } from "@/components/Countdown";
import { Scene, Layer } from "@/components/motion/Scene";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";

/**
 * A contagem regressiva, sobre um fundo de arcos concentricos.
 *
 * Os arcos sao so bordas -- nenhum preenchimento, nenhuma imagem -- e cada um
 * anda a uma velocidade diferente. Custam quase nada e, em movimento, abrem
 * uma perspectiva atras dos numeros.
 */
export function CountdownScene() {
  const { date, dateLabel, timeLabel, venue } = wedding;

  return (
    <Scene
      as="section"
      mode="through"
      className="relative overflow-hidden bg-linen py-24 sm:py-32"
    >
      {/* -- Fundo: os arcos -------------------------------------------- */}
      {/* Grid com todos na mesma célula: ficam concêntricos sem `transform`
          de centralização, que brigaria com o `transform` das camadas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid place-items-center"
      >
        {[
          { size: "26rem", depth: -50, tone: "border-gold/25" },
          { size: "38rem", depth: -30, tone: "border-lilac/30" },
          { size: "50rem", depth: -14, tone: "border-sky/25" },
        ].map((ring) => (
          <Layer
            key={ring.size}
            depth={ring.depth}
            className={`col-start-1 row-start-1 shrink-0 rounded-full border ${ring.tone}`}
            style={{ width: ring.size, height: ring.size }}
          />
        ))}
      </div>

      <div className="container-page relative text-center">
        <Reveal>
          <p className="eyebrow">Contagem regressiva</p>
        </Reveal>

        <SplitText
          as="h2"
          lines={["Cada dia", "mais perto"]}
          className="display-lg mx-auto mt-5 max-w-3xl text-ink"
        />

        <Layer depth={-24} className="mt-12 sm:mt-16">
          <Countdown dateIso={date} />
        </Layer>

        <Reveal delay={180}>
          <p className="mt-10 text-[0.72rem] uppercase tracking-[0.26em] text-stone">
            {dateLabel} · {timeLabel} · {venue.name}
          </p>
        </Reveal>
      </div>
    </Scene>
  );
}
