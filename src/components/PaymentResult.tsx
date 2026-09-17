import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";

/**
 * Tela de retorno do Mercado Pago. Vive fora do fluxo normal do site -- a
 * pessoa chega aqui vinda de outro dominio -- entao ela e curta e direta,
 * mas com a mesma moldura em arco do resto.
 */
export function PaymentResult({
  title,
  message,
  tone,
}: {
  title: string;
  message: string;
  tone: "success" | "pending" | "error";
}) {
  const accent =
    tone === "success"
      ? "text-gold"
      : tone === "pending"
        ? "text-sky"
        : "text-lilac";

  const eyebrow =
    tone === "success"
      ? "Recebemos"
      : tone === "pending"
        ? "Quase lá"
        : "Não foi desta vez";

  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-night">
      <Image
        src="/images/ensaio/ensaio-11.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-[60%_45%] opacity-45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-night/90 via-night/70 to-night"
      />
      <div
        aria-hidden="true"
        className="grain pointer-events-none absolute inset-0 overflow-hidden"
      />

      <div
        className="container-page relative w-full pb-20 text-center"
        style={{ paddingTop: "calc(var(--header-h) + 4rem)" }}
      >
        <Reveal>
          <p className={`eyebrow-light ${accent}`}>{eyebrow}</p>
        </Reveal>

        <SplitText
          as="h1"
          lines={[title]}
          className="display-lg mx-auto mt-5 max-w-3xl text-cream"
        />

        <Reveal delay={200} className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-8">
          <span className="rule-gold" />
          <p className="lede-light">{message}</p>
          <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/presentes" className="btn-light w-full sm:w-auto">
              Voltar aos presentes
            </Link>
            <Link href="/" className="btn-light w-full sm:w-auto">
              Página inicial
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
