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
        objectPosition="50% 40%"
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
