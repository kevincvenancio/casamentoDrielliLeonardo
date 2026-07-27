"use client";

import { useState } from "react";
import { wedding } from "@/config/wedding";

/**
 * Bloco de Pix direto no fim da lista de presentes. O QR fica escondido atras
 * de um botao (a maioria vai querer so os presentes; quem quer Pix pede) e a
 * chave "copia e cola" pode ser copiada com um toque.
 */
export function PixSection() {
    const { pix } = wedding;
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    async function copyKey() {
        try {
            // navigator.clipboard exige contexto seguro (https/localhost).
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(pix.key);
            } else {
                // Fallback para http ou navegadores antigos.
                const ta = document.createElement("textarea");
                ta.value = pix.key;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Se nem o fallback funcionar, o texto continua selecionavel na tela.
            setCopied(false);
        }
    }

    return (
        <section className="mx-auto mt-16 max-w-2xl rounded-2xl border border-sand bg-white p-8 text-center">
            <h2 className="font-serif text-2xl text-ink">{pix.title}</h2>
            <p className="mx-auto mt-3 max-w-md text-stone">{pix.text}</p>

            {!open ? (
                <button
                    type="button"
                    className="btn-primary mt-6"
                    onClick={() => setOpen(true)}
                    aria-expanded={false}
                    aria-controls="pix-detalhes"
                >
                    Fazer um Pix
                </button>
            ) : (
                <div id="pix-detalhes" className="mt-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={pix.qrImage}
                        alt={`QR Code do Pix para ${pix.recipient}`}
                        className="mx-auto h-56 w-56 rounded-xl border border-sand bg-white object-contain p-2"
                    />
                    <p className="mt-3 text-sm text-stone">{pix.recipient}</p>

                    <div className="mx-auto mt-6 max-w-md">
                        <p className="field-label text-left">Pix copia e cola</p>
                        <p className="select-all break-all rounded-lg border border-sand bg-cream px-3 py-2 text-left text-xs text-stone">
                            {pix.key}
                        </p>
                        <button
                            type="button"
                            className="btn-outline mt-3 w-full"
                            onClick={copyKey}
                        >
                            {copied ? "Chave copiada!" : "Copiar chave Pix"}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
