"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { wedding } from "@/config/wedding";
import { Scene, Layer } from "@/components/motion/Scene";
import { focusOf } from "@/lib/photo-focus";

/**
 * Onde fica, na altura da tela, a linha que um marco precisa cruzar para
 * virar "o da vez" -- como `rootMargin` do IntersectionObserver (uma faixa de
 * 1% de altura). Anda junto com `--rest` e `--pitch` de `.timeline`, em
 * globals.css: o marco acende ao entrar e apaga um `--pitch` acima.
 *
 * - celular: acende a 90% da tela (acabou de entrar por baixo) e apaga a 44%,
 *   antes de chegar aos rostos da foto;
 * - desktop: acende a 62% e apaga a 22%, com o meio do caminho na altura do
 *   centro do arco.
 */
const LINE_NARROW = "-89% 0px -10% 0px";
const LINE_WIDE = "-61% 0px -38% 0px";

/**
 * A cena-assinatura: a linha do tempo do casal.
 *
 * A FOTO fica presa na tela; o TEXTO nao. Os marcos rolam por cima dela na
 * velocidade do dedo, como qualquer texto da pagina, e a foto troca quando o
 * marco seguinte entra. E o contrario de prender a tela inteira e trocar o
 * texto no lugar: ali a pagina parecia travar, porque a pessoa rolava e nada
 * respondia ao dedo.
 *
 * A mesma pilha de fotos serve aos dois formatos: no celular ela ocupa a tela
 * inteira, como cinema; a partir de `lg` ela se recolhe para a moldura em
 * arco da esquerda e os marcos correm ao lado. Uma pilha so -- montar duas
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
  const flowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  // Qual marco esta na linha? Um observer com a raiz reduzida a uma faixa
  // fina responde isso sem ouvir a rolagem: ele so dispara quando um marco
  // entra ou sai da faixa.
  useEffect(() => {
    const flow = flowRef.current;
    const list = listRef.current;
    if (!flow || !list || typeof IntersectionObserver === "undefined") return;

    const items = Array.from(list.children) as HTMLElement[];
    const wide = window.matchMedia("(min-width: 1024px)");
    const onLine = new Set<number>();
    let lineObserver: IntersectionObserver | null = null;

    function connect() {
      lineObserver?.disconnect();
      onLine.clear();
      lineObserver = new IntersectionObserver(
        (records) => {
          for (const record of records) {
            const index = items.indexOf(record.target as HTMLElement);
            if (record.isIntersecting) onLine.add(index);
            else onLine.delete(index);
          }
          // Na virada, dois marcos tocam a faixa: vale o que esta entrando.
          if (onLine.size > 0) setActive(Math.max(...onLine));
        },
        { rootMargin: wide.matches ? LINE_WIDE : LINE_NARROW },
      );
      for (const item of items) lineObserver.observe(item);
    }

    // As pontas. Antes do primeiro marco cruzar a linha, e depois de o ultimo
    // passar dela, nao ha ninguem na faixa -- e o observer acima se cala. Este
    // aqui acerta o estado sempre que a cena entra ou sai da vizinhanca da
    // tela: sem ele, quem saisse por baixo e voltasse ao topo da pagina de um
    // salto reencontraria a cena com o ultimo marco aceso.
    const edgeObserver = new IntersectionObserver(
      ([record]) => {
        const rect = record.boundingClientRect;
        if (rect.top > 0) setActive(0);
        else if (rect.bottom < window.innerHeight) setActive(total - 1);
      },
      // Meia tela de folga: o acerto acontece antes de a cena aparecer.
      { rootMargin: "50% 0px 50% 0px" },
    );
    edgeObserver.observe(flow);

    connect();
    wide.addEventListener("change", connect);
    return () => {
      wide.removeEventListener("change", connect);
      lineObserver?.disconnect();
      edgeObserver.disconnect();
    };
  }, [total]);

  return (
    <Scene
      as="section"
      mode="pin"
      data-header="dark"
      className="timeline relative bg-night"
      aria-label={story.title}
    >
      {/* ================= A foto, presa na tela ========================== */}
      <div className="scene-sticky">
        {/* -- Plano 1 (desktop): a cor da foto ativa, esfumada ------------ */}
        {/* Repinta o fundo com a cor da foto que entrou: a cena muda de
            temperatura junto com a historia. No celular a foto ja cobre a
            tela, entao este plano nem e montado (nem baixado). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden overflow-hidden lg:block"
        >
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
          <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/55 to-night/35" />
        </div>

        {/* -- Plano 2: a pilha de fotos ----------------------------------- */}
        <div className="absolute inset-0 lg:flex lg:items-center">
          {/* `lg:h-auto` e o que permite a centralizacao: com altura cheia,
              o `items-center` do pai nao teria folga para centralizar nada. */}
          <div className="h-full w-full lg:mx-auto lg:h-auto lg:max-w-6xl lg:px-8">
            <div className="relative h-full w-full lg:h-auto lg:w-[38%] lg:max-w-[21rem]">
              <div className="relative h-full w-full lg:aspect-[3/4] lg:h-auto">
                <div className="relative h-full w-full overflow-hidden lg:rounded-[14rem_14rem_1.25rem_1.25rem] lg:border lg:border-cream/15 lg:shadow-[0_50px_120px_-60px_rgba(0,0,0,0.9)]">
                  {/* A foto presa nao fica morta: cresce bem devagar enquanto
                      a cena passa. */}
                  <Layer zoom={0.07} className="absolute inset-0">
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
                  </Layer>

                  {/* O véu. No celular o texto passa sobre a foto e precisa
                      de bastante base escura embaixo (e de um pouco no topo,
                      para o contador); no arco do desktop é só um clima. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/85 to-night/45 lg:from-night/50 lg:via-night/10 lg:to-transparent"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-night/75 to-transparent lg:hidden"
                  />
                </div>

                {/* Arco externo: um segundo plano, deslocado, atrás da foto. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-5 hidden rounded-[14rem_14rem_1.25rem_1.25rem] border border-gold/20 lg:block"
                />
              </div>

              {/* -- Plano 3: o contador ------------------------------------ */}
              {/* Fica preso com a foto: é a referência de onde a pessoa está
                  na história enquanto os marcos passam. No celular vai para
                  o alto da tela, fora do caminho do texto; no desktop, para
                  baixo do arco. */}
              <div
                className="absolute inset-x-5 lg:static lg:mt-12"
                style={{ top: "calc(var(--header-h) + 1.25rem)" }}
              >
                <p className="eyebrow-light">{home.story.eyebrow}</p>
                <div className="mt-3 flex items-center gap-4">
                  <span className="font-serif text-xl tabular-nums text-cream">
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
                  <span className="font-serif text-xl tabular-nums text-cream/40">
                    {String(total).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Os marcos, rolando por cima ==================== */}
      {/* `pointer-events-none`: a lista cobre a foto inteira, mas so o botao
          do fim precisa receber clique. */}
      <div
        ref={flowRef}
        className="timeline-flow pointer-events-none relative z-10"
      >
        <div className="container-page">
          <ol ref={listRef} className="lg:ml-auto lg:w-[52%] lg:pl-6">
            {steps.map((step, i) => {
              const isLast = i === total - 1;
              return (
                <li
                  key={step.date}
                  className={`timeline-step relative lg:pl-10 ${
                    i === active ? "is-active" : ""
                  }`}
                >
                  {/* O fio da linha do tempo (desktop): um ponto por marco,
                      ligado ao seguinte. Acende conforme a historia avanca. */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-[0.2rem] hidden h-[9px] w-[9px] rounded-full border transition-colors duration-700 lg:block ${
                      i <= active
                        ? "border-gold bg-gold"
                        : "border-cream/40 bg-transparent"
                    }`}
                  />
                  {!isLast ? (
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 left-1 top-[calc(0.2rem+9px)] hidden w-px transition-colors duration-700 lg:block ${
                        i < active ? "bg-gold/70" : "bg-cream/20"
                      }`}
                    />
                  ) : null}

                  <p className="text-[0.66rem] uppercase tracking-[0.26em] text-gold">
                    {step.date}
                  </p>
                  <h3 className="display-md mt-3 text-cream">{step.title}</h3>
                  {step.text ? (
                    <p className="lede-light mt-3 max-w-md">{step.text}</p>
                  ) : null}

                  {isLast ? (
                    <Link
                      href="/nossa-historia"
                      className="btn-light pointer-events-auto mt-8 inline-flex"
                    >
                      Ver a história completa
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Scene>
  );
}
