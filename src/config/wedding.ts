/**
 * Fonte única de verdade para TODO o conteúdo textual do site.
 * Edite este arquivo para personalizar nomes, datas, história, endereços etc.
 */

export const wedding = {
  couple: {
    bride: "Drielli",
    groom: "Leonardo",
    // Sem hashtag definida. Se criarem uma, escreva aqui (ex.: "#LeoEDri2026")
    // que ela aparece automaticamente no rodapé.
    hashtag: "",
  },

  // Data e hora da cerimônia (ISO 8601, fuso America/Sao_Paulo).
  // Usada na contagem regressiva.
  date: "2026-12-06T16:00:00-03:00",
  dateLabel: "6 de Dezembro de 2026",
  timeLabel: "16h00",

  // Frase curta do hero
  tagline: "Vão dizer sim!",

  // Imagem de capa (coloque a foto em /public/images/cover.jpg)
  coverImage: "/images/cover.jpg",

  // Monograma do casal, exibido no topo do site.
  // Se o arquivo nao existir, o header cai para o nome do casal em texto.
  logo: "/images/logo.png",

  contactEmail: "",

  story: {
    title: "Nossa História",
    intro:
      "Nossa caminhada foi construída de momentos, encontros e pessoas especiais. O tempo passa sem que a gente perceba, e só temos a agradecer a quem esteve com a gente ao longo dessa jornada.",
    // Para adicionar um marco, basta acrescentar um item aqui.
    // O campo `text` é opcional -- se quiser contar a história de cada
    // momento, escreva ali que aparece embaixo do título.
    timeline: [
      { date: "2 de março de 2023", title: "A primeira conversa" },
      { date: "22 de abril de 2023", title: "O primeiro date" },
      { date: "8 de junho de 2023", title: "O pedido de namoro" },
      { date: "7 de dezembro de 2025", title: "O pedido de noivado" },
      { date: "6 de dezembro de 2026", title: "O grande dia" },
    ] as { date: string; title: string; text?: string }[],
  },

  // Cerimônia e festa acontecem no MESMO endereço.
  venue: {
    name: "Villa Vezzane",
    address: "R. Benedito Fontana, 510 - Mairiporã, SP, 07627-200",
    time: "16h00",
    mapEmbedUrl:
      "https://www.google.com/maps?q=Villa+Vezzane,+R.+Benedito+Fontana,+510+-+Mairipor%C3%A3,+SP,+07627-200&output=embed",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=Villa+Vezzane%2C+R.+Benedito+Fontana%2C+510+-+Mairipor%C3%A3%2C+SP%2C+07627-200",
  },

  dressCode: {
    title: "Dress Code",
    style: "Esporte fino",
    intro:
      "Para nos ajudar a compor o clima da festa, pedimos que os trajes sigam o esporte fino.",
    women: "Vestido midi ou longo.",
    men: "Calça social com camisa. Se quiser, complemente com blazer ou gravata.",

    // Fotos de referencia. Para adicionar mais:
    // 1. salve o arquivo em /public/images/dress-code/
    // 2. acrescente uma linha aqui com src e alt.
    // Atencao: a foto e um EXEMPLO do que vestir -- nao inclua imagens com as
    // cores da lista `avoidColors`, nem com camiseta/tenis (nao e esporte fino).
    womenPhotos: [
      {
        src: "/images/dress-code/elas-vestidos-midi.jpeg",
        alt: "Dois vestidos midi de referência, um verde e um laranja",
      },
    ],
    menPhotos: [
      {
        src: "/images/dress-code/eles-calca-camisa.jpeg",
        alt: "Calça social cinza com camisa azul-marinho e sapato social",
      },
    ],

    // Colagem de referencia de cores permitidas.
    palettePhoto: {
      src: "/images/dress-code/paleta-cores.jpeg",
      alt: "Colagem com dezenas de vestidos em cores variadas: verde, azul, vinho, mostarda, terracota",
    },
    // Cores reservadas para a noiva e o cortejo -- pedimos que as convidadas evitem.
    avoidColors: [
      { label: "Branco", hex: "#FFFFFF" },
      { label: "Bege", hex: "#E8DCC8" },
      { label: "Nude", hex: "#E3C5B5" },
      { label: "Lilás", hex: "#C8A2C8" },
      { label: "Azul serenity", hex: "#92A8D1" },
    ],
    avoidNote:
      "Pedimos às convidadas que evitem estas cores. Elas estão reservadas para a noiva e o cortejo.",
  },

  // Manual do convidado. Para editar, mexa só no texto -- o `icon` liga com
  // o desenho correspondente em src/components/ManualIcons.tsx.
  guestManual: {
    title: "Manual do Convidado",
    intro:
      "Alguns pedidos para que o dia seja leve e especial para todo mundo.",
    items: [
      {
        icon: "check",
        title: "Confirme sua presença",
        text: "Nos ajuda a organizar os lugares e o buffet. Confirme até 31 de outubro.",
      },
      {
        icon: "phone",
        title: "Deixe o celular no silencioso",
        text: "Principalmente durante a cerimônia.",
      },
      {
        icon: "envelope",
        title: "Convidado não convida",
        text: "O convite vale para as pessoas nomeadas nele.",
      },
      {
        icon: "clock",
        title: "Não se atrase",
        text: "A cerimônia começa às 16h. Chegue com antecedência para não perder a entrada.",
      },
      {
        icon: "church",
        title: "Participe da cerimônia",
        text: "É o momento mais importante do dia, e queremos você lá.",
      },
      {
        icon: "camera",
        title: "Não atrapalhe os fotógrafos",
        text: "Eles têm um roteiro a cumprir. Aproveite o momento com os olhos — as fotos a gente compartilha depois.",
      },
      {
        icon: "dress",
        title: "Branco é a cor da noiva",
        text: "Veja as cores reservadas na página de dress code.",
      },
      {
        icon: "cake",
        title: "Aguarde a liberação da mesa de doces",
        text: "Ela é aberta depois do corte do bolo.",
      },
      {
        icon: "flowers",
        title: "Não leve a decoração para casa",
        text: "Os arranjos são alugados e precisam voltar para o fornecedor.",
      },
      {
        icon: "chat",
        title: "Nada de comentários negativos",
        text: "Foi tudo pensado com muito carinho. Se algo não sair como o esperado, deixe passar.",
      },
      {
        icon: "confetti",
        title: "Aproveite bastante",
        text: "Coma, dance e celebre com a gente. A festa é para você também.",
      },
      {
        icon: "couple",
        title: "Não vá embora sem se despedir",
        text: "Queremos abraçar você antes do fim da noite.",
      },
    ],
  },

  rsvp: {
    deadlineLabel: "Confirme até 31 de Outubro de 2026",
    maxCompanions: 5,
  },
} as const;

export type WeddingConfig = typeof wedding;
