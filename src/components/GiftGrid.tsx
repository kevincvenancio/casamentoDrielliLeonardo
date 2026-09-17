"use client";

import { useEffect, useRef, useState } from "react";
import type { GiftWithStock } from "@/lib/stock";
import { formatBRL } from "@/lib/format";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Aviso de estoque abaixo do preço.
 *
 * Estoque ilimitado (`remaining === null`) não mostra nada: o presente
 * simplesmente continua na lista para sempre. Quando há limite, só
 * avisamos na reta final, para não transformar a lista num inventário.
 */
function StockNote({ gift }: { gift: GiftWithStock }) {
    if (gift.remaining === null) return null;

    if (gift.soldOut) {
        return (
            <p className="mt-1 text-sm text-stone">
                {gift.soldOutReason === "reserved"
                    ? "Alguém está finalizando o pagamento agora. Volte em alguns minutos."
                    : "Todas as unidades já foram presenteadas."}
            </p>
        );
    }

    if (gift.remaining <= 3) {
        return (
            <p className="mt-1 text-sm text-amber-700">
                {gift.remaining === 1
                    ? "Última unidade!"
                    : `Restam ${gift.remaining} unidades`}
            </p>
        );
    }

    return null;
}

/**
 * Imagem do presente com fallback para o titulo quando a imagem falha
 * (URL quebrada, arquivo ainda nao enviado, offline).
 *
 * Trata os DOIS momentos de falha:
 * - onError: imagem que falha depois da hidratacao (ex.: lazy, fora da tela).
 * - ref: imagem que ja falhou ANTES do React hidratar -- o evento `error`
 *   dispara no DOM antes do handler existir e seria perdido; aqui checamos
 *   `complete && naturalWidth === 0` assim que o elemento monta.
 */
function GiftImage({ gift }: { gift: GiftWithStock }) {
    const [broken, setBroken] = useState(false);

    if (!gift.image_url || broken) {
        return (
            <span className="px-4 text-center font-serif text-xl text-stone">
                {gift.title}
            </span>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={(el) => {
                if (el && el.complete && el.naturalWidth === 0) setBroken(true);
            }}
            src={gift.image_url}
            alt={gift.title}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-silk group-hover:scale-[1.06]"
            loading="lazy"
            onError={() => setBroken(true)}
        />
    );
}

export function GiftGrid({ gifts }: { gifts: GiftWithStock[] }) {
    const [selected, setSelected] = useState<GiftWithStock | null>(null);

    if (gifts.length === 0) {
        return (
            <p className="text-center text-stone">
                A lista de presentes ainda está sendo preparada. Volte em breve!
            </p>
        );
    }

    return (
        <>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {gifts.map((gift, i) => {
                    // Presente comprado NAO sai da lista: so fica indisponivel
                    // se tiver limite de estoque e ele tiver acabado.
                    const available = !gift.soldOut;
                    return (
                        <Reveal
                            key={gift.id}
                            // A cascata reinicia a cada fileira: quem rola vê
                            // sempre uma onda curta, não um atraso crescente.
                            delay={(i % 3) * 110}
                            className="h-full"
                        >
                          {/* O cartão é FILHO do Reveal, e não ele mesmo: o
                              estado final da revelação fixa `transform: none`,
                              que apagaria o levantar do hover. */}
                          <div className="group card card-hover flex h-full flex-col">
                            <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-sand">
                                <GiftImage gift={gift} />
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="font-serif text-2xl font-normal leading-tight text-ink">
                                    {gift.title}
                                </h3>
                                {gift.description && (
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-stone">
                                        {gift.description}
                                    </p>
                                )}
                                <p className="mt-4 font-serif text-2xl text-ink">
                                    {formatBRL(gift.price_cents)}
                                </p>
                                <StockNote gift={gift} />
                                <div className="mt-5">
                                    {available ? (
                                        <button
                                            className="btn-primary w-full"
                                            onClick={() => setSelected(gift)}
                                        >
                                            Presentear
                                        </button>
                                    ) : (
                                        <span className="inline-flex w-full items-center justify-center rounded-full border border-sand bg-sand/60 px-6 py-3.5 text-[0.8rem] uppercase tracking-[0.18em] text-stone">
                                            {gift.soldOutReason === "reserved"
                                                ? "Reservado"
                                                : "Esgotado"}
                                        </span>
                                    )}
                                </div>
                            </div>
                          </div>
                        </Reveal>
                    );
                })}
            </div>

            {selected && (
                <CheckoutModal gift={selected} onClose={() => setSelected(null)} />
            )}
        </>
    );
}

function CheckoutModal({
    gift,
    onClose,
}: {
    gift: GiftWithStock;
    onClose: () => void;
}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    // Abriu: o foco vai para o primeiro campo e o fundo para de rolar atrás
    // do painel. Só na montagem -- nada aqui depende do estado do formulário.
    useEffect(() => {
        nameRef.current?.focus();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    // Esc fecha. Fica num efeito separado porque depende de `loading`: enquanto
    // o checkout é criado, fechar perderia o pedido em andamento. Juntar os
    // dois efeitos faria o foco voltar ao campo de nome a cada envio.
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape" && !loading) onClose();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, loading]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!name.trim()) {
            setError("Informe seu nome.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    giftId: gift.id,
                    buyerName: name.trim(),
                    buyerEmail: email.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Não foi possível iniciar o pagamento.");
                setLoading(false);
                return;
            }
            window.location.href = data.init_point;
        } catch {
            setError("Erro de conexão. Tente novamente.");
            setLoading(false);
        }
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`Presentear: ${gift.title}`}
            className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-night/70 p-4 backdrop-blur-sm lite-drop-blur"
            onClick={onClose}
        >
            <div
                className="mx-auto flex min-h-full w-full max-w-md items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="animate-fade-up w-full overflow-hidden rounded-[1.25rem] border border-sand bg-cream p-7 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.7)]">
                    <p className="eyebrow">Presentear</p>
                    <h3 className="mt-3 font-serif text-3xl font-light leading-tight text-ink">
                        {gift.title}
                    </h3>
                    <p className="mt-2 font-serif text-2xl text-gold">
                        {formatBRL(gift.price_cents)}
                    </p>

                    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                        <div>
                            <label className="field-label" htmlFor="checkout-nome">
                                Seu nome *
                            </label>
                            <input
                                id="checkout-nome"
                                ref={nameRef}
                                className="field-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="field-label" htmlFor="checkout-email">
                                Seu e-mail
                            </label>
                            <input
                                id="checkout-email"
                                type="email"
                                className="field-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-sm text-red-700">{error}</p>}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                className="btn-outline flex-1"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={loading}
                            >
                                {loading ? "Redirecionando..." : "Ir para pagamento"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
