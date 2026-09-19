"use client";

import Image from "next/image";
import { wedding } from "@/config/wedding";
import { Scene, Layer } from "@/components/motion/Scene";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Segunda cena: o convite.
 *
 * Depois do mergulho escuro do hero, a pagina respira em marfim. O monograma
 * do casal aparece aqui, e nao sobre a foto, porque o desenho e feito de
 * tracos finos e escuros -- so tem presenca sobre fundo claro.
 *
 * A profundidade vem de tres planos: manchas de cor bem ao fundo, a moldura
 * em arco no meio e o texto na frente, cada um a uma velocidade.
 */
export function InvitationScene() {
  const { home, couple, logo } = wedding;

  return (
    <Scene
      as="section"
      mode="through"
      className="relative overflow-hidden bg-cream py-28 sm:py-36 lg:py-44"
    >
      {/* -- Fundo: manchas de cor ---------------------------------------- */}
      {/* Os lilases e azuis do monograma, diluidos. Sao gradientes radiais,
          nao imagens desfocadas: nascem suaves e nao custam nada. */}
      <Layer
        depth={-90}
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 h-[26rem] w-[26rem] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(179,166,218,0.5), transparent 68%)",
        }}
      />
      <Layer
        depth={70}
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-0 h-[30rem] w-[30rem] rounded-full opacity-45"
        style={{
          background:
            "radial-gradient(circle, rgba(143,169,201,0.5), transparent 68%)",
        }}
      />

      <div className="container-page relative grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
        {/* -- Meio: o monograma na moldura em arco ----------------------- */}
        <Layer depth={-45} className="lg:col-span-5">
          <Reveal variant="scale" className="relative mx-auto w-full max-w-[19rem]">
            <div className="arch relative overflow-hidden border border-gold/35 bg-gradient-to-b from-white to-linen p-10 shadow-[0_40px_90px_-50px_rgba(25,20,16,0.55)]">
              {/* Arco interno, um fio a poucos milimetros do primeiro. */}
              <span
                aria-hidden="true"
                className="arch pointer-events-none absolute inset-3 border border-gold/20"
              />
              <div className="animate-drift relative aspect-[3/4]">
                {logo ? (
                  <Image
                    src={logo}
                    alt={`Monograma de ${couple.bride} e ${couple.groom}`}
                    fill
                    sizes="(max-width: 1024px) 60vw, 19rem"
                    className="object-contain"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center font-serif text-5xl text-ink">
                    {couple.bride[0]} &amp; {couple.groom[0]}
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        </Layer>

        {/* -- Frente: o texto -------------------------------------------- */}
        <Layer depth={45} className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow">{home.invitation.eyebrow}</p>
          </Reveal>

          <SplitText
            as="h2"
            lines={[...home.invitation.lines]}
            stagger={48}
            className="display-lg mt-6 text-ink"
          />

          <Reveal delay={200} className="mt-8 flex items-center gap-5">
            <span className="rule-gold shrink-0" />
            <p className="lede max-w-md">{home.invitation.text}</p>
          </Reveal>
        </Layer>
      </div>
    </Scene>
  );
}
