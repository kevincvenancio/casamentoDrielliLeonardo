/**
 * Fonte unica de verdade para TODO o conteudo textual do site.
 * Edite este arquivo para personalizar nomes, datas, historia, enderecos etc.
 * Dados abaixo sao PLACEHOLDER plausiveis.
 */

export const wedding = {
  couple: {
    bride: "Drielli",
    groom: "Leonardo",
    hashtag: "#DrielliELeo",
  },

  // Data e hora da cerimonia (ISO 8601, fuso America/Sao_Paulo).
  // Usada na contagem regressiva.
  date: "2026-11-14T16:00:00-03:00",
  dateLabel: "14 de Novembro de 2026",
  timeLabel: "16h00",

  // Frase curta do hero
  tagline: "Vao dizer sim!",

  // Imagem de capa (coloque a foto em /public ou use uma URL)
  coverImage: "/images/cover.jpg",

  contactEmail: "casamento@drielli-leo.com.br",

  story: {
    title: "Nossa Historia",
    intro:
      "Cada casal tem uma historia; a nossa comecou de um jeito simples e virou o que sempre sonhamos.",
    timeline: [
      {
        year: "2018",
        title: "O primeiro encontro",
        text: "Nos conhecemos em uma festa de amigos em comum e conversamos a noite inteira.",
      },
      {
        year: "2019",
        title: "O namoro",
        text: "Depois de meses de amizade, decidimos que era hora de tentar algo mais serio.",
      },
      {
        year: "2022",
        title: "Morando juntos",
        text: "Alugamos nosso primeiro apartamento e adotamos a Nina, nossa cachorrinha.",
      },
      {
        year: "2025",
        title: "O pedido",
        text: "Em uma viagem para a praia, veio o pedido de casamento ao por do sol.",
      },
      {
        year: "2026",
        title: "O grande dia",
        text: "E agora queremos celebrar esse amor com quem faz parte da nossa vida.",
      },
    ],
  },

  venue: {
    ceremony: {
      name: "Igreja Nossa Senhora da Paz",
      address: "Rua das Flores, 123 - Centro, Sao Paulo - SP",
      time: "16h00",
      // URL para o embed do Google Maps (modo /embed)
      mapEmbedUrl:
        "https://www.google.com/maps?q=Praca+da+Se,+Sao+Paulo&output=embed",
      mapLink: "https://maps.google.com/?q=Praca+da+Se,+Sao+Paulo",
    },
    party: {
      name: "Espaco Jardim das Acacias",
      address: "Av. dos Ipes, 456 - Jardins, Sao Paulo - SP",
      time: "18h00",
      mapEmbedUrl:
        "https://www.google.com/maps?q=Parque+Ibirapuera,+Sao+Paulo&output=embed",
      mapLink: "https://maps.google.com/?q=Parque+Ibirapuera,+Sao+Paulo",
    },
  },

  rsvp: {
    // Prazo para confirmacao de presenca (texto livre)
    deadlineLabel: "Confirme ate 30 de Outubro de 2026",
    maxCompanions: 5,
  },
} as const;

export type WeddingConfig = typeof wedding;
