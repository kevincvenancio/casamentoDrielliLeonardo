import Image from "next/image";
import Link from "next/link";
import { wedding } from "@/config/wedding";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Scene, Layer } from "@/components/motion/Scene";

export const metadata = { title: "Dress Code" };

export default function DressCodePage() {
  const { dressCode } = wedding;
  const looks = [
    { label: "Elas", texto: dressCode.women },
    { label: "Eles", texto: dressCode.men },
  ];

  // As colagens sao imagens altas (9:16). Largura e altura reais vao junto
  // para o navegador reservar o espaco exato antes de baixar o arquivo -- sem
  // isso a pagina salta quando cada uma carrega.
  const inspirations = [
    {
      photo: dressCode.palettePhoto,
      width: 900,
      height: 1600,
      eyebrow: "Inspiração de cores",
      text: "Fora as cores acima, sinta-se livre. Vale de verde a vinho, passando por azul, mostarda e terracota.",
    },
    {
      photo: dressCode.menCollagePhoto,
      width: 736,
      height: 1308,
      eyebrow: "Inspiração para eles",
      text: "Terno completo ou calça social com camisa — os dois funcionam. Blazer e gravata ficam a seu critério.",
    },
  ].filter((item) => Boolean(item.photo));

  return (
    <>
      <PageHero
        eyebrow={dressCode.title}
        title={[dressCode.style]}
        text={dressCode.intro}
        photo="/images/ensaio/ensaio-07.jpg"
        alt=""
      />

      {/* -- Elas e eles ---------------------------------------------------- */}
      <Scene
        as="section"
        mode="through"
        className="relative overflow-hidden bg-cream py-24 sm:py-32"
      >
        <div className="container-page relative grid gap-6 md:grid-cols-2 md:gap-8">
          {looks.map((look, i) => (
            <Layer key={look.label} depth={i === 0 ? -26 : 26}>
              <Reveal delay={i * 140} className="h-full">
                <div className="card card-hover flex h-full flex-col justify-center p-10 text-center sm:p-14">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-gold/12 to-transparent"
                  />
                  <p className="eyebrow">{look.label}</p>
                  <p className="mt-5 font-serif text-2xl font-light leading-snug text-ink sm:text-3xl">
                    {look.texto}
                  </p>
                </div>
              </Reveal>
            </Layer>
          ))}
        </div>
      </Scene>

      {/* -- Cores a evitar ------------------------------------------------- */}
      <section className="relative overflow-hidden bg-night py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(179,166,218,0.55), transparent 70%)",
          }}
        />
        <div className="container-page relative">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <p className="eyebrow-light">Reservado para a noiva</p>
            </Reveal>
            <SplitText
              as="h2"
              lines={["Cores a evitar"]}
              className="display-lg mt-4 text-cream"
            />
            <Reveal delay={180}>
              <p className="lede-light mt-6">{dressCode.avoidNote}</p>
            </Reveal>
          </div>

          <ul className="mx-auto mt-14 flex max-w-3xl flex-wrap justify-center gap-x-10 gap-y-8">
            {dressCode.avoidColors.map((color, i) => (
              <li key={color.label}>
                <Reveal delay={i * 90} className="flex flex-col items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="block h-14 w-14 rounded-full border border-cream/25 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[0.66rem] uppercase tracking-[0.2em] text-cream/65">
                    {color.label}
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* -- Referências ---------------------------------------------------- */}
      <Scene
        as="section"
        mode="through"
        className="relative overflow-hidden bg-linen py-24 sm:py-32"
      >
        <div className="container-page relative space-y-16 sm:space-y-24">
          {inspirations.map((item, i) => (
            <div
              key={item.eyebrow}
              className="grid items-start gap-8 lg:grid-cols-12 lg:gap-14"
            >
              <Layer
                depth={i % 2 === 0 ? 30 : -30}
                className={`lg:col-span-6 ${
                  i % 2 === 0 ? "" : "lg:order-last lg:col-start-7"
                }`}
              >
                <Reveal className="lg:pt-6">
                  <p className="eyebrow">{item.eyebrow}</p>
                  <p className="lede mt-4 max-w-md">{item.text}</p>
                </Reveal>
              </Layer>

              {/* A colagem e vertical: presa a uma coluna estreita, ela cabe
                  na tela inteira em vez de virar um cartaz de dois metros. */}
              <Layer
                depth={i % 2 === 0 ? -30 : 30}
                className={`lg:col-span-6 ${i % 2 === 0 ? "" : "lg:col-start-1 lg:row-start-1"}`}
              >
                <Reveal variant="scale">
                  <div className="mx-auto w-full max-w-[17rem] overflow-hidden rounded-[6rem_6rem_1.25rem_1.25rem] border border-sand bg-sand shadow-[0_40px_90px_-55px_rgba(25,20,16,0.55)]">
                    <Image
                      src={item.photo!.src}
                      alt={item.photo!.alt}
                      width={item.width}
                      height={item.height}
                      sizes="(min-width: 640px) 17rem, 85vw"
                      className="h-auto w-full"
                    />
                  </div>
                </Reveal>
              </Layer>
            </div>
          ))}
        </div>
      </Scene>

      {/* -- Saída ---------------------------------------------------------- */}
      <section className="bg-cream pb-24 sm:pb-32">
        <div className="container-page">
          <Reveal className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/rsvp" className="btn-primary w-full sm:w-auto">
              Confirmar presença
            </Link>
            <Link
              href="/manual-do-convidado"
              className="btn-outline w-full sm:w-auto"
            >
              Ver o manual
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
