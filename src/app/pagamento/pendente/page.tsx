import { PaymentResult } from "@/components/PaymentResult";

export const metadata = { title: "Pagamento pendente" };

export default function PendingPage() {
  return (
    <PaymentResult
      tone="pending"
      title="Pagamento pendente"
      message="Seu pagamento esta sendo processado (isso e comum com boleto ou Pix). Assim que for aprovado, o presente sera confirmado automaticamente. Obrigado!"
    />
  );
}
