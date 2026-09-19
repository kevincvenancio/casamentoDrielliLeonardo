"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { wedding } from "@/config/wedding";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Bloco de Pix direto no fim da lista de presentes. O QR fica escondido atras
 * de um botao (a maioria vai querer so os presentes; quem quer Pix pede) e a
 * chave "copia e cola" pode ser copiada com um toque.
 */
export function PixSection() {
    const { pix } = wedding;
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Quem chega pela ancora #pix -- o atalho no topo da pagina de presentes,
    // ou um link compartilhado -- ja disse o que quer. Abrir o QR direto
    // poupa um clique que so existia para nao pesar a lista de quem nao veio
    // atras de Pix. Quem rola a pagina normalmente continua vendo o bloco
    // fechado.
    useEffect(() => {
        const abrirSeForOAlvo = () => {
            if (window.location.hash === "#pix") setOpen(true);
        };
        abrirSeForOAlvo();
        // A ancora na mesma pagina troca o hash sem remontar o componente.
        window.addEventListener("hashchange", abrirSeForOAlvo);
        return () => window.removeEventListener("hashchange", abrirSeForOAlvo);
    }, []);

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
        <Reveal
            as="section"
            variant="scale"
            // Destino do atalho que fica no topo da pagina de presentes.
            // O `scroll-padding-top` do <html> (globals.css) ja desconta o
            // header fixo, entao a ancora para na altura certa.
            id="pix"
            className="relative mx-auto mt-20 max-w-3xl overflow-hidden rounded-[1.25rem] border border-cream/12 bg-night p-9 text-center sm:mt-28 sm:p-14"
        >
            {/* Clarão dourado subindo do rodapé do bloco. */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-48 opacity-50"
                style={{
                    background:
                        "radial-gradient(60% 100% at 50% 100%, rgba(196,160,99,0.45), transparent 70%)",
                }}
            />

            <div className="relative">
                <p className="eyebrow-light">Pix direto</p>
                <h2 className="display-md mt-4 text-cream">{pix.title}</h2>
                <p className="lede-light mx-auto mt-5 max-w-md">{pix.text}</p>

                {!open ? (
                    <button
                        type="button"
                        className="btn-light mt-9"
                        onClick={() => setOpen(true)}
                        aria-expanded={false}
                        aria-controls="pix-detalhes"
                    >
                        Fazer um Pix
                    </button>
                ) : (
                    <div id="pix-detalhes" className="animate-fade-up mt-10">
                        {/* O QR fica sobre branco puro e com folga em volta:
                            é o que a câmera do banco precisa para ler. */}
                        <div className="mx-auto w-fit rounded-2xl border border-cream/15 bg-white p-3">
                            <Image
                                src={pix.qrImage}
                                alt={`QR Code do Pix para ${pix.recipient}`}
                                width={354}
                                height={351}
                                className="h-52 w-52 object-contain"
                            />
                        </div>
                        <p className="mt-4 text-sm text-cream/60">{pix.recipient}</p>

                        <div className="mx-auto mt-8 max-w-md text-left">
                            <p className="eyebrow-light mb-2">Pix copia e cola</p>
                            <p className="select-all break-all rounded-xl border border-cream/12 bg-cream/[0.06] px-4 py-3 text-xs leading-relaxed text-cream/70">
                                {pix.key}
                            </p>
                            <button
                                type="button"
                                className="btn-light mt-4 w-full"
                                onClick={copyKey}
                            >
                                {copied ? "Chave copiada!" : "Copiar chave Pix"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Reveal>
    );
}
