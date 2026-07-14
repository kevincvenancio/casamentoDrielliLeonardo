"use client";

import { useState } from "react";
import type { Gift } from "@/lib/types";
import { formatBRL } from "@/lib/format";

function statusLabel(status: Gift["status"]) {
    if (status === "paid") return "Presenteado";
    if (status === "reserved") return "Reservado";
    return "Disponível";
}

export function GiftGrid({ gifts }: { gifts: Gift[] }) {
    const [selected, setSelected] = useState<Gift | null>(null);
    // Imagens que falharam ao carregar (URL quebrada, fora do ar, offline).
    // Sem isso, o card fica com um retangulo cinza vazio.
    const [brokenImages, setBrokenImages] = useState<Record<string, true>>({});

    if (gifts.length === 0) {
        return (
            <p className="text-center text-stone">
                A lista de presentes ainda está sendo preparada. Volte em breve!
            </p>
        );
    }

    return (
        <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gifts.map((gift) => {
                    const available = gift.status === "available";
                    return (
                        <div
                            key={gift.id}
                            className="flex flex-col overflow-hidden rounded-2xl border border-sand bg-white"
                        >
                            <div className="flex aspect-[4/3] w-full items-center justify-center bg-sand">
                                {gift.image_url && !brokenImages[gift.id] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={gift.image_url}
                                        alt={gift.title}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                        onError={() =>
                                            setBrokenImages((prev) => ({
                                                ...prev,
                                                [gift.id]: true,
                                            }))
                                        }
                                    />
                                ) : (
                                    <span className="px-4 text-center font-serif text-lg text-stone">
                                        {gift.title}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col p-5">
                                <h3 className="font-serif text-xl">{gift.title}</h3>
                                {gift.description && (
                                    <p className="mt-1 flex-1 text-sm text-stone">
                                        {gift.description}
                                    </p>
                                )}
                                <p className="mt-3 text-lg font-medium">
                                    {formatBRL(gift.price_cents)}
                                </p>
                                <div className="mt-4">
                                    {available ? (
                                        <button
                                            className="btn-primary w-full"
                                            onClick={() => setSelected(gift)}
                                        >
                                            Presentear
                                        </button>
                                    ) : (
                                        <span className="inline-flex w-full items-center justify-center rounded-full bg-sand px-6 py-3 text-sm text-stone">
                                            {statusLabel(gift.status)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
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
    gift: Gift;
    onClose: () => void;
}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink/50 p-4"
            onClick={onClose}
        >
            <div
                className="mx-auto flex min-h-full w-full max-w-md items-center"
                onClick={(e) => e.stopPropagation()}
            >
            <div className="w-full rounded-2xl bg-white p-6">
                <h3 className="font-serif text-2xl">Presentear</h3>
                <p className="mt-1 text-stone">
                    {gift.title} — {formatBRL(gift.price_cents)}
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label className="field-label">Seu nome *</label>
                        <input
                            className="field-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="field-label">Seu e-mail</label>
                        <input
                            type="email"
                            className="field-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="btn-outline flex-1"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary flex-1" disabled={loading}>
                            {loading ? "Redirecionando..." : "Ir para pagamento"}
                        </button>
                    </div>
                </form>
            </div>
            </div>
        </div>
    );
}