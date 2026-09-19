"use client";

import Image from "next/image";
import Link from "next/link";
import { wedding } from "@/config/wedding";
import { Scene, Layer } from "@/components/motion/Scene";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { focusOf } from "@/lib/photo-focus";

/**
 * Primeira cena: a foto do casal caminhando para o mar, em tela cheia.
 *
 * O trecho tem 170vh de altura e o conteudo dentro dele fica preso (sticky)
 * por uma tela inteira. Enquanto a pessoa rola essa sobra, os planos se
 * separam: a foto afunda devagar e cresce, a bruma sobe um pouco, o texto
 * sobe bem mais rapido e se apaga. E o que da a sensacao de profundidade --
 * cada plano a uma distancia diferente do olho.
 */
export function HeroScene() {
  const { couple, dateLabel, timeLabel, tagline, venue } = wedding;

  return (
    <Scene mode="pin" as="section" className="relative h-[170vh]">
      <div className="scene-sticky bg-night">
        {/* -- Plano 1: a fotografia -------------------------------------- */}
        <Layer
          depth={90}
          zoom={0.14}
          scale={1.04}
          className="absolute inset-0 origin-center"
        >
          <Image
            src="/images/ensaio/ensaio-08.jpg"
            alt={`${couple.bride} e ${couple.groom} de mãos dadas, caminhando em direção ao mar`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: focusOf("/images/ensaio/ensaio-08.jpg") }}
          />
        </Layer>

        {/* -- Plano 2: luz e sombra -------------------------------------- */}
        {/* Dois degrades cruzados escurecem topo e base o suficiente para o
            texto ter contraste, deixando o mar aberto no meio. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/25 to-night"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent"
        />

        {/* -- Plano 3: bruma ---------------------------------------------- */}
        {/* Um halo quente no horizonte, como a luz do fim da tarde. Sai no
            modo leve: e o unico desfoque grande da cena. */}
        <Layer
          depth={-40}
          aria-hidden="true"
          className="absolute inset-x-0 top-[38%] h-[46%] opacity-60"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(196,160,99,0.5), rgba(143,169,201,0.18) 55%, transparent 75%)",
          }}
        />

        {/* -- Plano 4: o texto -------------------------------------------- */}
        <Layer
          depth={-170}
          fade={0.85}
          className="relative flex h-full flex-col items-center justify-center px-5 text-center"
          style={{ paddingTop: "var(--header-h)" }}
        >
          <SplitText
            as="p"
            lines={tagline}
            stagger={70}
            className="eyebrow-light mb-6 sm:mb-8"
          />

          <h1 className="display-xl text-cream">
            <SplitText as="span" lines={couple.bride} delay={120} />
            <span
              aria-hidden="true"
              className="mx-3 inline-block align-baseline font-serif text-[0.42em] italic text-gold sm:mx-5"
            >
              &
            </span>
            <SplitText as="span" lines={couple.groom} delay={320} />
          </h1>

          <Reveal
            delay={620}
            className="mt-8 flex flex-col items-center gap-5 sm:mt-10"
          >
            <span className="rule-gold" />
            <p className="font-serif text-xl font-light tracking-[0.1em] text-cream sm:text-2xl">
              {dateLabel}
            </p>
            <p className="text-[0.7rem] uppercase tracking-[0.26em] text-cream/60">
              {venue.name} · {timeLabel}
            </p>
          </Reveal>

          <Reveal
            delay={820}
            className="mt-10 flex w-full max-w-sm flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center"
          >
            <Link href="/rsvp" className="btn-light w-full sm:w-auto">
              Confirmar Presença
            </Link>
            <Link href="/presentes" className="btn-light w-full sm:w-auto">
              Lista de Presentes
            </Link>
          </Reveal>
        </Layer>

        {/* -- Plano 5: grao ----------------------------------------------- */}
        <div
          aria-hidden="true"
          className="grain pointer-events-none absolute inset-0 overflow-hidden"
        />

        {/* -- Plano 6: o convite para rolar -------------------------------- */}
        {/* Só o fio, sem a palavra "role": o texto ficava colado nos botões
            em telas de 900px de altura, e um traço descendo já diz o que é. */}
        <Layer
          depth={-60}
          fade={1}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center"
        >
          <span className="relative block h-11 w-px overflow-hidden bg-cream/25">
            <span className="animate-cue-slide absolute inset-x-0 top-0 block h-1/2 bg-gold" />
          </span>
        </Layer>
      </div>
    </Scene>
  );
}
