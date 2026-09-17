"use client";

import Link from "next/link";
import { wedding } from "@/config/wedding";
import { Scene, Layer } from "@/components/motion/Scene";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Onde tudo acontece. Cerimonia e festa dividem o mesmo endereco, entao a
 * cena e uma so: o mapa de um lado, os detalhes do outro.
 *
 * O mapa e um `iframe` -- ele nao pode ser transformado junto com a camada
 * sem ficar borrado, entao quem se move e a moldura em volta dele.
 */
export function VenueScene() {
  const { venue, dateLabel } = wedding;

  return (
    <Scene
      as="section"
      mode="through"
      className="relative overflow-hidden bg-cream py-24 sm:py-32"
    >
      <div className="container-page relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* -- Texto ------------------------------------------------------- */}
        <Layer depth={38} className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow">O lugar</p>
          </Reveal>

          <SplitText
            as="h2"
            lines={["Cerimônia", "e festa,", "no mesmo lugar"]}
            className="display-lg mt-5 text-ink"
          />

          <Reveal delay={150} className="mt-8 space-y-1">
            <p className="font-serif text-2xl text-ink">{venue.name}</p>
            <p className="lede">{venue.address}</p>
            <p className="text-sm text-stone">
              {dateLabel} · às {venue.time}
            </p>
          </Reveal>

          <Reveal delay={260} className="mt-8 flex flex-wrap gap-3">
            <a
              href={venue.mapLink}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              Abrir no mapa
            </a>
            <Link href="/local" className="btn-outline">
              Ver a página do local
            </Link>
          </Reveal>
        </Layer>

        {/* -- Mapa -------------------------------------------------------- */}
        <Layer depth={-42} className="lg:col-span-7">
          <Reveal variant="scale" className="relative">
            {/* Moldura deslocada atrás do mapa: o segundo plano que dá
                espessura ao bloco. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-4 -right-4 hidden h-full w-full rounded-[1.25rem] border border-gold/55 sm:block"
            />
            <div className="relative overflow-hidden rounded-[1.25rem] border border-sand bg-white shadow-[0_40px_90px_-55px_rgba(25,20,16,0.6)]">
              <div className="aspect-[4/3] w-full sm:aspect-video">
                <iframe
                  title={`Mapa de ${venue.name}`}
                  src={venue.mapEmbedUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </Reveal>
        </Layer>
      </div>
    </Scene>
  );
}
