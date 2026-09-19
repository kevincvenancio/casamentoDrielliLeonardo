"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Scene, Layer } from "@/components/motion/Scene";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { focusOf } from "@/lib/photo-focus";

type Props = {
  eyebrow: string;
  /** Uma linha por item -- o titulo sobe palavra a palavra, na ordem. */
  title: string | string[];
  text?: string;
  photo: string;
  /** Descricao da foto. Vazia quando ela e puro clima e o titulo ja diz tudo. */
  alt?: string;
  /**
   * Enquadramento. Por padrao usa o ponto focal cadastrado da foto
   * (src/lib/photo-focus.ts); passe um valor so para fugir dele de proposito.
   */
  objectPosition?: string;
  /** Botao ou atalho exibido abaixo do texto. */
  action?: ReactNode;
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
  objectPosition,
  action,
}: Props) {
  const position = objectPosition ?? focusOf(photo);
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
          style={{ objectPosition: position }}
        />
      </Layer>

      {/* Veu em duas partes. A base ancora o texto no rodape do bloco e vale
          em qualquer largura. A partir de sm entra a segunda, horizontal, que
          concentra a sombra a ESQUERDA -- onde mora o texto -- e deixa a
          direita aberta. Sem ela, um veu parelho escurecia por igual o lado
          da foto que a pessoa veio ver (a vista aerea do Local, o casal no
          dress code) para proteger um texto que nem esta ali. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/30"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden sm:block sm:bg-gradient-to-r sm:from-night/80 sm:via-night/30 sm:to-transparent"
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

        {action ? (
          <Reveal delay={320} className="mt-8">
            {action}
          </Reveal>
        ) : null}
      </Layer>
    </Scene>
  );
}
