"use client";

import Image from "next/image";
import { Scene, Layer } from "@/components/motion/Scene";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";

type Props = {
  eyebrow: string;
  /** Uma linha por item -- o titulo sobe palavra a palavra, na ordem. */
  title: string | string[];
  text?: string;
  photo: string;
  /** Descricao da foto. Vazia quando ela e puro clima e o titulo ja diz tudo. */
  alt?: string;
  /** Enquadramento da foto, quando o centro nao e o melhor recorte. */
  objectPosition?: string;
};

/**
 * Topo das paginas internas.
 *
 * Mesma gramatica do hero da home, em versao curta: foto ao fundo em
 * parallax, veu escuro, titulo na frente subindo palavra a palavra. E o que
 * faz cada pagina parecer um capitulo do mesmo convite, e nao uma tela solta.
 *
 * A altura e minima, nao fixa: um titulo de tres linhas no celular estica o
 * bloco em vez de vazar por baixo dele.
 */
export function PageHero({
  eyebrow,
  title,
  text,
  photo,
  alt = "",
  objectPosition = "50% 50%",
}: Props) {
  return (
    <Scene
      as="header"
      mode="through"
      className="relative flex min-h-[26rem] items-end overflow-hidden bg-night sm:min-h-[32rem]"
    >
      <Layer depth={80} zoom={0.08} scale={1.04} className="absolute inset-0">
        <Image
          src={photo}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition }}
        />
      </Layer>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-night via-night/65 to-night/40"
      />
      <div
        aria-hidden="true"
        className="grain pointer-events-none absolute inset-0 overflow-hidden"
      />

      <Layer
        depth={-52}
        className="container-page relative w-full pb-14 sm:pb-20"
        style={{ paddingTop: "calc(var(--header-h) + 5rem)" }}
      >
        <Reveal>
          <p className="eyebrow-light">{eyebrow}</p>
        </Reveal>

        <SplitText
          as="h1"
          lines={Array.isArray(title) ? title : [title]}
          className="display-lg mt-5 max-w-3xl text-cream"
        />

        {text ? (
          <Reveal delay={200} className="mt-7 flex items-start gap-5">
            <span className="rule-gold mt-3 shrink-0" />
            <p className="lede-light max-w-xl">{text}</p>
          </Reveal>
        ) : null}
      </Layer>
    </Scene>
  );
}
