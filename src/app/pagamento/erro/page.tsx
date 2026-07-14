import { PaymentResult } from "@/components/PaymentResult";

export const metadata = { title: "Pagamento nao concluido" };

export default function ErrorPage() {
  return (
    <PaymentResult
      tone="error"
      title="Pagamento nao concluido"
      message="Algo deu errado com o pagamento e ele nao foi finalizado. O presente continua disponivel na lista, sinta-se a vontade para tentar novamente."
    />
  );
}
