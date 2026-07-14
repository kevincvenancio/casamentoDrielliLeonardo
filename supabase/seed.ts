/**
 * Script de seed: insere ~12 presentes de exemplo.
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

const img = (q: string) =>
    `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=60`;

const gifts = [
    {
        title: "Jogo de Panelas",
        description: "Conjunto completo de panelas antiaderentes para a cozinha nova.",
        image_url: img("photo-1556909212-d5b604d0c90d"),
        price_cents: 45000,
        sort_order: 1,
    },
    {
        title: "Jogo de Taças de Cristal",
        description: "Seis taças de cristal para brindar os momentos especiais.",
        image_url: img("photo-1510812431401-41d2bd2722f3"),
        price_cents: 22000,
        sort_order: 2,
    },
    {
        title: "Cafeteira Espresso",
        description: "Para os cafés da manhã preguiçosos de fim de semana.",
        image_url: img("photo-1517668808822-9ebb02f2a0e6"),
        price_cents: 68000,
        sort_order: 3,
    },
    {
        title: "Jogo de Cama Casal",
        description: "Lençóis 400 fios, macios e aconchegantes.",
        image_url: img("photo-1522771739844-6a9f6d5f14af"),
        price_cents: 30000,
        sort_order: 4,
    },
    {
        title: "Aspirador Robô",
        description: "Ajuda essencial para manter o lar sempre limpinho.",
        image_url: img("photo-1558317374-067fb5f30001"),
        price_cents: 120000,
        sort_order: 5,
    },
    {
        title: "Liquidificador de Alta Potência",
        description: "Para vitaminas, sopas e receitas do dia a dia.",
        image_url: img("photo-1570222094114-d054a817e56b"),
        price_cents: 38000,
        sort_order: 6,
    },
    {
        title: "Kit Churrasco",
        description: "Utensílios completos para os encontros de domingo.",
        image_url: img("photo-1555939594-58d7cb561ad1"),
        price_cents: 26000,
        sort_order: 7,
    },
    {
        title: "Cota da Lua de Mel",
        description: "Contribua com nossa viagem dos sonhos após o casamento.",
        image_url: img("photo-1507525428034-b723cf961d3e"),
        price_cents: 15000,
        sort_order: 8,
    },
    {
        title: "Jantar Romântico",
        description: "Nos ajude a celebrar com um jantar especial a dois.",
        image_url: img("photo-1414235077428-338989a2e8c0"),
        price_cents: 20000,
        sort_order: 9,
    },
    {
        title: "Air Fryer",
        description: "Praticidade e saúde para o dia a dia da cozinha.",
        image_url: img("photo-1626074353765-517a681e40be"),
        price_cents: 42000,
        sort_order: 10,
    },
    {
        title: "Smart TV 50\"",
        description: "Para as noites de filme aconchegadas no sofá.",
        image_url: img("photo-1593359677879-a4bb92f829d1"),
        price_cents: 250000,
        sort_order: 11,
    },
    {
        title: "Conjunto de Toalhas",
        description: "Toalhas felpudas de banho e rosto para o casal.",
        image_url: img("photo-1600369671236-e74521d4b6ad"),
        price_cents: 18000,
        sort_order: 12,
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