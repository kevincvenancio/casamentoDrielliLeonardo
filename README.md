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

> **Não use GitHub Pages.** O Pages serve apenas arquivos estáticos e não roda
> servidor. Este site depende de API Routes (`/api/checkout`,
> `/api/webhook/mercadopago`, `/api/rsvp`, `/api/admin/login`) e de segredos
> que **nunca** podem ir para o browser (`SUPABASE_SERVICE_ROLE_KEY`,
> `MP_ACCESS_TOKEN`). Em um export estático o webhook do Mercado Pago não teria
> onde ser recebido e nenhum presente seria marcado como pago.

### 1. Importar o projeto

Login na Vercel com o GitHub → **Add New… → Project** → selecione este
repositório. A Vercel detecta o Next.js sozinha; não mude nenhuma configuração
de build.

### 2. Variáveis de ambiente

Em **Settings → Environment Variables**, cadastre (marque os três ambientes:
Production, Preview e Development):

| Variável | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key do Supabase |
| `ADMIN_PASSWORD` | senha do painel `/admin` |
| `NEXT_PUBLIC_SITE_URL` | ver passo 3 |
| `MP_ACCESS_TOKEN` | token do Mercado Pago (pode ficar vazio no início) |
| `MP_WEBHOOK_SECRET` | segredo do webhook (pode ficar vazio no início) |

As duas variáveis do Mercado Pago podem ficar em branco no primeiro deploy: o
site sobe e funciona normalmente, apenas o botão **"Presentear"** falha até
elas serem preenchidas.

### 3. O ovo e a galinha do `NEXT_PUBLIC_SITE_URL`

Essa variável precisa apontar para o domínio de produção — que só existe
**depois** do primeiro deploy. Então:

1. Faça o primeiro deploy com `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
 (ou deixe vazio). Ele vai subir normalmente.
2. Anote a URL que a Vercel gerou (ex.: `https://seu-projeto.vercel.app`).
3. Volte em Environment Variables, corrija `NEXT_PUBLIC_SITE_URL` para essa URL
 e clique em **Redeploy**.

Se pular o passo 3, o checkout quebra: as `back_urls` e a `notification_url`
enviadas ao Mercado Pago apontariam para `localhost`, que o MP rejeita.

### 4. Webhook do Mercado Pago

Com o site no ar, cadastre no painel do MP (**Suas integrações → Webhooks**):

```
https://seu-projeto.vercel.app/api/webhook/mercadopago
```

O painel então exibe a **assinatura secreta** — copie para `MP_WEBHOOK_SECRET`
na Vercel e faça um novo Redeploy. Sem esse segredo o webhook rejeita tudo com
401 (comportamento intencional: requisições não assinadas são recusadas).

Em produção a Vercel já fornece HTTPS público, então **o ngrok não é
necessário** — ele só serve para testar o webhook na sua máquina (seção 5).