"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

type Photo = { src: string; alt: string };

/**
 * Carrossel das fotos do ensaio.
 *
 * A troca e uma dissolvencia, nao um deslize lateral: assim a moldura fica
 * parada e as fotos se sucedem dentro dela.
 *
 * A moldura e 3/2, a proporcao das fotos da galeria (todas deitadas), entao
 * elas preenchem o espaco exato. Uma foto de outra proporcao continua
 * aparecendo inteira (`object-contain`) sobre uma versao ampliada e borrada
 * dela mesma -- a sobra vira fundo, em vez de faixa vazia.
 *
 * Só tres fotos ficam no DOM (anterior, atual e proxima). As vizinhas ja
 * chegam carregadas na hora do clique, e as demais nunca sao baixadas por
 * quem nao passar por elas.
 */
export function PhotoGallery({ photos }: { photos: readonly Photo[] }) {
  const total = photos.length;
  const [index, setIndex] = useState(0);

  // As vizinhas so entram depois da montagem: a primeira pintura da pagina
  // baixa uma foto so, e o pre-carregamento fica para o segundo plano.
  const [preloadNeighbors, setPreloadNeighbors] = useState(false);
  useEffect(() => setPreloadNeighbors(true), []);

  const go = useCallback(
    (step: number) => setIndex((i) => (i + step + total) % total),
    [total],
  );

  // Arrastar com o dedo (ou com o mouse) tambem passa a foto.
  const dragStartX = useRef<number | null>(null);

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartX.current;
    dragStartX.current = null;
    if (start === null) return;
    const delta = event.clientX - start;
    // O limite de 40px ignora o toque parado -- inclusive o das setas, que
    // ficam dentro da moldura e tambem disparam este pointerup.
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
  }

  // Distancia ate a foto atual contando a volta do carrossel: a ultima foto
  // e vizinha da primeira.
  function distanceFromCurrent(i: number) {
    const direct = Math.abs(i - index);
    return Math.min(direct, total - direct);
  }

  if (total === 0) return null;

  const current = photos[index];

  return (
    <div
      role="group"
      aria-roledescription="carrossel"
      aria-label="Fotos do ensaio"
      className="mx-auto max-w-4xl"
      onKeyDown={(event) => {
        // Setas do teclado funcionam com o foco em qualquer botao daqui.
        // O preventDefault evita a foto andar e a pagina rolar no mesmo toque.
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
      }}
    >
      <div
        className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-sand bg-sand"
        onPointerDown={(event) => {
          dragStartX.current = event.clientX;
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragStartX.current = null;
        }}
      >
        {photos.map((photo, i) => {
          const isCurrent = i === index;
          const mounted =
            isCurrent || (preloadNeighbors && distanceFromCurrent(i) <= 1);
          if (!mounted) return null;

          return (
            <div
              key={i}
              aria-hidden={!isCurrent}
              className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                isCurrent ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Fundo: a propria foto, ampliada e borrada. Mesmo arquivo da
                  frente, entao nao custa um download a mais. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                draggable={false}
                decoding="async"
                className={`relative h-full w-full select-none object-contain transition-transform duration-700 ease-out motion-reduce:transition-none ${
                  isCurrent ? "scale-100" : "scale-[1.03]"
                }`}
              />
            </div>
          );
        })}

        {total > 1 && (
          <>
            <ArrowButton direction="prev" onClick={() => go(-1)} />
            <ArrowButton direction="next" onClick={() => go(1)} />
          </>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <p
          aria-hidden="true"
          className="text-xs uppercase tracking-widest tabular-nums text-stone"
        >
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </p>
        <div aria-hidden="true" className="h-px w-20 bg-sand">
          <div
            className="h-px bg-stone transition-[width] duration-500 ease-out"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* A dissolvencia nao move o foco, entao o leitor de tela nao perceberia
          a troca sozinho. Este aviso conta qual foto entrou. */}
      <p aria-live="polite" className="sr-only">
        Foto {index + 1} de {total}: {current.alt}
      </p>
    </div>
  );
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Foto anterior" : "Próxima foto"}
      className={`absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-sand bg-cream/85 text-ink backdrop-blur transition hover:bg-cream sm:h-12 sm:w-12 ${
        isPrev ? "left-3 sm:left-4" : "right-3 sm:right-4"
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={isPrev ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}
