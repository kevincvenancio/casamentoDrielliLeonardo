import type { Metadata } from "next";
import { wedding } from "@/config/wedding";

// Vale para a lista avulsa e para as telas de retorno do pagamento dela.
// Fora dos buscadores (so chega aqui quem recebeu o link) e sem a descricao
// padrao do site, que fala em confirmar presenca.
export const metadata: Metadata = {
  description: `Lista de presentes de ${wedding.couple.bride} e ${wedding.couple.groom}.`,
  robots: { index: false, follow: false },
};

export default function GiftOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
