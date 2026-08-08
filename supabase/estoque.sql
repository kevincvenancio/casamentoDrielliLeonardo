-- =============================================================
-- Receitas de estoque dos presentes (SQL Editor do Supabase)
--
-- Depois da migration 0003, um presente comprado NAO some mais da
-- lista. Quantas vezes ele pode ser comprado depende de `stock_total`:
--
--   stock_total = NULL  -> ILIMITADO (padrao): nunca sai da lista
--   stock_total = 10    -> some da lista depois da 10a compra
--
-- Rode so o bloco que voce precisa. Todos sao seguros de repetir.
-- =============================================================

-- ----------------------------------------------------------------
-- 1. Ver a situacao atual de todos os presentes
-- ----------------------------------------------------------------
select
  g.sort_order,
  g.title,
  g.price_cents / 100.0                                     as preco,
  coalesce(g.stock_total::text, 'ilimitado')                as estoque,
  count(p.id) filter (where p.status = 'approved')          as vendidos,
  count(p.id) filter (
    where p.status = 'pending' and p.reserved_until > now()
  )                                                          as em_pagamento,
  g.active
from public.gifts g
left join public.payments p on p.gift_id = g.id
group by g.id
order by g.sort_order;


-- ----------------------------------------------------------------
-- 2. Limitar UM presente a N compras
--    (troque o titulo e o numero)
-- ----------------------------------------------------------------
-- update public.gifts
--    set stock_total = 10
--  where title = 'Jogo de taças de cristal';


-- ----------------------------------------------------------------
-- 3. Tornar UM presente ilimitado de novo
-- ----------------------------------------------------------------
-- update public.gifts
--    set stock_total = null
--  where title = 'Jogo de taças de cristal';


-- ----------------------------------------------------------------
-- 4. Limitar TODOS os presentes a 10 compras de uma vez
-- ----------------------------------------------------------------
-- update public.gifts set stock_total = 10;


-- ----------------------------------------------------------------
-- 5. Tornar TODOS ilimitados (estado logo apos a migration 0003)
-- ----------------------------------------------------------------
-- update public.gifts set stock_total = null;


-- ----------------------------------------------------------------
-- 6. Esconder / reexibir um presente sem apagar o historico
--    (apagar a linha quebraria os pagamentos ja registrados)
-- ----------------------------------------------------------------
-- update public.gifts set active = false where title = '...';
-- update public.gifts set active = true  where title = '...';


-- ----------------------------------------------------------------
-- 7. Soltar uma reserva travada
--
-- Um checkout abandonado segura a unidade por 20 minutos e depois
-- solta sozinho. Use isto so para nao esperar (ex.: teste seu).
-- ----------------------------------------------------------------
-- update public.payments
--    set status = 'rejected', reserved_until = null
--  where status = 'pending'
--    and gift_id = (select id from public.gifts where title = '...');
