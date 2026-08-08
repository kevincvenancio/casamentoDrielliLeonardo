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