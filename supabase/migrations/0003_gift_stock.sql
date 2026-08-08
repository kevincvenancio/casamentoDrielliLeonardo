-- =============================================================
-- Estoque de presentes: o mesmo presente pode ser comprado N vezes
--
-- ANTES: cada linha de `gifts` era UMA unidade. O checkout marcava
-- status='reserved' e o webhook marcava status='paid' -- o presente
-- sumia da lista depois da primeira compra.
--
-- AGORA: a disponibilidade e DERIVADA da tabela `payments`, que ja
-- tem uma linha por tentativa de compra:
--   vendidos   = payments 'approved'   daquele gift
--   reservados = payments 'pending'    com reserved_until > now()
--   restante   = gifts.stock_total - (vendidos + reservados)
--
-- `stock_total IS NULL` significa ILIMITADO (padrao das colunas novas):
-- o presente nunca sai da lista. Para limitar, basta setar um numero.
--
-- Vantagens de derivar em vez de manter contador:
--   - nao existe contador para dessincronizar;
--   - reserva expira sozinha (a janela vive em cada payment);
--   - pagamento rejeitado/estornado libera a vaga na hora, sem UPDATE
--     extra em gifts.
--
-- SEGURO PARA RODAR MAIS DE UMA VEZ (tudo e IF NOT EXISTS / OR REPLACE).
-- =============================================================

-- ----------------------------------------------------------------
-- 1. Colunas novas
-- ----------------------------------------------------------------
alter table public.gifts
  add column if not exists stock_total int,
  add column if not exists active      boolean not null default true;

comment on column public.gifts.stock_total is
  'Quantas vezes este presente pode ser comprado. NULL = ilimitado.';
comment on column public.gifts.active is
  'false esconde o presente da lista sem apagar o historico de pagamentos.';

do $$
begin
  alter table public.gifts
    add constraint gifts_stock_total_positive
    check (stock_total is null or stock_total > 0);
exception
  when duplicate_object then null;
end $$;

-- Janela de reserva por COMPRA (antes ficava em gifts.reserved_until,
-- que so comportava uma reserva por presente).
alter table public.payments
  add column if not exists reserved_until timestamptz;

comment on column public.payments.reserved_until is
  'Ate quando este checkout pendente segura uma unidade do presente.';

-- ----------------------------------------------------------------
-- 2. Backfill e liberacao do modelo antigo
-- ----------------------------------------------------------------
-- Pendentes antigos ganham uma janela ja vencida: nao seguram estoque.
update public.payments
   set reserved_until = created_at + interval '20 minutes'
 where status = 'pending'
   and reserved_until is null;

-- Solta todo presente que ficou preso em 'reserved'/'paid'. A partir
-- daqui gifts.status nao decide mais nada.
update public.gifts
   set status = 'available',
       reserved_until = null
 where status <> 'available'
    or reserved_until is not null;

comment on column public.gifts.status is
  'LEGADO: mantida por compatibilidade. A disponibilidade vem de stock_total + payments.';
comment on column public.gifts.reserved_until is
  'LEGADO: a reserva agora vive em payments.reserved_until.';

-- ----------------------------------------------------------------
-- 3. Indice para as contagens de estoque
-- ----------------------------------------------------------------
create index if not exists payments_gift_status_idx
  on public.payments (gift_id, status);

-- ----------------------------------------------------------------
-- 4. Reserva atomica de UMA unidade
--
-- Faz, numa unica transacao: trava a linha do presente (FOR UPDATE),
-- conta o que ja foi vendido/reservado, e so entao insere o payment
-- pendente. O FOR UPDATE serializa checkouts concorrentes do MESMO
-- presente -- e o que impede vender a 11a unidade de um estoque de 10
-- quando duas pessoas clicam ao mesmo tempo.
--
-- Retorna uma linha com `outcome`: ok | not_found | inactive | sold_out.
-- Erro vira valor de retorno (nao exception) para o app tratar sem
-- depender de parsing de mensagem.
-- ----------------------------------------------------------------
create or replace function public.reserve_gift_unit(
  p_gift_id         uuid,
  p_buyer_name      text,
  p_buyer_email     text default null,
  p_reserve_minutes int  default 20
)
returns table (
  outcome          text,
  payment_id       uuid,
  unit_price_cents int,
  gift_title       text
)
language plpgsql
as $$
declare
  v_gift       public.gifts%rowtype;
  v_taken      int;
  v_payment_id uuid;
begin
  select * into v_gift
    from public.gifts
   where id = p_gift_id
   for update;

  if not found then
    return query select 'not_found'::text, null::uuid, null::int, null::text;
    return;
  end if;

  if not v_gift.active then
    return query select 'inactive'::text, null::uuid, null::int, v_gift.title;
    return;
  end if;

  -- stock_total NULL = ilimitado: nem conta.
  if v_gift.stock_total is not null then
    select count(*)::int into v_taken
      from public.payments p
     where p.gift_id = p_gift_id
       and (
         p.status = 'approved'
         or (p.status = 'pending' and p.reserved_until > now())
       );

    if v_taken >= v_gift.stock_total then
      return query select 'sold_out'::text, null::uuid, null::int, v_gift.title;
      return;
    end if;
  end if;

  -- O preco vem SEMPRE do banco, nunca do client.
  insert into public.payments (
    gift_id, buyer_name, buyer_email, amount_cents, status, reserved_until
  )
  values (
    p_gift_id, p_buyer_name, p_buyer_email, v_gift.price_cents, 'pending',
    now() + make_interval(mins => p_reserve_minutes)
  )
  returning id into v_payment_id;

  return query select 'ok'::text, v_payment_id, v_gift.price_cents, v_gift.title;
end;
$$;

-- A funcao escreve em `payments`, que nao tem acesso publico. Ela e
-- chamada apenas pelo servidor (service role); ninguem mais executa.
revoke all on function public.reserve_gift_unit(uuid, text, text, int)
  from public, anon, authenticated;
grant execute on function public.reserve_gift_unit(uuid, text, text, int)
  to service_role;

-- Faz o PostgREST enxergar a funcao nova sem esperar o reload automatico.
notify pgrst, 'reload schema';

-- ----------------------------------------------------------------
-- 5. Conferencia
-- ----------------------------------------------------------------
select
  g.sort_order,
  g.title,
  g.price_cents,
  coalesce(g.stock_total::text, 'ilimitado') as estoque,
  count(p.id) filter (where p.status = 'approved') as vendidos
from public.gifts g
left join public.payments p on p.gift_id = g.id
where g.active
group by g.id, g.sort_order, g.title, g.price_cents, g.stock_total
order by g.sort_order;
