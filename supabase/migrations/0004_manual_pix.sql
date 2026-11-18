-- =============================================================
-- Pix direto lancado a mao no painel
--
-- Quem faz Pix pelo QR da pagina de presentes paga direto na conta dos
-- noivos: o Mercado Pago nunca fica sabendo, e o painel nao somava esse
-- dinheiro. Agora os noivos lancam cada Pix recebido (nome + valor).
--
-- O lancamento vira uma linha de `payments`, ja 'approved' e SEM gift_id.
-- Assim ele entra no total arrecadado do painel sem tocar no estoque de
-- nenhum presente (o estoque so conta pagamentos com gift_id).
--
-- `source` separa as duas origens:
--   'mercadopago' -> criado pelo checkout e atualizado pelo webhook
--   'pix_manual'  -> lancado no painel; e o unico tipo que o painel apaga
--
-- SEGURO PARA RODAR MAIS DE UMA VEZ.
-- =============================================================

alter table public.payments
  add column if not exists source text not null default 'mercadopago';

do $$
begin
  alter table public.payments
    add constraint payments_source_check
    check (source in ('mercadopago', 'pix_manual'));
exception
  when duplicate_object then null;
end $$;

comment on column public.payments.source is
  'Origem: mercadopago (checkout + webhook) ou pix_manual (lancado no painel).';

notify pgrst, 'reload schema';
