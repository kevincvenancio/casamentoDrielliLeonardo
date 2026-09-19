"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { wedding } from "@/config/wedding";
import { Scene, Layer } from "@/components/motion/Scene";
import { focusOf } from "@/lib/photo-focus";

/**
 * A cena-assinatura: a linha do tempo do casal.
 *
 * O trecho e alto e o conteudo fica preso no meio da tela. Rolar essa altura
 * nao move a pagina -- move a HISTORIA: a foto troca, a data vira, o fio
 * dourado avanca. Cada marco ocupa uma fatia igual da rolagem.
 *
 * A mesma pilha de fotos serve aos dois formatos: no celular ela ocupa a tela
 * inteira, como cinema; a partir de `lg` ela se recolhe para a moldura em
 * arco da esquerda e divide espaco com o texto. Uma pilha so -- montar duas
 * faria o visitante baixar as cinco fotos duas vezes.
 *
 * As cinco ficam montadas ao mesmo tempo e so trocam de opacidade: sao
 * imagens pequenas, e montar/desmontar a cada passo custaria mais (e
 * piscaria) do que mante-las.
 */
export function TimelineScene() {
  const { story, home } = wedding;
  const steps = story.timeline;
  const total = steps.length;
  const [active, setActive] = useState(0);

  const onProgress = useCallback(
    (p: number) => {
      // O fator 1.08 faz a ultima fatia chegar um pouco antes do fim da cena:
      // o marco final fica parado na tela, em vez de passar voando.
      const index = Math.min(total - 1, Math.floor(p * total * 1.08));
      setActive((current) => (current === index ? current : index));
    },
    [total],
  );

  return (
    <Scene
      as="section"
      mode="pin"
      onProgress={onProgress}
      className="relative bg-night"
      // Cada marco recebe pouco mais de meia tela de rolagem: rapido o
      // bastante para nao cansar, longo o bastante para a troca ser lida.
      style={{ height: `${total * 58 + 100}vh` }}
      aria-label={story.title}
    >
      <div className="scene-sticky">
        {/* -- Plano 1: a cor da foto ativa, esfumada ---------------------- */}
        {/* Repinta o fundo inteiro com a cor da foto que entrou: a cena muda
            de temperatura junto com a historia. */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          {steps.map((step, i) =>
            step.photo ? (
              <div
                key={`bg-${step.photo}`}
                className={`absolute inset-0 transition-opacity duration-1000 ease-silk ${
                  i === active ? "opacity-30" : "opacity-0"
                }`}
              >
                {/* 48px de largura, esticados para a tela inteira: a
                    ampliacao borra sozinha, sem filtro nenhum. */}
                <Image
                  src={step.photo}
                  alt=""
                  width={48}
                  height={32}
                  className="h-full w-full scale-125 object-cover"
                />
              </div>
            ) : null,
          )}
        </div>

        {/* -- Plano 2: a pilha de fotos ----------------------------------- */}
        <Layer depth={-36} className="absolute inset-0 lg:flex lg:items-center">
          {/* `lg:h-auto` e o que permite a centralizacao: com altura cheia,
              o `items-center` do pai nao teria folga para centralizar nada. */}
          <div className="h-full w-full lg:mx-auto lg:h-auto lg:max-w-6xl lg:px-8">
            <div className="relative h-full w-full lg:aspect-[3/4] lg:h-auto lg:w-[38%] lg:max-w-[21rem]">
              <div className="relative h-full w-full overflow-hidden lg:rounded-[14rem_14rem_1.25rem_1.25rem] lg:border lg:border-cream/15 lg:shadow-[0_50px_120px_-60px_rgba(0,0,0,0.9)]">
                {steps.map((step, i) =>
                  step.photo ? (
                    <Image
                      key={step.photo}
                      src={step.photo}
                      alt={`${step.title} — ${step.date}`}
                      fill
                      sizes="(min-width: 1024px) 21rem, 100vw"
                      style={{ objectPosition: focusOf(step.photo) }}
                      className={`object-cover transition-[opacity,transform] duration-[1100ms] ease-silk ${
                        i === active
                          ? "scale-100 opacity-100"
                          : "scale-110 opacity-0"
                      }`}
                    />
                  ) : null,
                )}
              </div>

              {/* Arco externo: um segundo plano, deslocado, atrás da foto. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-5 hidden rounded-[14rem_14rem_1.25rem_1.25rem] border border-gold/20 lg:block"
              />
            </div>
          </div>
        </Layer>

        {/* -- Plano 3: o véu escuro --------------------------------------- */}
        {/* No celular o texto fica sobre a foto e precisa de bastante base
            escura; no desktop ele tem coluna própria e o véu é só um clima. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/85 to-night/45 lg:from-night/85 lg:via-night/55 lg:to-night/35"
        />

        {/* -- Plano 4: o texto -------------------------------------------- */}
        <Layer
          depth={62}
          className="absolute inset-0 flex items-end lg:items-center"
        >
          <div className="container-page w-full pb-12 sm:pb-16 lg:pb-0">
            <div className="lg:ml-auto lg:w-[52%] lg:pl-6">
              <p className="eyebrow-light">{home.story.eyebrow}</p>

              <div className="mt-4 flex gap-5 sm:gap-6">
                {/* Trilho: o fio dourado sobe conforme a cena avança. */}
                <div
                  aria-hidden="true"
                  className="relative mt-2 w-px shrink-0 overflow-hidden bg-cream/15"
                >
                  <span
                    className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-gold to-lilac"
                    style={{ transform: "scaleY(var(--p))" }}
                  />
                </div>

                {/* Os marcos ocupam a mesma caixa, empilhados: um entra
                    enquanto o outro sai, e a altura do bloco não muda. */}
                <div className="relative min-h-[9.5rem] flex-1 sm:min-h-[12rem]">
                  {steps.map((step, i) => {
                    const isActive = i === active;
                    return (
                      <div
                        key={step.date}
                        aria-hidden={!isActive}
                        className={`transition-[opacity,transform] duration-[900ms] ease-silk ${
                          i === 0 ? "relative" : "absolute inset-x-0 top-0"
                        } ${
                          isActive
                            ? "translate-y-0 opacity-100"
                            : i < active
                              ? "pointer-events-none -translate-y-5 opacity-0"
                              : "pointer-events-none translate-y-5 opacity-0"
                        }`}
                      >
                        <p className="text-[0.66rem] uppercase tracking-[0.26em] text-gold">
                          {step.date}
                        </p>
                        <h3 className="display-md mt-3 text-cream">
                          {step.title}
                        </h3>
                        {step.text ? (
                          <p className="lede-light mt-3 max-w-md">{step.text}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contador e marcadores. */}
              <div className="mt-6 flex items-center gap-4 sm:gap-5">
                <span className="font-serif text-xl tabular-nums text-cream sm:text-2xl">
                  {String(active + 1).padStart(2, "0")}
                </span>
                <span aria-hidden="true" className="flex flex-1 gap-1.5">
                  {steps.map((step, i) => (
                    <span
                      key={step.date}
                      className={`h-px flex-1 transition-colors duration-700 ${
                        i <= active ? "bg-gold" : "bg-cream/20"
                      }`}
                    />
                  ))}
                </span>
                <span className="font-serif text-xl tabular-nums text-cream/40 sm:text-2xl">
                  {String(total).padStart(2, "0")}
                </span>
              </div>

              <Link href="/nossa-historia" className="btn-light mt-7 inline-flex">
                Ver a história completa
              </Link>
            </div>
          </div>
        </Layer>

        {/* O leitor de tela não percebe a troca sozinho: este aviso conta. */}
        <p aria-live="polite" className="sr-only">
          {steps[active].date}: {steps[active].title}
        </p>
      </div>
    </Scene>
  );
}
