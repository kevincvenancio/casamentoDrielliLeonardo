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

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  // Quando a barra esta sobre fundo escuro ela fica sem fundo e com texto
  // claro. Isso acontece em dois casos: no topo da home, sobre o hero, e com
  // o menu aberto, sobre a cortina -- onde um fundo creme viraria uma faixa
  // clara atravessada na cortina.
  const overDark = open || (pathname === "/" && !scrolled);

  // Estado de rolagem + fio de progresso da leitura, no mesmo listener.
  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, y / max) : 0;
      // scaleX em vez de width: o navegador nao recalcula layout nenhum.
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }
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
  }, []);

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
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-700 ease-silk ${
          overDark
            ? "border-b border-transparent bg-transparent"
            : "border-b border-sand/70 bg-cream/85 backdrop-blur-xl lite-drop-blur"
        }`}
        style={{ height: "var(--header-h)" }}
      >
        <div className="container-wide flex h-full items-center justify-between gap-6">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            aria-label={`${wedding.couple.bride} e ${wedding.couple.groom} — ir para o início`}
            className={`group flex items-baseline gap-2 font-serif text-xl tracking-wide transition-colors duration-700 sm:text-2xl ${
              overDark ? "text-cream" : "text-ink"
            }`}
          >
            <span>{wedding.couple.bride}</span>
            <span
              className={`text-base italic transition-colors duration-700 ${
                overDark ? "text-cream/70" : "text-gold"
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
                    overDark
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
                overDark
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
                : overDark
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
            overDark ? "opacity-0" : "opacity-100"
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
