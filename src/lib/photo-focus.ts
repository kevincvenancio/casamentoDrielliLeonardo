/**
 * Onde esta o assunto de cada foto.
 *
 * O site mostra a mesma foto em molduras de proporcoes diferentes: a faixa
 * larga do topo das paginas, o arco vertical da linha do tempo, o cartao 3/4
 * da home. Em todas elas o `object-fit: cover` corta a foto -- e, por padrao,
 * corta pelo centro geometrico, que raramente e onde estao os rostos.
 *
 * Numa foto de 3:2 mostrada num arco de 3:4, o corte descarta quase metade da
 * largura. No ensaio-07, por exemplo, o casal esta no terco direito: cortando
 * pelo centro sobra areia, e eles ficam de fora.
 *
 * Por isso o ponto focal mora AQUI, uma vez por foto, e nao espalhado pelas
 * telas que a usam. Os valores sao `object-position`: o primeiro numero e a
 * posicao horizontal do assunto (0% = borda esquerda), o segundo a vertical
 * (0% = topo). Trocando uma foto, meca o rosto na imagem nova e atualize a
 * linha correspondente -- todas as molduras se ajustam juntas.
 */
const photoFocus: Record<string, string> = {
  // -- Ensaio ---------------------------------------------------------------
  // Os dois de frente, prestes a se beijar: rostos no alto, ao centro.
  "/images/ensaio/ensaio-01.jpg": "50% 30%",
  // Drielli sorrindo, vista por cima do ombro dele: ela vive à esquerda.
  "/images/ensaio/ensaio-02.jpg": "38% 32%",
  // Abraço por trás: rostos um pouco à esquerda do centro e bem no alto.
  "/images/ensaio/ensaio-03.jpg": "45% 27%",
  // Detalhe das alianças e do colar -- o assunto ocupa o quadro inteiro.
  "/images/ensaio/ensaio-04.jpg": "50% 45%",
  // Correndo na praia, ela nas costas dele: o par fica no meio.
  "/images/ensaio/ensaio-05.jpg": "48% 40%",
  // Brincadeira à beira do mar: rostos no alto, levemente à direita.
  "/images/ensaio/ensaio-06.jpg": "55% 28%",
  // Sentados na areia: o casal está no TERÇO DIREITO. Sem esta linha, o
  // corte central da moldura em arco mostraria praia vazia.
  "/images/ensaio/ensaio-07.jpg": "68% 34%",
  // De costas, caminhando para o mar: figuras pequenas, na metade de baixo.
  "/images/ensaio/ensaio-08.jpg": "52% 52%",
  // No colo dentro do mar: casal ao centro, rostos no terço superior.
  "/images/ensaio/ensaio-09.jpg": "48% 36%",
  // Beijo em pé na água: casal ao centro, rostos um pouco acima do meio.
  "/images/ensaio/ensaio-10.jpg": "48% 38%",
  // Pôr do sol, testa com testa: o par fica quase no centro.
  "/images/ensaio/ensaio-11.jpg": "47% 32%",

  // -- Local ----------------------------------------------------------------
  // Vista aérea da cerimônia: o altar e a vista das montanhas ficam na
  // metade de cima; mais para baixo só aparecem as cadeiras.
  "/images/vista-aerea-wide.jpg": "50% 42%",

  // -- Dress code -----------------------------------------------------------
  // Colagens: uma grade de looks, sem assunto único. O centro serve.
  "/images/dress-code/paleta-cores.jpeg": "50% 50%",
  "/images/dress-code/eles-referencias.jpeg": "50% 50%",
};

/**
 * Ponto focal de uma foto. Foto sem entrada no mapa cai no centro, que e o
 * comportamento padrao do navegador -- nada quebra, so nao fica afinado.
 */
export function focusOf(src: string): string {
  return photoFocus[src] ?? "50% 50%";
}
