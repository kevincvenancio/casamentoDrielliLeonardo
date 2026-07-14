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
- **Refund/chargeback** também liberam o presente de volta para `available`
 (além de rejected/cancelled), por segurança.

## Reservas

- **Expiração lazy** (sem cron): antes de ler a lista e antes de reservar,
 presentes `reserved` com `reserved_until < now()` voltam a `available`.
- Janela de reserva: **20 minutos**.

## Testabilidade

- A lógica crítica foi extraída para módulos puros e injetáveis:
 - `webhook-core.ts` (`WebhookStore`) — idempotência e máquina de estados.
 - `reserve-core.ts` (`ReserveStore`) — reserva condicional e corrida (409).
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