import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { wedding } from "@/config/wedding";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MotionGuard } from "@/components/motion/MotionGuard";

// Serifada de alto contraste, em peso leve: e ela que da o ar de convite
// impresso aos titulos grandes.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${wedding.couple.bride} & ${wedding.couple.groom} | ${wedding.dateLabel}`,
    template: `%s | ${wedding.couple.bride} & ${wedding.couple.groom}`,
  },
  description: `Site de casamento de ${wedding.couple.bride} e ${wedding.couple.groom}. Confirme sua presenca e escolha um presente.`,
};

export const viewport: Viewport = {
  themeColor: "#0B1520",
  // A barra do navegador acompanha o fundo creme da pagina.
  colorScheme: "light",
};

/**
 * Roda antes da primeira pintura, por isso e um script inline e nao um
 * componente:
 *
 * - `data-motion="on"` liga as animacoes. Sem ele (JS desligado, script que
 *   falhou), o CSS mantem tudo visivel e parado, em vez de deixar a pagina
 *   em branco esperando uma revelacao que nunca chega.
 * - `data-lite="1"` marca aparelho modesto -- pouca memoria, poucos nucleos
 *   ou conexao economica. O CSS desliga desfoques e texturas, e as camadas
 *   continuam se movendo.
 */
const bootScript = `(function(){var d=document.documentElement;d.dataset.motion="on";try{var n=navigator,l=false,m=n.deviceMemory,c=n.hardwareConcurrency,k=n.connection;if(typeof m==="number"&&m<=4)l=true;if(typeof c==="number"&&c<=2)l=true;if(k&&(k.saveData===true||/(^|-)2g$/.test(k.effectiveType||"")))l=true;if(l)d.dataset.lite="1";}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${serif.variable} ${sans.variable}`}
      // O script inline abaixo escreve `data-motion` (e as vezes `data-lite`)
      // na tag <html> ANTES da hidratacao -- de proposito, para nao haver um
      // piscar de conteudo. Sem esta linha o React acusa "extra attributes
      // from the server" em toda pagina no modo dev. Vale so para os
      // atributos DESTA tag; o resto da arvore continua sendo conferido.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-cream font-sans">
        <MotionGuard />
        <SiteHeader />
        {/* O header e fixo: cada pagina abre com o proprio topo, ja com a
            folga necessaria, para o conteudo nunca nascer debaixo dele. */}
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
