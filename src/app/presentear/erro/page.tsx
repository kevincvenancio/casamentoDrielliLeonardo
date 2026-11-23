import { PaymentResult } from "@/components/PaymentResult";
import { GIFT_ONLY_PATH } from "@/lib/gift-only";

export const metadata = { title: "Pagamento não concluído" };

export default function GiftOnlyErrorPage() {
  return (
    <PaymentResult
      tone="error"
      title="Pagamento não concluído"
      message="Algo deu errado com o pagamento e ele não foi finalizado. O presente continua disponível na lista, sinta-se à vontade para tentar novamente."
      backHref={GIFT_ONLY_PATH}
      homeLink={false}
    />
  );
}
