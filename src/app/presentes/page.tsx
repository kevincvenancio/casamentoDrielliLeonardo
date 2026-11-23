import { GiftsSection, PixShortcut } from "@/components/GiftsSection";
import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Lista de Presentes" };
export const dynamic = "force-dynamic";

export default function GiftsPage() {
  return (
    <>
      <PageHero
        eyebrow="Se quiser nos presentear"
        title={["Lista de", "Presentes"]}
        text="Sua presença já é o maior presente. Mas se quiser nos mimar, aqui vão algumas sugestões. O pagamento é feito com segurança via Mercado Pago (cartão, Pix ou boleto)."
        photo="/images/ensaio/ensaio-10.jpg"
        alt=""
        action={<PixShortcut />}
      />

      <GiftsSection origin="site" />
    </>
  );
}
