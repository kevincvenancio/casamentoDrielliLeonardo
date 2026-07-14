-- =============================================================
-- Migration inicial: schema do site de casamento
-- =============================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- guests: confirmacoes de presenca (RSVP)
-- ----------------------------------------------------------------
create table if not exists public.guests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  attending   boolean not null,
  companions  int default 0,
  message     text,
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------
-- gifts: itens da lista de presentes
-- status (enum logico): available | reserved | paid
-- ----------------------------------------------------------------
create table if not exists public.gifts (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  image_url      text,
  price_cents    int not null,
  status         text not null default 'available',
  reserved_until timestamptz,
  sort_order     int default 0,
  created_at     timestamptz default now(),
  constraint gifts_status_check
    check (status in ('available', 'reserved', 'paid'))
);

create index if not exists gifts_status_idx on public.gifts (status);
create index if not exists gifts_sort_idx on public.gifts (sort_order);

-- ----------------------------------------------------------------
-- payments: trilha de auditoria dos pagamentos
-- mp_payment_id UNIQUE -> rede de seguranca para idempotencia
-- ----------------------------------------------------------------
create table if not exists public.payments (
  id               uuid primary key default gen_random_uuid(),
  gift_id          uuid references public.gifts(id),
  mp_preference_id text,
  mp_payment_id    text unique,
  buyer_name       text,
  buyer_email      text,
  amount_cents     int,
  status           text not null default 'pending',
  raw_payload      jsonb,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  constraint payments_status_check
    check (status in ('pending', 'approved', 'rejected', 'refunded'))
);

create index if not exists payments_gift_idx on public.payments (gift_id);
create index if not exists payments_status_idx on public.payments (status);

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.guests   enable row level security;
alter table public.gifts    enable row level security;
alter table public.payments enable row level security;

-- gifts: LEITURA publica apenas (colunas nao sensiveis sao selecionadas
-- pelo app; nao ha colunas sensiveis nesta tabela). Sem escrita publica.
drop policy if exists "gifts public read" on public.gifts;
create policy "gifts public read"
  on public.gifts
  for select
  to anon, authenticated
  using (true);

-- guests: SEM acesso publico direto. A escrita acontece via API Route
-- usando a service role key (que ignora RLS). Nenhuma policy publica.

-- payments: SEM acesso publico algum. Apenas service role (ignora RLS).

-- Observacao: a service role key ignora RLS por padrao. Todas as
-- escritas em guests/gifts/payments e leituras de payments passam
-- exclusivamente pelo servidor (API Routes).
