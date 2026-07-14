# Site de Casamento — Drielli & Leonardo

Site de casamento em pt-BR, pronto para produção, com lista de presentes e
checkout real via Mercado Pago (Checkout Pro), confirmação de presença (RSVP)
e painel administrativo.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Supabase** (Postgres + SDK) — banco e persistência
- **Mercado Pago Checkout Pro** — pagamentos (cartão parcelado, Pix, boleto)
- Deploy alvo: **Vercel** · Gerenciador: **npm**

> Chaves sensíveis (`SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN`,
> `MP_WEBHOOK_SECRET`, `ADMIN_PASSWORD`) são usadas **apenas no servidor**
> (API Routes). Nunca vão para o client.

## Estrutura

```
src/
 config/wedding.ts <- TODO o conteudo textual do site (edite aqui)
 lib/
 supabase.ts <- clients public (anon) e service role
 mercadopago.ts <- criar preferencia, consultar pagamento, assinatura
 webhook-core.ts <- nucleo idempotente do webhook (testavel)
 webhook-store.ts <- WebhookStore sobre Supabase
 reserve-core.ts <- reserva condicional de presente (testavel)
 gifts.ts <- leitura da lista + expiracao LAZY de reservas
 app/
 api/checkout <- POST /api/checkout
 api/webhook/mercadopago<- POST webhook do MP
 api/rsvp <- POST confirmacao de presenca
 api/admin/login <- login do painel
 (paginas)/... <- home, nossa-historia, local, presentes, rsvp,
 pagamento/{sucesso,pendente,erro}, admin
supabase/
 migrations/0001_init.sql <- schema + RLS
 seed.ts <- ~12 presentes de exemplo
tests/ <- testes do webhook e da reserva (vitest)
```

## 1. Configuração local

```bash
npm install
cp .env.example .env.local # preencha os valores (veja abaixo)
```

Edite os textos do casamento em `src/config/wedding.ts` (nomes, data,
história, endereços, mapas). Opcional: coloque a foto de capa em
`public/images/cover.jpg`.

## 2. Criar o projeto no Supabase

1. Acesse https://supabase.com e crie um projeto.
2. Em **Project Settings → API**, copie:
 - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
 - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`
3. Rode a migration: abra **SQL Editor**, cole o conteúdo de
 `supabase/migrations/0001_init.sql` e execute.
 (Cria tabelas `guests`, `gifts`, `payments`, índices e RLS.)
4. Popule a lista de presentes:
 ```bash
 npm run seed
 ```

## 3. Credenciais do Mercado Pago

Painel: https://www.mercadopago.com.br/developers → **Suas integrações** →
crie/entre em uma aplicação.

### Sandbox (padrão para testes)
1. Em **Credenciais de teste**, copie o `Access Token` (começa com `TEST-`)
 → `MP_ACCESS_TOKEN`.
2. Use as **contas de teste** (comprador/vendedor) do MP para simular
 pagamentos sem dinheiro real.

### Produção
1. Faça a homologação da aplicação no painel do MP.
2. Em **Credenciais de produção**, copie o `Access Token` (começa com
 `APP_USR-`) e substitua `MP_ACCESS_TOKEN`.

> **Trocar sandbox ↔ produção = trocar apenas o `MP_ACCESS_TOKEN`.**
> O `init_point` retornado já corresponde ao ambiente do token usado.

## 4. Configurar o webhook

1. No painel do MP → **Suas integrações → Webhooks**, cadastre a URL:
 ```
 {NEXT_PUBLIC_SITE_URL}/api/webhook/mercadopago
 ```
 e marque o evento **Pagamentos** (`payment`).
2. Copie a **assinatura secreta** exibida → `MP_WEBHOOK_SECRET`.
 Ela é usada para validar o header `x-signature` (HMAC SHA256).

## 5. Testar localmente com ngrok

O MP precisa alcançar seu webhook por uma URL pública.

```bash
# terminal 1
npm run dev # http://localhost:3000

# terminal 2
ngrok http 3000 # gera https://xxxx.ngrok-free.app
```

1. Copie a URL https do ngrok para `NEXT_PUBLIC_SITE_URL` no `.env.local`
 e reinicie o `npm run dev`.
2. No painel do MP, aponte o webhook para
 `https://xxxx.ngrok-free.app/api/webhook/mercadopago`.
3. Acesse `/presentes`, clique em **Presentear**, finalize um pagamento de
 teste (sandbox). O webhook confirmará o presente automaticamente.

## Fluxo de pagamento (resumo)

1. `POST /api/checkout` valida o presente no servidor (preço lido do banco),
 reserva por 20 min com `UPDATE ... WHERE status='available'` (0 linhas → 409),
 cria o `payment` pending, cria a preferência no MP e devolve o `init_point`.
2. `POST /api/webhook/mercadopago` valida a assinatura, ignora o payload como
 fonte de verdade e consulta `GET /v1/payments/{id}` na API do MP. É
 **idempotente** (checa `mp_payment_id` + constraint unique). Aprovado →
 `gift` vira `paid`; rejeitado/cancelado → `gift` volta a `available`.
3. Reservas expiradas voltam a `available` de forma **lazy** na leitura da
 lista (sem cron job).

## Painel administrativo

`/admin` é protegido por senha simples (`ADMIN_PASSWORD`). Mostra confirmações
de presença e pagamentos aprovados, com totais.

## Scripts

```bash
npm run dev # desenvolvimento
npm run build # build de producao
npm start # servir build
npm run lint # eslint
npm test # testes (vitest)
npm run seed # popular presentes
```

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Configure as mesmas variáveis do `.env.example` em
 **Settings → Environment Variables**.
3. Ajuste `NEXT_PUBLIC_SITE_URL` para o domínio de produção e atualize a URL
 do webhook no painel do MP.