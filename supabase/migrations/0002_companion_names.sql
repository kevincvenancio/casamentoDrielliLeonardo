-- =============================================================
-- Nomes dos acompanhantes
--
-- Antes, guests.companions guardava apenas a QUANTIDADE de acompanhantes,
-- entao nao havia como saber quem eram -- inviabilizando lista de nomes na
-- portaria, mesas e contagem do buffet.
--
-- Passamos a guardar os NOMES. A coluna `companions` continua existindo (e
-- usada nos totais do painel), mas quem a preenche e a API: ela grava sempre
-- companions = quantidade de nomes recebidos. Assim os dois nunca divergem.
--
-- Linhas antigas (confirmadas antes desta mudanca) ficam com companion_names
-- vazio e companions > 0. O painel sinaliza esse caso.
-- =============================================================

alter table public.guests
  add column if not exists companion_names text[] not null default '{}';

comment on column public.guests.companion_names is
  'Nomes dos acompanhantes. A API mantem companions = cardinality(companion_names).';
