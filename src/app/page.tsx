import { HeroScene } from "@/components/home/HeroScene";
import { InvitationScene } from "@/components/home/InvitationScene";
import { CountdownScene } from "@/components/home/CountdownScene";
import { TimelineScene } from "@/components/home/TimelineScene";
import { VenueScene } from "@/components/home/VenueScene";
import { NavCards } from "@/components/home/NavCards";
import { ClosingScene } from "@/components/home/ClosingScene";

/**
 * A home e uma sequencia de cenas, e a ordem conta uma historia:
 *
 *   1. o mar        -- quem sao, quando e
 *   2. o convite    -- o monograma e o chamado
 *   3. o relogio    -- quanto falta
 *   4. a caminhada  -- como chegaram ate aqui (a foto presa, o texto rolando)
 *   5. o lugar      -- onde sera
 *   6. as portas    -- tudo o que o convidado precisa saber
 *   7. o pôr do sol -- o pedido de confirmacao
 *
 * Cada cena alterna entre claro e escuro de proposito: a troca de fundo e o
 * que marca a virada de capitulo enquanto a pessoa rola. O cabecalho acompanha
 * essa alternancia: as cenas escuras se anunciam com `data-header` e a barra
 * troca de roupa enquanto esta sobre elas (ver SiteHeader).
 */
export default function HomePage() {
  return (
    <>
      <HeroScene />
      <InvitationScene />
      <CountdownScene />
      <TimelineScene />
      <VenueScene />
      <NavCards />
      <ClosingScene />
    </>
  );
}
