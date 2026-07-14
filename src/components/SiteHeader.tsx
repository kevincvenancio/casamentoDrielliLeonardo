"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { wedding } from "@/config/wedding";

const nav = [
  { href: "/", label: "Início" },
  { href: "/nossa-historia", label: "Nossa História" },
  { href: "/local", label: "Local" },
  { href: "/dress-code", label: "Dress Code" },
  { href: "/presentes", label: "Presentes" },
  { href: "/rsvp", label: "Confirmar" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream/90 backdrop-blur">
      <div className="container-page flex items-center justify-between py-4">
        {/* A logo e um monograma vertical: no header ela encolheria a ponto de
            virar um borrao. Ela vive na capa da home, onde tem espaco. */}
        <Link
          href="/"
          className="font-serif text-lg tracking-wide"
          onClick={() => setOpen(false)}
        >
          {wedding.couple.bride} <span className="text-stone">&</span>{" "}
          {wedding.couple.groom}
        </Link>

        {/* Desktop */}
        <nav className="hidden gap-6 text-sm md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? "text-ink"
                  : "text-stone transition hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile: botao hamburguer */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-sand/60 md:hidden"
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile: painel */}
      {open && (
        <nav
          id="menu-mobile"
          className="border-t border-sand bg-cream md:hidden"
        >
          <ul className="container-page py-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-sand/60 py-4 text-base last:border-0 ${
                    pathname === item.href ? "text-ink" : "text-stone"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function IconMenu() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
