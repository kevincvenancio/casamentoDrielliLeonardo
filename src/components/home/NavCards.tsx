"use client";

import Image from "next/image";
import Link from "next/link";
import { Scene, Layer } from "@/components/motion/Scene";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { focusOf } from "@/lib/photo-focus";

/**
 * As quatro portas do site. Cada cartao entra com um atraso proprio e fica
 * num plano ligeiramente diferente: em movimento, a fileira ondula em vez de
 * andar em bloco.
 */

const cards = [
  {
    href: "/nossa-historia",
    title: "Nossa História",
    text: "Como tudo começou — e o ensaio à beira-mar.",
    photo: "/images/ensaio/ensaio-05.jpg",
    alt: "Drielli nas costas de Leonardo, os dois correndo e rindo na praia",
    depth: -34,
  },
  {
    href: "/dress-code",
    title: "Dress Code",
    text: "Esporte fino. O que vestir e o que evitar.",
    photo: "/images/dress-code/paleta-cores.jpeg",
    alt: "Colagem com vestidos em cores variadas",
    depth: 10,
  },
  {
    href: "/manual-do-convidado",
    title: "Manual do Convidado",
    text: "Os combinados para o dia sair leve.",
    photo: "/images/ensaio/ensaio-06.jpg",
    alt: "Brincadeira do casal na beira do mar, entre risadas",
    depth: -18,
  },
  {
    href: "/presentes",
    title: "Lista de Presentes",
    text: "Presenteie com um clique, ou faça um Pix.",
    photo: "/images/ensaio/ensaio-10.jpg",
    alt: "O casal de pé dentro da água, se beijando entre as ondas",
    depth: 26,
  },
];

export function NavCards() {
  return (
    <Scene
      as="section"
      mode="through"
      className="relative overflow-hidden bg-linen py-24 sm:py-32"
    >
      <div className="container-page relative">
        <div className="mb-14 max-w-2xl">
          <Reveal>
            <p className="eyebrow">Tudo o que você precisa saber</p>
          </Reveal>
          <SplitText
            as="h2"
            lines={["Explore o convite"]}
            className="display-lg mt-5 text-ink"
          />
        </div>

        <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {cards.map((card, i) => (
            <li key={card.href}>
              <Layer depth={card.depth}>
                <Reveal delay={i * 120} className="h-full">
                  <Link
                    href={card.href}
                    className="group relative block h-full overflow-hidden rounded-[1.25rem] border border-sand bg-night
                      transition-[transform,box-shadow] duration-700 ease-silk
                      hover:-translate-y-1.5 hover:shadow-[0_34px_70px_-40px_rgba(25,20,16,0.7)]"
                  >
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={card.photo}
                        alt={card.alt}
                        fill
                        sizes="(min-width: 1024px) 15rem, 45vw"
                        style={{ objectPosition: focusOf(card.photo) }}
                        className="object-cover transition-transform duration-[1200ms] ease-silk group-hover:scale-[1.07]"
                      />
                      {/* Véu que escurece de baixo para cima e aprofunda no
                          hover, para o texto ganhar contraste. */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-transparent transition-opacity duration-700 group-hover:opacity-90"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-4 top-4 font-serif text-sm tabular-nums text-cream/50"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <h3 className="font-serif text-xl font-normal leading-tight text-cream sm:text-2xl">
                          {card.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-cream/65 sm:text-sm">
                          {card.text}
                        </p>
                        {/* Fio que atravessa o cartão no hover. */}
                        <span
                          aria-hidden="true"
                          className="mt-4 block h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-700 ease-silk group-hover:scale-x-100"
                        />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              </Layer>
            </li>
          ))}
        </ul>
      </div>
    </Scene>
  );
}
