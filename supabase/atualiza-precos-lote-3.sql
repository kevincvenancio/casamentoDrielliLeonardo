-- =============================================================
-- Ajuste de precos de 3 presentes do lote 3.
-- Rodar no SQL Editor do Supabase.
--
-- SO E NECESSARIO se voce JA rodou presentes-lote-3.sql (ou seja, os
-- presentes ja existem na tabela). Se ainda nao rodou, ignore este
-- arquivo -- o presentes-lote-3.sql ja esta com os precos novos.
--
-- Casa pelo titulo exato. Rodar mais de uma vez nao causa problema:
-- so regrava o mesmo valor.
--
-- Valores em centavos: R$ 60 = 6000, R$ 120 = 12000, R$ 150 = 15000.
-- =============================================================

update public.gifts set price_cents = 6000
  where title = 'Cota do papel higiênico';

update public.gifts set price_cents = 12000
  where title = 'Cota do café da manhã de recém-casados';

update public.gifts set price_cents = 15000
  where title = 'Cota do Wi-Fi do primeiro mês';

-- Conferencia: os tres devem aparecer com os novos precos.
select title, price_cents
from public.gifts
where title in (
  'Cota do papel higiênico',
  'Cota do café da manhã de recém-casados',
  'Cota do Wi-Fi do primeiro mês'
)
order by title;
