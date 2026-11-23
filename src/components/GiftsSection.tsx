import { listGifts } from "@/lib/gifts";
import { GiftGrid } from "@/components/GiftGrid";
import { PixSection } from "@/components/PixSection";
import { Reveal } from "@/components/motion/Reveal";
import type { GiftWithStock } from "@/lib/stock";
import type { CheckoutOrigin } from "@/lib/gift-only";

/**
 * Lista de presentes + Pix. Compartilhada pela pagina do site (/presentes) e
 * pela avulsa (/presentear); muda so para onde o pagamento devolve a pessoa.
 */
export async function GiftsSection({ origin }: { origin: CheckoutOrigin }) {
  let gifts: GiftWithStock[] = [];
  let loadError: string | null = null;
  try {
    gifts = await listGifts();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Erro ao carregar presentes.";
  }

  return (
    <section className="relative overflow-hidden bg-cream py-20 sm:py-28">
      <div className="container-page relative">
        {loadError ? (
          <Reveal className="card mx-auto max-w-xl p-8 text-center">
            <p className="text-stone">
              Não foi possível carregar a lista agora. Verifique a
              configuração do Supabase.
            </p>
            <p className="mt-2 text-xs text-stone/70">({loadError})</p>
          </Reveal>
        ) : (
          <GiftGrid gifts={gifts} origin={origin} />
        )}

        <PixSection />
      </div>
    </section>
  );
}

/**
 * Atalho para quem ja chegou decidido a mandar um Pix: o bloco de Pix
 * fica no fim de uma lista longa, e rolar tudo ate la e um pedagio.
 * E uma ancora de verdade, nao um onClick: funciona sem JavaScript, o
 * `scroll-behavior: smooth` do <html> faz a descida, e quem pediu
 * "menos animacao" no sistema recebe o salto direto.
 */
export function PixShortcut() {
  return (
    <a href="#pix" className="btn-light group">
      Prefiro fazer um Pix
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="ml-2.5 transition-transform duration-500 ease-silk group-hover:translate-y-0.5"
      >
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    </a>
  );
}
