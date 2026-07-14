import { listGifts } from "@/lib/gifts";
import { GiftGrid } from "@/components/GiftGrid";
import type { Gift } from "@/lib/types";

export const metadata = { title: "Lista de Presentes" };
export const dynamic = "force-dynamic";

export default async function GiftsPage() {
  let gifts: Gift[] = [];
  let loadError: string | null = null;
  try {
    gifts = await listGifts();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Erro ao carregar presentes.";
  }

  return (
    <div className="container-page py-16">
      <header className="mb-12 text-center">
        <h1 className="section-title">Lista de Presentes</h1>
        <p className="mx-auto mt-4 max-w-2xl text-stone">
          Sua presenca ja e o maior presente. Mas se quiser nos presentear, aqui
          vao algumas sugestoes. O pagamento e feito com seguranca via Mercado
          Pago (cartao, Pix ou boleto).
        </p>
      </header>

      {loadError ? (
        <p className="rounded-lg border border-sand bg-white p-6 text-center text-stone">
          Nao foi possivel carregar a lista agora. Verifique a configuracao do
          Supabase. ({loadError})
        </p>
      ) : (
        <GiftGrid gifts={gifts} />
      )}
    </div>
  );
}
