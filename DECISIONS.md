# Decisões de projeto

Registro das escolhas feitas onde o escopo era ambíguo. Regra adotada: a
opção mais simples que funcione corretamente.

## Autenticação e acesso a dados

- **Escritas e leituras sensíveis passam pela service role no servidor.** As
 API Routes usam `SUPABASE_SERVICE_ROLE_KEY` (ignora RLS). A policy pública
 de RLS libera apenas `SELECT` em `gifts`. Isso satisfaz "leitura pública só
 em gifts / escrita de guests via API / payments sem acesso público" sem
 precisar de policies de INSERT/UPDATE granulares para o anon.
- A leitura da lista de presentes na página `/presentes` é feita **no
 servidor** com a service role (para poder rodar a expiração lazy de reservas
 no mesmo passo). O client nunca recebe a service key.

## Painel admin

- Proteção por **senha simples** via `ADMIN_PASSWORD`, conforme pedido. O
 login (`/api/admin/login`) grava um cookie httpOnly com um token derivado
 (SHA256) da senha; a página `/admin` valida o cookie. Sem gestão de usuários
 — suficiente para o escopo.

## Fluxo de pagamento

- **Ordem no checkout:** reserva o presente → cria `payment` pending → cria a
 preferência no MP usando `payments.id` como `external_reference`. Em falha
 na criação da preferência, faz rollback (libera o presente e marca o payment
 como rejeitado).
- **`external_reference` = `payments.id`**, permitindo localizar o registro no
 webhook independentemente do payload.
- **Idempotência** em duas camadas: constraint `UNIQUE(mp_payment_id)` no banco
 + checagem de estado final antes de processar (em `webhook-core.ts`).
- **Webhook responde:** 200 quando processa/duplicado/ignorado; 401 assinatura
 inválida; 500 em erro de processamento (o MP reenviará, e o fluxo é
 idempotente). Optou-se por processar antes de responder, mantendo o handler
 enxuto, em vez de fila/worker (desnecessário para o volume).
- **Refund/chargeback** também liberam a unidade de volta ao estoque
 (além de rejected/cancelled), por segurança.

## Estoque (o mesmo presente comprado várias vezes)

- **Antes:** cada linha de `gifts` era uma unidade (`status` available →
 reserved → paid). Depois da primeira compra o presente sumia da lista.
- **Agora:** a disponibilidade é **derivada da tabela `payments`**, que já
 tinha uma linha por tentativa de compra:
 `restante = stock_total − (approved + pending dentro da janela)`.
 `stock_total IS NULL` = **ilimitado** (padrão).
- Derivar em vez de manter um contador em `gifts` foi a escolha porque:
 não existe contador para dessincronizar; a reserva expira sozinha (a
 janela vive em cada `payment`); e um pagamento rejeitado/estornado libera
 a vaga sem nenhuma escrita extra — o webhook não toca mais em `gifts`.
- `gifts.status` e `gifts.reserved_until` viraram **colunas legadas**: a
 migration 0003 zera as duas e ninguém mais as lê ou escreve. Ficaram no
 schema (marcadas com `comment on column`) por serem inofensivas; removê-las
 exigiria coordenar deploy e migration num site que já está no ar.
- **Atomicidade** ficou na função SQL `reserve_gift_unit`: ela faz
 `SELECT ... FOR UPDATE` na linha do presente, conta o estoque e insere o
 `payment` na mesma transação. É o que impede dois cliques simultâneos
 furarem um estoque limitado. Ela devolve `outcome` como *valor*
 (`ok | not_found | inactive | sold_out`) em vez de lançar exceção, para o
 app não depender de parsing de mensagem de erro do Postgres.
- Janela de reserva: **20 minutos** (inalterada). Com estoque ilimitado ela
 é irrelevante — a função nem conta.
- **Um Pix aprovado depois dos 20 min** pode fazer um item limitado passar
 do `stock_total` por uma unidade. Aceito de propósito: o dinheiro entrou,
 recusar seria pior. O painel mostra o número real de vendidos.
- **Compra de 1 unidade por vez.** Quem quiser dar 3× o mesmo presente
 compra 3 vezes. Um seletor de quantidade não foi pedido e dobraria a
 superfície (preço × quantidade no MP, estoque parcial, rollback parcial).

## Galeria do ensaio

- **Só as fotos deitadas.** O ensaio veio com 11 em paisagem e 9 em retrato.
 Misturar as duas orientações deixava a moldura ora cheia, ora com a foto
 pequena entre duas faixas — o casal preferiu manter só as horizontais, e a
 galeria ganhou uma cadência só. As verticais continuam em
 `fotos-originais/ensaio-verticais/`, fora do Git; uma delas virou a capa da
 home, que é justamente um espaço em retrato.
- **Carrossel com dissolvência, não com deslize lateral.** A moldura fica
 parada e as fotos se sucedem dentro dela. Ela é 3/2, a proporção das fotos,
 então cada uma preenche o espaço exato — no celular e no desktop.
- **O fundo borrado ficou como rede de segurança.** Hoje nenhuma foto sobra
 na moldura, mas uma futura foto de outra proporção aparece inteira
 (`object-contain`) sobre uma versão ampliada e borrada dela mesma, em vez de
 ganhar duas faixas vazias. É o mesmo arquivo da frente, sem download extra.
- **Só três fotos ficam no DOM** (anterior, atual e próxima). Empilhar todas
 com `opacity: 0` as baixaria: elemento transparente continua visível para o
 *lazy loading* do navegador. As vizinhas só entram depois da montagem, então
 a primeira pintura da página carrega uma foto só e a troca ainda é
 instantânea.
- **Fotos otimizadas na entrada, não em tempo de execução.** `next/image`
 redimensionaria sob demanda, mas o projeto serve `<img>` simples em todas as
 páginas e os 64 MB de originais ainda iriam para o repositório e para o
 deploy. As versões web (1800px, ~180 KB) são geradas por
 `scripts/otimizar-fotos.ps1` e os originais ficam fora do Git.
- **Sem autoplay e sem lightbox.** O pedido era passar as fotos nas setas.
 Autoplay competiria com a leitura da linha do tempo e exigiria pausa,
 respeito a `prefers-reduced-motion` e controle de foco.
- Teclado (← →) funciona com o foco em qualquer botão do carrossel, e arrastar
 o dedo passa a foto. Um aviso `aria-live` conta qual foto entrou, porque a
 dissolvência não move o foco e o leitor de tela não perceberia a troca.

## Testabilidade

- A lógica crítica foi extraída para módulos puros e injetáveis:
 - `webhook-core.ts` (`WebhookStore`) — idempotência e máquina de estados.
 - `reserve-core.ts` (`ReserveStore`) — reserva de unidade e tradução dos
 resultados da RPC em 404/409.
 - `stock.ts` — cálculo de estoque (função pura, sem IO).
 - `verifyWebhookSignature` em `mercadopago.ts` — validação de assinatura.
 As API Routes apenas instanciam os stores sobre o Supabase. Isso permite
 testar sem rede/DB reais (ver `tests/`).

## Conteúdo

- Todo o texto vem de `src/config/wedding.ts`. Dados são **placeholders
 plausíveis** (nomes, datas, endereços fictícios), não detalhes reais.
- Imagens dos presentes no seed usam URLs do Unsplash como placeholder.

## Assinatura do webhook

- Manifesto validado: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`,
 HMAC-SHA256 com `MP_WEBHOOK_SECRET`, comparado com `v1` do header
 `x-signature` usando comparação em tempo constante. `data.id` é normalizado
 para minúsculo conforme a documentação do MP.
## Frontend em camadas (motion)

- **Sem biblioteca de animação.** GSAP, Framer Motion e Lenis resolveriam o
  mesmo problema, mas custam de 30 a 100 kB de JS e assumem controle da
  rolagem. Num site que a maior parte dos convidados vai abrir pelo celular,
  no 4G, entrando por um link de WhatsApp, esse peso é o item mais caro do
  orçamento. O motor caseiro em `src/lib/motion.ts` tem ~200 linhas e mantém
  a home em 110 kB de JS no total.
- **Rolagem nativa, sem *smooth scroll* sintético.** Bibliotecas como o Lenis
  interceptam a roda e o toque para interpolar a posição. Isso quebra o
  arrastar do dedo no iOS, a busca com Ctrl+F e a rolagem por teclado, e é
  justamente o que mais trava em aparelho modesto.
- **O JS só escreve variáveis CSS.** `--p` (progresso da cena, 0 a 1) é
  publicada na `<Scene>` e herdada pelos filhos; a animação em si é
  declarada em CSS com `transform` e `opacity`. Assim o navegador compõe na
  GPU e o trabalho por quadro no JS é uma atribuição de string.
- **Leitura e escrita separadas em fases.** O `tick()` lê o `rect` de todas
  as cenas visíveis antes de escrever qualquer estilo. Intercalar as duas
  coisas força um recálculo de layout por elemento (*layout thrashing*).
- **`IntersectionObserver` liga e desliga cada cena.** Fora da tela, a cena
  não entra na conta do quadro.
- **Nenhum `filter: blur()` em área grande.** Era o gargalo real: as manchas
  de cor viraram gradientes radiais (que já nascem suaves) e o fundo esfumado
  da linha do tempo virou uma miniatura de 48 px esticada — a própria
  ampliação borra. A home saiu de 36 para 59 quadros por segundo, e segura
  43 fps com a CPU 6× mais lenta.
- **Três degraus de degradação**, nesta ordem: `prefers-reduced-motion`
  (nada se move), `data-lite` (sai o `backdrop-filter`; detectado pelo script
  inline do layout e, se ele não pegar, pela medição de quadros do
  `MotionGuard`) e ausência de JavaScript (sem `data-motion="on"` o CSS
  mantém tudo visível e parado — o site continua inteiro, só sem animação).
- **Tipografia.** Cormorant Garamond nos títulos (serifada de alto contraste,
  em peso 300 — é ela que dá o ar de convite impresso) e Inter no texto
  corrido e na interface. Os tamanhos grandes usam `clamp()` em vez de
  breakpoints: a escala é contínua do celular ao desktop, sem saltos e sem
  risco de estourar a largura.
- **Paleta e motivo.** As cores saem das próprias fotos do ensaio (areia,
  mar, hora dourada) e do monograma (lilás e azul-periwinkle). A moldura em
  arco, tirada do desenho da logo, se repete como elemento de identidade:
  hero do convite, linha do tempo, fotos da história.
