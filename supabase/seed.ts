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

const gifts = [
    {
        title: "Massagem relaxante para o noivo",
        description:
            "Uma massagem bem merecida para o noivo se recuperar depois de ver a conta final do casamento.",
        image_url: img("massagem-noivo.jpg"),
        price_cents: 33300,
        sort_order: 13,
    },
    {
        title: "Saco e luva de boxe para os noivos",
        description:
            "Para os noivos aliviarem a tensão dos preparativos. Bater no saco é mais barato que terapia.",
        image_url: img("boxe-noivos.jpg"),
        price_cents: 79900,
        sort_order: 14,
    },
    {
        title: "Conjunto de controles remotos",
        description:
            "Um controle para cada um, para nunca mais ter briga de quem escolhe o filme.",
        image_url: img("controles-remotos.jpg"),
        price_cents: 8000,
        sort_order: 15,
    },
    {
        title: "Cota amigos para sempre",
        description:
            "Garanta oficialmente o seu lugar cativo na nossa lista de amizades vitalícias.",
        image_url: img("amigos-para-sempre.jpg"),
        price_cents: 86420,
        sort_order: 16,
    },
    {
        title: "Cooktop de última geração",
        description:
            "Um cooktop de altíssima tecnologia (aquele fogãozinho infantil da Barbie).",
        image_url: img("cooktop-barbie.jpg"),
        price_cents: 42720,
        sort_order: 17,
    },
    {
        title: "Seja nosso parente favorito",
        description:
            "Suba na hierarquia da família e conquiste o cobiçado título de parente favorito do casal.",
        image_url: img("parente-favorito.jpg"),
        price_cents: 97033,
        sort_order: 18,
    },
    {
        title: "Primeiro lugar da fila do buffet",
        description:
            "Passe na frente de todo mundo e ataque o buffet antes que acabe o camarão.",
        image_url: img("fila-buffet.jpg"),
        price_cents: 36685,
        sort_order: 19,
    },
    {
        title: "Levar alguém que não foi convidado",
        description:
            "O passe VIP mais caro da festa: traga aquele acompanhante que não estava na lista.",
        image_url: img("convidado-extra.jpg"),
        price_cents: 688022,
        sort_order: 20,
    },
    {
        title: "Cobertor para a noiva",
        description:
            "Um cobertor extra para a noiva, que já vive coberta de razão mas nunca é demais.",
        image_url: img("cobertor-noiva.jpg"),
        price_cents: 39349,
        sort_order: 21,
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