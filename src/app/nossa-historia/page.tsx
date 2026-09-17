import Image from "next/image";
import Link from "next/link";
import { wedding } from "@/config/wedding";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Scene, Layer } from "@/components/motion/Scene";

export const metadata = { title: "Nossa História" };

export default function StoryPage() {
  const { story, home } = wedding;

  return (
    <>
      <PageHero
        eyebrow={home.story.eyebrow}
        title={[home.story.title, home.story.titleAccent]}
        text={story.intro}
        photo="/images/ensaio/ensaio-09.jpg"
        alt="Dentro do mar, Leonardo ergue Drielli no colo em um beijo"
        objectPosition="50% 40%"
      />

      {/* -- A linha do tempo -----------------------------------------------
          Cada marco ocupa uma faixa inteira, com a foto de um lado e o texto
          do outro, trocando de lado a cada passo. O ziguezague conduz o olho
          para baixo e usa a largura toda -- uma coluna central deixaria
          metade da tela vazia em cada marco. */}
      {story.timeline.length > 0 ? (
        <Scene
          as="section"
          mode="through"
          className="relative overflow-hidden bg-cream py-20 sm:py-28"
        >
          <Layer
            depth={-70}
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-1/4 h-[32rem] w-[32rem] rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(179,166,218,0.5), transparent 68%)",
            }}
          />

          <ol className="container-page relative space-y-16 sm:space-y-24">
            {story.timeline.map((item, i) => {
              const flipped = i % 2 === 1;
              return (
                <li
                  key={item.date}
                  className="grid items-center gap-7 sm:gap-10 md:grid-cols-12 md:gap-12"
                >
                  {/* Foto, na moldura em arco. */}
                  {item.photo ? (
                    <Layer
                      depth={flipped ? 28 : -28}
                      className={`md:col-span-5 ${
                        flipped ? "md:order-last md:col-start-8" : ""
                      }`}
                    >
                      <Reveal variant={flipped ? "right" : "left"}>
                        <div className="relative mx-auto w-full max-w-[15rem] sm:max-w-[19rem]">
                          <div className="arch relative aspect-[3/4] overflow-hidden border border-sand bg-sand shadow-[0_40px_90px_-55px_rgba(25,20,16,0.6)]">
                            <Image
                              src={item.photo}
                              alt={`${item.title} — ${item.date}`}
                              fill
                              sizes="(min-width: 640px) 19rem, 65vw"
                              className="object-cover"
                            />
                          </div>
                          {/* Arco externo deslocado: o segundo plano. */}
                          <span
                            aria-hidden="true"
                            className="arch pointer-events-none absolute -inset-3 hidden border border-gold/25 sm:block"
                          />
                        </div>
                      </Reveal>
                    </Layer>
                  ) : null}

                  {/* Texto. */}
                  <Layer
                    depth={flipped ? -24 : 24}
                    className={`md:col-span-6 ${
                      flipped ? "md:col-start-1 md:row-start-1" : "md:col-start-7"
                    }`}
                  >
                    <Reveal delay={120}>
                      <div className="flex items-center gap-4">
                        <span className="font-serif text-2xl tabular-nums text-gold/70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-px w-10 bg-gold/40"
                        />
                        <p className="text-[0.66rem] uppercase tracking-[0.26em] text-stone">
                          {item.date}
                        </p>
                      </div>
                      <h2 className="display-md mt-4 text-ink">{item.title}</h2>
                      {item.text ? <p className="lede mt-4 max-w-md">{item.text}</p> : null}
                    </Reveal>
                  </Layer>
                </li>
              );
            })}
          </ol>
        </Scene>
      ) : null}

      {/* -- A galeria do ensaio ------------------------------------------- */}
      {story.gallery.photos.length > 0 ? (
        <section className="relative overflow-hidden bg-linen py-24 sm:py-32">
          <div className="container-page">
            <header className="mb-12 text-center">
              <Reveal>
                <p className="eyebrow">{story.gallery.intro}</p>
              </Reveal>
              <SplitText
                as="h2"
                lines={[story.gallery.title]}
                className="display-lg mt-4 text-ink"
              />
            </header>
            <Reveal variant="scale">
              <PhotoGallery photos={story.gallery.photos} />
            </Reveal>

            <Reveal delay={200} className="mt-16 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/rsvp" className="btn-primary w-full sm:w-auto">
                Confirmar presença
              </Link>
              <Link href="/local" className="btn-outline w-full sm:w-auto">
                Ver o local
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}
    </>
  );
}
