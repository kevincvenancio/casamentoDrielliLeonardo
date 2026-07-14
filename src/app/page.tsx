import Link from "next/link";
import { wedding } from "@/config/wedding";
import { Countdown } from "@/components/Countdown";

export default function HomePage() {
    return (
        <div>
            {/* Hero */}
            <section
                className="relative flex min-h-[70vh] items-center justify-center bg-sand"
                style={{
                    backgroundImage: `linear-gradient(rgba(43,40,35,0.35), rgba(43,40,35,0.35)), url('${wedding.coverImage}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="container-page py-16 text-center text-cream sm:py-20">
                    <p className="mb-4 text-xs uppercase tracking-[0.3em] sm:text-sm">
                        {wedding.tagline}
                    </p>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl">
                        {wedding.couple.bride}
                        <span className="mx-2 font-normal sm:mx-3">&</span>
                        {wedding.couple.groom}
                    </h1>
                    <p className="mt-4 text-base tracking-wide sm:text-lg">
                        {wedding.dateLabel} · {wedding.timeLabel}
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Link href="/rsvp" className="btn-primary w-full bg-cream text-ink hover:bg-white sm:w-auto">
                            Confirmar Presença
                        </Link>
                        <Link href="/presentes" className="btn-outline w-full border-cream text-cream hover:bg-cream hover:text-ink sm:w-auto">
                            Lista de Presentes
                        </Link>
                    </div>
                </div>
            </section>

            {/* Countdown */}
            <section className="bg-cream py-16">
                <div className="container-page text-center">
                    <h2 className="section-title mb-8">Contagem Regressiva</h2>
                    <Countdown dateIso={wedding.date} />
                </div>
            </section>

            {/* Atalhos */}
            <section className="bg-white py-16">
                <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { href: "/nossa-historia", title: "Nossa História", text: "Como tudo começou." },
                        { href: "/local", title: "Local", text: "Cerimônia e festa." },
                        { href: "/dress-code", title: "Dress Code", text: "O que vestir." },
                        { href: "/presentes", title: "Presentes", text: "Contribua com um presente." },
                    ].map((c) => (
                        <Link
                            key={c.href}
                            href={c.href}
                            className="rounded-2xl border border-sand p-8 text-center transition hover:shadow-md"
                        >
                            <h3 className="font-serif text-xl">{c.title}</h3>
                            <p className="mt-2 text-sm text-stone">{c.text}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}