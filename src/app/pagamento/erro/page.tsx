import { PaymentResult } from "@/components/PaymentResult";

export const metadata = { title: "Pagamento não concluído" };

export default function ErrorPage() {
  return (
    <PaymentResult
      tone="error"
      title="Pagamento não concluído"
      message="Algo deu errado com o pagamento e ele não foi finalizado. O presente continua disponível na lista, sinta-se à vontade para tentar novamente."
    />
  );
}
