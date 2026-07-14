import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { wedding } from "@/config/wedding";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    attending?: boolean;
    companionNames?: unknown;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }
  if (typeof body.attending !== "boolean") {
    return NextResponse.json(
      { error: "Informe se você vai comparecer." },
      { status: 400 }
    );
  }

  // Nomes dos acompanhantes: sanitiza no servidor (nunca confie no client).
  // Descarta o que nao for string, corta espacos e ignora vazios.
  const rawNames = Array.isArray(body.companionNames) ? body.companionNames : [];
  const companionNames = body.attending
    ? rawNames
        .filter((n): n is string => typeof n === "string")
        .map((n) => n.trim())
        .filter((n) => n.length > 0)
        .slice(0, wedding.rsvp.maxCompanions)
    : [];

  if (rawNames.length > wedding.rsvp.maxCompanions) {
    return NextResponse.json(
      {
        error: `Máximo de ${wedding.rsvp.maxCompanions} acompanhantes. Se precisar de mais, fale com os noivos.`,
      },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("guests").insert({
    name,
    email: body.email?.trim() || null,
    phone: body.phone?.trim() || null,
    attending: body.attending,
    // Derivado dos nomes, nunca vindo do client: os dois nao podem divergir.
    companions: companionNames.length,
    companion_names: companionNames,
    message: body.message?.trim() || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
