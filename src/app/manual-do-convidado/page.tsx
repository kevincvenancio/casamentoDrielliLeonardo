import Link from "next/link";
import { wedding } from "@/config/wedding";
import { manualIcons, type ManualIconKey } from "@/components/ManualIcons";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Scene, Layer } from "@/components/motion/Scene";

export const metadata = { title: "Manual do Convidado" };

export default function GuestManualPage() {
  const { guestManual } = wedding;

  return (
    <>
      <PageHero
        eyebrow="Combinados"
        title={["Manual do", "Convidado"]}
        text={guestManual.intro}
        photo="/images/ensaio/ensaio-06.jpg"
        alt=""
        objectPosition="50% 45%"
      />

      <Scene
        as="section"
        mode="through"
        className="relative overflow-hidden bg-cream py-24 sm:py-32"
      >
        <Layer
          depth={-60}
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-1/3 h-[34rem] w-[34rem] rounded-full opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(143,169,201,0.5), transparent 68%)",
          }}
        />

        <ul className="container-page relative grid gap-4 sm:gap-5 md:grid-cols-2">
          {guestManual.items.map((item, i) => {
            const Icon = manualIcons[item.icon as ManualIconKey];
            // Três profundidades que se repetem: a lista inteira ondula de
            // leve, em vez de subir como um bloco só.
            const depth = [-22, 0, 22][i % 3];
            return (
              <li key={item.title}>
                <Layer depth={depth}>
                  <Reveal delay={(i % 2) * 90} className="h-full">
                    <div className="card card-hover flex h-full gap-5 p-6 sm:p-7">
                      <span className="mt-0.5 shrink-0 text-gold">
                        {Icon ? <Icon className="h-7 w-7" /> : null}
                      </span>
                      <div>
                        <h2 className="font-serif text-xl font-medium leading-snug text-ink sm:text-2xl">
                          {item.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-stone">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </Layer>
              </li>
            );
          })}
        </ul>

        <div className="container-page relative mt-16">
          <Reveal className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/rsvp" className="btn-primary w-full sm:w-auto">
              Confirmar presença
            </Link>
            <Link href="/dress-code" className="btn-outline w-full sm:w-auto">
              Ver o dress code
            </Link>
          </Reveal>
        </div>
      </Scene>
    </>
  );
}
