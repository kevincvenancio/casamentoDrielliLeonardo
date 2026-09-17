import Link from "next/link";
import { wedding } from "@/config/wedding";
import { RsvpForm } from "@/components/RsvpForm";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Scene, Layer } from "@/components/motion/Scene";

export const metadata = { title: "Confirmar Presença" };

export default function RsvpPage() {
  const { venue, dateLabel, timeLabel, rsvp, dressCode } = wedding;

  // Repetidos aqui de proposito: quem chega direto neste link (e muita gente
  // chega, e o botao que mais circula no convite) precisa ver data, lugar e
  // traje sem ter de sair da pagina.
  const facts = [
    { label: "Quando", value: `${dateLabel}, às ${timeLabel}` },
    { label: "Onde", value: `${venue.name} — ${venue.address}` },
    { label: "Traje", value: dressCode.style },
    { label: "Prazo", value: rsvp.deadlineLabel },
  ];

  return (
    <>
      <PageHero
        eyebrow={rsvp.deadlineLabel}
        title={["Confirme", "sua presença"]}
        text="Nos ajuda a organizar os lugares e o buffet. Leva menos de um minuto."
        photo="/images/ensaio/ensaio-11.jpg"
        alt=""
        objectPosition="60% 45%"
      />

      <Scene
        as="section"
        mode="through"
        className="relative overflow-hidden bg-cream py-20 sm:py-28"
      >
        <Layer
          depth={-70}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(179,166,218,0.45), transparent 68%)",
          }}
        />

        <div className="container-page relative grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* -- O essencial ---------------------------------------------- */}
          <Layer depth={28} className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">O essencial</p>
              <h2 className="display-md mt-4 text-ink">
                Tudo o que você precisa saber antes de confirmar
              </h2>
            </Reveal>

            <dl className="mt-10 space-y-6">
              {facts.map((fact, i) => (
                <Reveal
                  key={fact.label}
                  delay={120 + i * 90}
                  className="border-t border-sand pt-4"
                >
                  <dt className="text-[0.64rem] uppercase tracking-[0.26em] text-gold">
                    {fact.label}
                  </dt>
                  <dd className="mt-2 text-ink">{fact.value}</dd>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={520} className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/dress-code" className="link-underline text-sm">
                Ver o dress code
              </Link>
              <Link href="/local" className="link-underline text-sm">
                Como chegar
              </Link>
              <Link href="/manual-do-convidado" className="link-underline text-sm">
                Manual do convidado
              </Link>
            </Reveal>
          </Layer>

          {/* -- O formulário --------------------------------------------- */}
          <Layer depth={-28} className="lg:col-span-7">
            <Reveal variant="scale" className="mx-auto w-full max-w-lg lg:ml-auto lg:mr-0">
              <RsvpForm maxCompanions={rsvp.maxCompanions} />
            </Reveal>
          </Layer>
        </div>
      </Scene>
    </>
  );
}
