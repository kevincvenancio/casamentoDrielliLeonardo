/**
 * Script de seed: insere a lista de presentes (versao "engracada").
 * Uso: npm run seed
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
    console.error(
        "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local"
    );
    process.exit(1);
}

const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
});

// Imagens locais: coloque os arquivos em public/images/presentes/.
// Enquanto o arquivo nao existir, o card mostra o titulo do presente (fallback).
const img = (file: string) => `/images/presentes/${file}`;

// ATENCAO: este arquivo contem apenas o LOTE ATUAL a ser inserido.
// O seed usa INSERT (nao upsert), entao rodar `npm run seed` duas vezes com a
// mesma lista cria presentes duplicados no banco. O fluxo e: substituir a lista
// abaixo pelo novo lote, rodar uma vez, e commitar.
// Lotes ja inseridos: sort_order 1-12 (tradicionais) e 13-21 (engracados).
const gifts = [
    // ---- Opcoes de R$ 30 ----
    {
        title: "Pilhas para o controle remoto",
        description:
            "Alguém já deu os controles remotos, mas esqueceu que eles não funcionam no vácuo.",
        image_url: img("pilhas-controle.jpg"),
        price_cents: 3000,
        sort_order: 22,
    },
    {
        title: "Cota do papel higiênico",
        description:
            "O presente que ninguém coloca na lista, mas que todo casal descobre que precisa no terceiro dia.",
        image_url: img("papel-higienico.jpg"),
        price_cents: 3000,
        sort_order: 23,
    },
    {
        title: "Um chopp para o noivo",
        description:
            "Ele vai precisar. Talvez não hoje, talvez não amanhã, mas vai.",
        image_url: img("chopp-noivo.jpg"),
        price_cents: 3000,
        sort_order: 24,
    },
    {
        title: "Cota do café da manhã de recém-casados",
        description:
            "Pão na chapa e café coado para o primeiro café da manhã oficial de casados.",
        image_url: img("cafe-da-manha.jpg"),
        price_cents: 3000,
        sort_order: 25,
    },
    // ---- Opcoes de R$ 50 ----
    {
        title: "Toma 50 reais",
        description:
            "Sem metáfora, sem piada, sem embalagem de presente. É cinquenta reais mesmo. E a gente agradece de coração.",
        image_url: img("nota-50-reais.jpg"),
        price_cents: 5000,
        sort_order: 26,
    },
    {
        title: "Cota do delivery de domingo",
        description:
            "Para aquele domingo em que ninguém dos dois vai querer cozinhar. Ou seja: todos eles.",
        image_url: img("delivery-domingo.jpg"),
        price_cents: 5000,
        sort_order: 27,
    },
    {
        title: "Uma planta que prometemos não matar",
        description:
            "Você dá a planta, a gente dá o melhor de si. Não podemos garantir o resultado.",
        image_url: img("planta.jpg"),
        price_cents: 5000,
        sort_order: 28,
    },
    {
        title: "Cota do Wi-Fi do primeiro mês",
        description:
            "Casamento é sobre parceria, diálogo e uma conexão estável para assistir série na cama.",
        image_url: img("wifi.jpg"),
        price_cents: 5000,
        sort_order: 29,
    },
];

async function main() {
    console.log(`Inserindo ${gifts.length} presentes...`);
    const { error } = await supabase.from("gifts").insert(
        gifts.map((g) => ({ ...g, status: "available" }))
    );
    if (error) {
        console.error("Erro ao inserir presentes:", error.message);
        process.exit(1);
    }
    console.log("Seed concluido com sucesso.");
}

main();