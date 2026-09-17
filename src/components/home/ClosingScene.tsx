"use client";

import Image from "next/image";
import Link from "next/link";
import { wedding } from "@/config/wedding";
import { Scene, Layer } from "@/components/motion/Scene";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Ultima cena: a foto do pôr do sol e o pedido de confirmacao.
 *
 * Fecha o arco que o hero abriu -- la era o casal caminhando para o mar sob o
 * sol alto; aqui e o fim da tarde. A foto cresce devagar enquanto a cena
 * passa, e o texto sobe na frente dela.
 */
export function ClosingScene() {
  const { home, rsvp, couple } = wedding;

  return (
    <Scene
      as="section"
      mode="through"
      className="relative overflow-hidden bg-night"
    >
      {/* -- Plano 1: o fim de tarde ------------------------------------- */}
      <Layer
        depth={-70}
        zoom={0.1}
        scale={1.05}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <Image
          src="/images/ensaio/ensaio-11.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[55%_32%]"
        />
      </Layer>

      {/* -- Plano 2: o véu ---------------------------------------------- */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-night/88 via-night/50 to-night/95"
      />
      {/* Sombra redonda so atras do texto: a hora dourada continua aparecendo
          nas bordas, e as letras claras ganham uma base escura no meio, onde
          o sol e mais forte. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(62% 52% at 50% 42%, rgba(11,21,32,0.62), transparent 72%)",
        }}
      />
      <div
        aria-hidden="true"
        className="grain pointer-events-none absolute inset-0 overflow-hidden"
      />

      {/* -- Plano 3: o texto -------------------------------------------- */}
      <Layer
        depth={-46}
        className="container-page relative py-28 text-center sm:py-36 lg:py-44"
      >
        <Reveal>
          <p className="eyebrow-light">{home.closing.eyebrow}</p>
        </Reveal>

        <SplitText
          as="h2"
          lines={[...home.closing.lines]}
          stagger={90}
          className="display-xl mt-6 text-cream"
        />

        <Reveal delay={200} className="mt-12 flex flex-col items-center gap-6">
          <span className="rule-gold" />
          <p className="lede-light max-w-md">
            {rsvp.deadlineLabel}. Depois disso, a lista vai para o buffet — e
            queremos muito o seu nome nela.
          </p>
          <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/rsvp" className="btn-light w-full sm:w-auto">
              Confirmar Presença
            </Link>
            <Link href="/presentes" className="btn-light w-full sm:w-auto">
              Lista de Presentes
            </Link>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <p className="mt-16 font-serif text-2xl font-light italic text-cream/70">
            Com amor, {couple.bride} &amp; {couple.groom}
          </p>
        </Reveal>
      </Layer>
    </Scene>
  );
}
