import { wedding } from "@/config/wedding";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Scene, Layer } from "@/components/motion/Scene";

export const metadata = { title: "Local" };

export default function VenuePage() {
  const { venue, dateLabel, timeLabel } = wedding;

  const details = [
    { label: "Endereço", value: venue.address },
    { label: "Data", value: dateLabel },
    { label: "Horário", value: `Cerimônia às ${timeLabel}` },
  ];

  return (
    <>
      <PageHero
        eyebrow="O lugar"
        title={["Cerimônia", "& Festa"]}
        text="A cerimônia e a festa acontecem no mesmo endereço. Será uma alegria ter você conosco."
        photo="/images/ensaio/ensaio-02.jpg"
        alt=""
        objectPosition="50% 35%"
      />

      <Scene
        as="section"
        mode="through"
        className="relative overflow-hidden bg-cream py-24 sm:py-32"
      >
        <div className="container-page relative grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* -- Detalhes ------------------------------------------------- */}
          {/* Sem `sticky` aqui: a camada já carrega um `transform` próprio, e
              as duas coisas juntas fariam o bloco escorregar enquanto preso. */}
          <Layer depth={34} className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">Cerimônia e festa</p>
              <h2 className="display-md mt-4 text-ink">{venue.name}</h2>
            </Reveal>

            <dl className="mt-10 space-y-7">
              {details.map((item, i) => (
                <Reveal key={item.label} delay={120 + i * 100}>
                  <dt className="text-[0.66rem] uppercase tracking-[0.26em] text-gold">
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-ink">{item.value}</dd>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={460} className="mt-10">
              <a
                href={venue.mapLink}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Abrir no Google Maps
              </a>
            </Reveal>
          </Layer>

          {/* -- Mapa ----------------------------------------------------- */}
          <Layer depth={-38} className="lg:col-span-7">
            <Reveal variant="scale" className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-4 -right-4 hidden h-full w-full rounded-[1.25rem] border border-gold/55 sm:block"
              />
              <div className="relative overflow-hidden rounded-[1.25rem] border border-sand bg-white shadow-[0_40px_90px_-55px_rgba(25,20,16,0.6)]">
                <div className="aspect-[4/3] w-full sm:aspect-[4/3] lg:aspect-square">
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
    </>
  );
}
