import Link from "next/link";
import { wedding } from "@/config/wedding";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/nossa-historia", label: "Nossa Historia" },
  { href: "/local", label: "Local" },
  { href: "/presentes", label: "Presentes" },
  { href: "/rsvp", label: "Confirmar" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-sand bg-cream/80 backdrop-blur">
      <div className="container-page flex items-center justify-between py-4">
        <Link href="/" className="font-serif text-lg tracking-wide">
          {wedding.couple.bride} <span className="text-stone">&</span>{" "}
          {wedding.couple.groom}
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-stone transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/rsvp" className="btn-primary py-2 text-xs md:hidden">
          Confirmar
        </Link>
      </div>
    </header>
  );
}
