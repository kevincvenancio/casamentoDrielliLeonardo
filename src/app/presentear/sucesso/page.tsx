import { PaymentResult } from "@/components/PaymentResult";
import { GIFT_ONLY_PATH } from "@/lib/gift-only";

export const metadata = { title: "Pagamento aprovado" };

export default function GiftOnlySuccessPage() {
  return (
    <PaymentResult
      tone="success"
      title="Pagamento aprovado!"
      message="Muito obrigado pelo carinho e pelo presente! A confirmação acontece automaticamente e o presente já consta como seu."
      backHref={GIFT_ONLY_PATH}
      homeLink={false}
    />
  );
}
