import { GiftsSection, PixShortcut } from "@/components/GiftsSection";
import { PageHero } from "@/components/PageHero";

// Link avulso para quem quer presentear sem ser convidado (ver
// src/lib/gift-only.ts).
export const metadata = { title: "Lista de Presentes" };
export const dynamic = "force-dynamic";

export default function GiftOnlyPage() {
  return (
    <>
      <PageHero
        eyebrow="Com carinho"
        title={["Lista de", "Presentes"]}
        text="Ficamos muito felizes com o seu carinho! Se quiser nos presentear, aqui vão algumas sugestões. O pagamento é feito com segurança via Mercado Pago (cartão, Pix ou boleto)."
        photo="/images/ensaio/ensaio-10.jpg"
        alt=""
        action={<PixShortcut />}
      />

      <GiftsSection origin="avulso" />
    </>
  );
}
