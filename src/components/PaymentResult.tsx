import Link from "next/link";

export function PaymentResult({
  title,
  message,
  tone,
}: {
  title: string;
  message: string;
  tone: "success" | "pending" | "error";
}) {
  const color =
    tone === "success"
      ? "text-green-700"
      : tone === "pending"
      ? "text-amber-700"
      : "text-red-700";

  return (
    <div className="container-page py-24 text-center">
      <div className="mx-auto max-w-md rounded-2xl border border-sand bg-white p-8">
        <h1 className={`font-serif text-3xl ${color}`}>{title}</h1>
        <p className="mt-4 text-stone">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/presentes" className="btn-outline">
            Voltar aos presentes
          </Link>
          <Link href="/" className="btn-primary">
            Pagina inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
