import { listGifts } from "@/lib/gifts";
import { GiftGrid } from "@/components/GiftGrid";
import { PixSection } from "@/components/PixSection";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import type { GiftWithStock } from "@/lib/stock";

export const metadata = { title: "Lista de Presentes" };
export const dynamic = "force-dynamic";

export default async function GiftsPage() {
  let gifts: GiftWithStock[] = [];
  let loadError: string | null = null;
  try {
    gifts = await listGifts();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Erro ao carregar presentes.";
  }

  return (
    <>
      <PageHero
        eyebrow="Se quiser nos presentear"
        title={["Lista de", "Presentes"]}
        text="Sua presença já é o maior presente. Mas se quiser nos mimar, aqui vão algumas sugestões. O pagamento é feito com segurança via Mercado Pago (cartão, Pix ou boleto)."
        photo="/images/ensaio/ensaio-10.jpg"
        alt=""
        // Atalho para quem ja chegou decidido a mandar um Pix: o bloco de Pix
        // fica no fim de uma lista longa, e rolar tudo ate la e um pedagio.
        // E uma ancora de verdade, nao um onClick: funciona sem JavaScript, o
        // `scroll-behavior: smooth` do <html> faz a descida, e quem pediu
        // "menos animacao" no sistema recebe o salto direto.
        action={
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
        }
      />

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
            <GiftGrid gifts={gifts} />
          )}

          <PixSection />
        </div>
      </section>
    </>
  );
}
