import Link from "next/link";
import { wedding } from "@/config/wedding";
import { Countdown } from "@/components/Countdown";

export default function HomePage() {
    return (
        <div>
            {/* Hero: foto e texto lado a lado.
                A capa e uma foto vertical com o casal bem no centro. Usada como
                fundo de tela cheia, o bloco de texto caia em cima deles em
                qualquer enquadramento possivel -- no desktop o `cover` usa a
                largura toda (sem folga horizontal) e no mobile a altura cabe
                inteira (sem folga vertical). Aqui cada um tem seu espaco. */}
            <section className="bg-cream">
                <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-14 lg:py-20">
                    {/* Foto: em cima no mobile, coluna da direita no desktop.
                        aspect-[3/4] e a proporcao real de cover.jpg (960x1280),
                        entao o bg-cover preenche sem cortar nada. Se trocarem a
                        foto por uma de outra proporcao, ajuste este valor.
                        Sem o arquivo, sobra o bg-sand: um bloco neutro, em vez
                        de icone de imagem quebrada. */}
                    <div
                        role="img"
                        aria-label={`${wedding.couple.bride} e ${wedding.couple.groom}`}
                        className="order-first aspect-[3/4] w-full overflow-hidden rounded-2xl border border-sand bg-sand bg-cover bg-center lg:order-last"
                        style={{ backgroundImage: `url('${wedding.coverImage}')` }}
                    />

                    <div className="text-center lg:text-left">
                        {wedding.logo && (
                            // Sem o medalhao claro de antes: aqui o fundo ja e
                            // creme, entao o monograma escuro aparece direto.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={wedding.logo}
                                alt={`${wedding.couple.bride} & ${wedding.couple.groom}`}
                                className="mx-auto mb-6 h-24 w-auto sm:h-28 lg:mx-0"
                            />
                        )}
                        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-stone sm:text-sm">
                            {wedding.tagline}
                        </p>
                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl">
                            {wedding.couple.bride}
                            <span className="mx-2 font-normal sm:mx-3">&</span>
                            {wedding.couple.groom}
                        </h1>
                        <p className="mt-4 text-base tracking-wide text-stone sm:text-lg">
                            {wedding.dateLabel} · {wedding.timeLabel}
                        </p>
                        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                            <Link href="/rsvp" className="btn-primary w-full sm:w-auto">
                                Confirmar Presença
                            </Link>
                            <Link href="/presentes" className="btn-outline w-full sm:w-auto">
                                Lista de Presentes
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Countdown */}
            {/* border-t: o hero agora tambem e creme, sem isso as duas secoes
                viram um bloco unico sem respiro. */}
            <section className="border-t border-sand bg-cream py-16">
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
                        { href: "/manual-do-convidado", title: "Manual", text: "Combinados para o dia." },
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