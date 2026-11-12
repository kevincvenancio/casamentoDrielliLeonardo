"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { wedding } from "@/config/wedding";

const nav = [
  { href: "/", label: "Início" },
  { href: "/nossa-historia", label: "Nossa História" },
  { href: "/local", label: "Local" },
  { href: "/dress-code", label: "Dress Code" },
  { href: "/manual-do-convidado", label: "Manual" },
  { href: "/presentes", label: "Presentes" },
];

/**
 * A roupa da barra depende do que esta por baixo dela:
 * - "light": vidro creme, texto escuro -- o padrao, sobre as secoes claras;
 * - "dark":  vidro escuro, texto claro -- sobre uma cena escura;
 * - "clear": sem fundo, so o texto claro -- sobre a foto do hero.
 *
 * Quem decide e a propria pagina: a cena escura se anuncia com
 * `data-header="dark"` ou `data-header="clear"`, e a barra troca enquanto
 * estiver inteira em cima dela.
 */
type Tone = "light" | "dark" | "clear";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // O tom medido vale so para a pagina em que foi medido. Na troca de rota,
  // ate a primeira medicao, vale o palpite: a home abre sobre o hero.
  const [measured, setMeasured] = useState<{ path: string; tone: Tone } | null>(
    null,
  );
  const tone: Tone =
    measured && measured.path === pathname
      ? measured.tone
      : pathname === "/"
        ? "clear"
        : "light";

  // Com o menu aberto a barra fica sobre a cortina escura: sem fundo (um
  // vidro viraria uma faixa atravessada na cortina) e com texto claro.
  const clear = open || tone === "clear";
  const onDark = open || tone !== "light";

  // Tom da barra + fio de progresso da leitura, no mesmo listener.
  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;

      // -- Leituras ------------------------------------------------------
      const band = headerRef.current?.offsetHeight ?? 68;
      let next: Tone = "light";
      // A barra so muda quando esta INTEIRA sobre a cena escura. Assim, na
      // descida, o vidro creme entra no instante em que a secao clara
      // encosta na base da barra -- as duas se emendam -- em vez de virar
      // uma faixa clara atravessada na foto.
      for (const zone of document.querySelectorAll<HTMLElement>("[data-header]")) {
        const rect = zone.getBoundingClientRect();
        if (rect.top <= 1 && rect.bottom >= band) {
          next = zone.dataset.header === "clear" ? "clear" : "dark";
          break;
        }
      }

      const y = window.scrollY;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, y / max) : 0;

      // -- Escritas ------------------------------------------------------
      // scaleX em vez de width: o navegador nao recalcula layout nenhum.
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }
      setMeasured((prev) =>
        prev && prev.path === pathname && prev.tone === next
          ? prev
          : { path: pathname, tone: next },
      );
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // Menu aberto trava a rolagem do fundo. O `scrollbar-gutter: stable` do
  // globals.css garante que a largura nao mude ao travar.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Trocou de pagina, fecha o menu.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* A cortina vive FORA do <header>. O header usa `backdrop-blur`, e
          `backdrop-filter` transforma o elemento em bloco de contencao para
          descendentes `position: fixed` -- de dentro dele, a cortina ficaria
          presa aos 68px de altura da barra em vez de cobrir a tela. */}
      <MobileMenu open={open} pathname={pathname} onClose={() => setOpen(false)} />

      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter,-webkit-backdrop-filter] duration-500 ease-silk ${
          clear
            ? "border-transparent bg-transparent"
            : tone === "dark"
              ? "header-dark border-cream/10 bg-night/55 backdrop-blur-xl lite-drop-blur"
              : "border-sand/70 bg-cream/85 backdrop-blur-xl lite-drop-blur"
        }`}
        style={{ height: "var(--header-h)" }}
      >
        {/* Sobre a foto do hero a barra nao tem fundo. O que garante a
            leitura do menu e esta penumbra: um degrade que escurece o topo
            da tela e some sem deixar borda, em vez de uma faixa. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 -z-10 bg-gradient-to-b from-night/65 to-transparent transition-opacity duration-700 ${
            tone === "clear" && !open ? "opacity-100" : "opacity-0"
          }`}
          style={{ height: "calc(var(--header-h) * 2)" }}
        />

        <div className="container-wide flex h-full items-center justify-between gap-6">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label={`${wedding.couple.bride} e ${wedding.couple.groom} — ir para o início`}
            className={`group flex items-baseline gap-2 font-serif text-xl tracking-wide transition-colors duration-500 sm:text-2xl ${
              onDark ? "text-cream" : "text-ink"
            }`}
          >
            <span>{wedding.couple.bride}</span>
            <span
              className={`text-base italic transition-colors duration-500 ${
                onDark ? "text-cream/70" : "text-gold"
              }`}
            >
              &
            </span>
            <span>{wedding.couple.groom}</span>
          </Link>

          {/* Navegação em telas largas */}
          <nav className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-colors duration-500 ${
                    onDark
                      ? active
                        ? "text-cream"
                        : "text-cream/65 hover:text-cream"
                      : active
                        ? "text-ink"
                        : "text-stone hover:text-ink"
                  }`}
                >
                  {item.label}
                  {/* Fio que cresce do centro no hover e fica cheio na página atual. */}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-1.5 left-0 h-px w-full origin-center bg-gold transition-transform duration-500 ease-silk ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}

            <Link
              href="/rsvp"
              className={`rounded-full border px-6 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-all duration-500 ease-silk hover:-translate-y-0.5 ${
                onDark
                  ? "border-cream/45 text-cream hover:bg-cream hover:text-ink"
                  : "border-ink bg-ink text-cream hover:bg-stone"
              }`}
            >
              Confirmar
            </Link>
          </nav>

          {/* Botão do menu em telas estreitas */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            className={`relative z-[60] -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-500 lg:hidden ${
              open
                ? "text-cream"
                : onDark
                  ? "text-cream hover:bg-cream/10"
                  : "text-ink hover:bg-sand/60"
            }`}
          >
            {/* Duas barras que viram um X. */}
            <span className="relative block h-3 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-transform duration-500 ease-silk ${
                  open ? "top-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-transform duration-500 ease-silk ${
                  open ? "top-1/2 -rotate-45" : "top-full"
                }`}
              />
            </span>
          </button>
        </div>

        {/* Progresso da leitura: fio dourado na base do header. */}
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-px transition-opacity duration-700 ${
            clear ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            ref={barRef}
            className="h-full origin-left bg-gradient-to-r from-gold/40 via-gold to-lilac"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </header>
    </>
  );
}

function MobileMenu({
  open,
  pathname,
  onClose,
}: {
  open: boolean;
  pathname: string;
  onClose: () => void;
}) {
  const items = [...nav, { href: "/rsvp", label: "Confirmar Presença" }];

  return (
    <div
      id="menu-mobile"
      // Fica sempre no DOM para a cortina ter como animar a saída, e não só a
      // entrada. Fechado, `visibility: hidden` o tira do leitor de tela e da
      // ordem de tabulação -- mas só depois que a cortina termina de subir,
      // por isso o atraso na transição.
      className={`fixed inset-0 z-40 lg:hidden ${
        open ? "visible" : "invisible pointer-events-none"
      }`}
      style={{
        transitionProperty: "visibility",
        transitionDelay: open ? "0ms" : "900ms",
      }}
    >
      {/* Cortina: sobe do topo cobrindo a tela. */}
      <div
        className={`absolute inset-0 bg-night transition-transform duration-[900ms] ease-silk ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      />

      <nav
        className="relative flex h-full flex-col justify-between overflow-y-auto px-7 pb-10"
        style={{ paddingTop: "calc(var(--header-h) + 2.5rem)" }}
      >
        <ul>
          {items.map((item, i) => {
            const active = pathname === item.href;
            return (
              <li key={item.href} className="overflow-hidden">
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-baseline gap-4 border-b border-cream/10 py-4 font-serif text-[2rem] font-light leading-none transition-[transform,opacity] duration-[800ms] ease-silk ${
                    active ? "text-cream" : "text-cream/70"
                  } ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                  style={{ transitionDelay: open ? `${160 + i * 70}ms` : "0ms" }}
                >
                  <span className="text-[0.6rem] tabular-nums tracking-[0.2em] text-gold/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className={`mt-10 transition-[transform,opacity] duration-[800ms] ease-silk ${
            open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
          style={{ transitionDelay: open ? "620ms" : "0ms" }}
        >
          <div className="rule-gold mb-5" />
          <p className="font-serif text-2xl text-cream">
            {wedding.dateLabel}
          </p>
          <p className="mt-1 text-sm text-cream/55">
            {wedding.venue.name} · {wedding.timeLabel}
          </p>
        </div>
      </nav>
    </div>
  );
}
