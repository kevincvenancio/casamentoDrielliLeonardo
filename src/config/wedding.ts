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
  date: "2026-12-06T15:00:00-03:00",
  dateLabel: "6 de Dezembro de 2026",
  timeLabel: "15h00",

  // Frase curta do hero
  tagline: "Vão dizer sim!",

  // Textos que a home usa nas cenas de rolagem. Cada `lines` é uma lista de
  // linhas: elas sobem uma a uma, na ordem, conforme a pessoa rola. Quebrar
  // a frase em linhas curtas é o que dá o ritmo -- evite linhas longas.
  home: {
    // Convite em tela cheia, logo depois do hero.
    invitation: {
      eyebrow: "O convite",
      lines: [
        "Depois de tantos",
        "capítulos a dois,",
        "chegou o dia de",
        "escrever o mais bonito.",
      ],
      text: "E não daria para escrever esse capítulo sem você. Guarde a data, venha celebrar, dance até o fim.",
    },
    // Chamada da linha do tempo.
    story: {
      eyebrow: "Nossa História",
      title: "De uma conversa",
      titleAccent: "a uma vida inteira",
    },
    // Última cena, antes do rodapé.
    closing: {
      eyebrow: "Até dezembro",
      lines: ["Contamos", "os dias", "por você."],
    },
  },

  // Imagem de capa (coloque a foto em /public/images/cover.jpg).
  // E uma foto do ensaio, em retrato 2:3 -- a home usa essa proporcao na
  // moldura do hero. Trocando por uma foto de outra proporcao, ajuste o
  // `aspect-[2/3]` em src/app/page.tsx.
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
    // O campo `photo` também é opcional: é a foto que aparece na moldura em
    // arco enquanto a pessoa rola a linha do tempo. Sem ela, o marco entra
    // só com o texto, sobre a foto do marco anterior.
    timeline: [
      {
        date: "2 de março de 2023",
        title: "A primeira conversa",
        photo: "/images/ensaio/ensaio-01.jpg",
      },
      {
        date: "22 de abril de 2023",
        title: "O primeiro date",
        photo: "/images/ensaio/ensaio-07.jpg",
      },
      {
        date: "8 de junho de 2023",
        title: "O pedido de namoro",
        photo: "/images/ensaio/ensaio-03.jpg",
      },
      {
        date: "7 de dezembro de 2025",
        title: "O pedido de noivado",
        photo: "/images/ensaio/ensaio-04.jpg",
      },
      {
        date: "6 de dezembro de 2026",
        title: "O grande dia",
        photo: "/images/ensaio/ensaio-11.jpg",
      },
    ] as { date: string; title: string; text?: string; photo?: string }[],

    // Galeria do ensaio, exibida no fim da pagina em um carrossel.
    // So fotos DEITADAS (paisagem): a galeria fica mais harmonica com
    // todas na mesma proporcao, sem a moldura mudando de foto para foto.
    // Para trocar: salve os arquivos em /public/images/ensaio/ e liste-os
    // aqui na ordem em que devem aparecer. Otimize antes de subir (lado
    // maior ~1800px, JPEG) -- o arquivo vai para o visitante do jeito que
    // estiver na pasta. O `alt` descreve a foto para leitores de tela.
    gallery: {
      title: "Nosso Ensaio",
      intro: "Um pouquinho do nosso ensaio, à beira-mar.",
      photos: [
        {
          src: "/images/ensaio/ensaio-01.jpg",
          alt: "Drielli e Leonardo frente a frente na areia, prestes a se beijar",
        },
        {
          src: "/images/ensaio/ensaio-02.jpg",
          alt: "Drielli sorrindo para Leonardo, vista por cima do ombro dele",
        },
        {
          src: "/images/ensaio/ensaio-03.jpg",
          alt: "Leonardo abraça Drielli por trás enquanto ela ri",
        },
        {
          src: "/images/ensaio/ensaio-04.jpg",
          alt: "Detalhe das alianças de noivado e do colar com o pingente de fé",
        },
        {
          src: "/images/ensaio/ensaio-05.jpg",
          alt: "Drielli nas costas de Leonardo, os dois correndo e rindo na praia",
        },
        {
          src: "/images/ensaio/ensaio-06.jpg",
          alt: "Brincadeira na beira do mar, entre risadas",
        },
        {
          src: "/images/ensaio/ensaio-07.jpg",
          alt: "O casal sentado na areia molhada, abraçado, olhando para a câmera",
        },
        {
          src: "/images/ensaio/ensaio-08.jpg",
          alt: "De costas, de mãos dadas, caminhando em direção ao mar",
        },
        {
          src: "/images/ensaio/ensaio-09.jpg",
          alt: "Dentro do mar, Leonardo ergue Drielli no colo em um beijo",
        },
        {
          src: "/images/ensaio/ensaio-10.jpg",
          alt: "Os dois de pé dentro da água, se beijando entre as ondas",
        },
        {
          src: "/images/ensaio/ensaio-11.jpg",
          alt: "Abraçados na praia com o sol se pondo atrás deles",
        },
      ],
    },
  },

  // Cerimônia e festa acontecem no MESMO endereço.
  venue: {
    name: "Villa Vezzane",
    address: "R. Benedito Fontana, 510 - Mairiporã, SP, 07627-200",
    time: "15h00",
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

    // Colagens de referencia, exibidas no fim da pagina.
    // Para trocar: salve o arquivo em /public/images/dress-code/ e ajuste o
    // src aqui. Atencao: a foto e um EXEMPLO do que vestir -- nao inclua
    // imagens com camiseta/tenis (nao e esporte fino), nem, no caso das
    // convidadas, com as cores da lista `avoidColors`.
    palettePhoto: {
      src: "/images/dress-code/paleta-cores.jpeg",
      alt: "Colagem com dezenas de vestidos em cores variadas: verde, azul, vinho, mostarda, terracota",
    },
    menCollagePhoto: {
      src: "/images/dress-code/eles-referencias.jpeg",
      alt: "Colagem com quinze looks masculinos: ternos azul-marinho, preto e cinza, blazers e calças sociais com camisa",
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
        text: "A cerimônia começa às 15h. Chegue com antecedência para não perder a entrada.",
      },
      {
        icon: "church",
        title: "Participe da cerimônia",
        text: "É o momento mais importante do dia, e queremos você lá.",
      },
      {
        icon: "camera",
        title: "Não atrapalhe os fotógrafos",
        text: "As fotos são muito bem-vindas e ficaremos felizes em vê-las depois, mas cuidado para não atrapalhar os fotógrafos.",
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

  // Pix direto, exibido no fim da lista de presentes para quem prefere
  // mandar um valor livre em vez de escolher um presente.
  // `key` e o "copia e cola" (payload EMV). O CRC no fim precisa bater com o
  // resto da string -- se for trocar a chave, gere o payload completo por um
  // meio confiavel (app do banco / gerador oficial), nao edite na mao.
  // `qrImage` deve codificar exatamente esse mesmo payload.
  pix: {
    title: "Não encontrou o que procurava?",
    text: "Se preferir, faça um Pix diretamente com o valor que quiser. É só escanear o QR Code ou copiar a chave abaixo.",
    recipient: "Leonardo Martins Peres",
    qrImage: "/images/pix/QRcodePIXLeo.jpg",
    key: "00020101021126580014BR.GOV.BCB.PIX01368a85d4c9-f5de-4897-934a-300877d1c6445204000053039865802BR5922LEONARDO MARTINS PERES6009SAO PAULO62080504daqr6304098F",
  },
} as const;

export type WeddingConfig = typeof wedding;
