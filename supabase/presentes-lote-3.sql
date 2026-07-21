-- =============================================================
-- Lote 3 de presentes: opcoes de R$ 30 e R$ 50 (sort_order 22-29)
-- Rodar no SQL Editor do Supabase.
--
-- SEGURO PARA RODAR MAIS DE UMA VEZ: o WHERE NOT EXISTS no final
-- ignora qualquer presente cujo titulo ja esteja na tabela, entao
-- rodar de novo nao cria duplicatas.
--
-- Depois de rodar este arquivo, NAO rode `npm run seed` com esta mesma
-- lista -- o seed.ts usa INSERT puro e criaria copias.
-- =============================================================

insert into public.gifts (title, description, image_url, price_cents, status, sort_order)
select v.title, v.description, v.image_url, v.price_cents, 'available', v.sort_order
from (values
    -- ---- Opcoes de R$ 30 ----
    ('Pilhas para o controle remoto',
     'Alguém já deu os controles remotos, mas esqueceu que eles não funcionam no vácuo.',
     '/images/presentes/pilhas-controle.jpg', 3000, 22),

    ('Cota do papel higiênico',
     'O presente que ninguém coloca na lista, mas que todo casal descobre que precisa no terceiro dia.',
     '/images/presentes/papel-higienico.jpg', 3000, 23),

    ('Um chopp para o noivo',
     'Ele vai precisar. Talvez não hoje, talvez não amanhã, mas vai.',
     '/images/presentes/chopp-noivo.jpg', 3000, 24),

    ('Cota do café da manhã de recém-casados',
     'Pão na chapa e café coado para o primeiro café da manhã oficial de casados.',
     '/images/presentes/cafe-da-manha.jpg', 3000, 25),

    -- ---- Opcoes de R$ 50 ----
    ('Toma 50 reais',
     'Sem metáfora, sem piada, sem embalagem de presente. É cinquenta reais mesmo. E a gente agradece de coração.',
     '/images/presentes/nota-50-reais.jpg', 5000, 26),

    ('Cota do delivery de domingo',
     'Para aquele domingo em que ninguém dos dois vai querer cozinhar. Ou seja: todos eles.',
     '/images/presentes/delivery-domingo.jpg', 5000, 27),

    ('Uma planta que prometemos não matar',
     'Você dá a planta, a gente dá o melhor de si. Não podemos garantir o resultado.',
     '/images/presentes/planta.jpg', 5000, 28),

    ('Cota do Wi-Fi do primeiro mês',
     'Casamento é sobre parceria, diálogo e uma conexão estável para assistir série na cama.',
     '/images/presentes/wifi.jpg', 5000, 29)
) as v (title, description, image_url, price_cents, sort_order)
where not exists (
    select 1 from public.gifts g where g.title = v.title
);

-- Conferencia: deve listar os 8 presentes do lote, sem repeticao.
select sort_order, title, price_cents, status
from public.gifts
where sort_order between 22 and 29
order by sort_order;
