import { PaymentResult } from "@/components/PaymentResult";

export const metadata = { title: "Pagamento aprovado" };

export default function SuccessPage() {
  return (
    <PaymentResult
      tone="success"
      title="Pagamento aprovado!"
      message="Muito obrigado pelo carinho e pelo presente. A confirmacao final acontece automaticamente e o presente ja consta como seu. Nos vemos no grande dia!"
    />
  );
}
