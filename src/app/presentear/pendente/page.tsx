import { PaymentResult } from "@/components/PaymentResult";
import { GIFT_ONLY_PATH } from "@/lib/gift-only";

export const metadata = { title: "Pagamento pendente" };

export default function GiftOnlyPendingPage() {
  return (
    <PaymentResult
      tone="pending"
      title="Pagamento pendente"
      message="Seu pagamento está sendo processado (isso é comum com boleto ou Pix). Assim que for aprovado, o presente será confirmado automaticamente. Obrigado!"
      backHref={GIFT_ONLY_PATH}
      homeLink={false}
    />
  );
}
