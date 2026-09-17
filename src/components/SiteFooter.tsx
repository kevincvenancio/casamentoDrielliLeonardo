import Link from "next/link";
import { wedding } from "@/config/wedding";

const links = [
  { href: "/nossa-historia", label: "Nossa História" },
  { href: "/local", label: "Local" },
  { href: "/dress-code", label: "Dress Code" },
  { href: "/manual-do-convidado", label: "Manual" },
  { href: "/presentes", label: "Presentes" },
  { href: "/rsvp", label: "Confirmar Presença" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-cream/10 bg-night">
      {/* Luz baixa vinda do rodapé, como o último clarão do dia. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-45"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, rgba(196,160,99,0.4), transparent 70%)",
        }}
      />

      <div className="container-page relative py-16 sm:py-20">
        <div className="flex flex-col items-center gap-10 text-center">
          <div>
            <p className="font-serif text-4xl font-light text-cream sm:text-5xl">
              {wedding.couple.bride}
              <span className="mx-3 italic text-gold">&amp;</span>
              {wedding.couple.groom}
            </p>
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.3em] text-cream/55">
              {wedding.dateLabel} · {wedding.timeLabel}
            </p>
            <p className="mt-2 text-sm text-cream/45">{wedding.venue.name}</p>
          </div>

          <span aria-hidden="true" className="rule-gold" />

          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.7rem] uppercase tracking-[0.18em] text-cream/55 transition-colors duration-500 hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {wedding.couple.hashtag ? (
            <p className="text-xs tracking-[0.2em] text-gold/80">
              {wedding.couple.hashtag}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
