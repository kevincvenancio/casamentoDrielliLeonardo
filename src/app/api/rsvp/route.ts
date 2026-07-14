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
    companions?: number;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Nome e obrigatorio." }, { status: 400 });
  }
  if (typeof body.attending !== "boolean") {
    return NextResponse.json(
      { error: "Informe se voce vai comparecer." },
      { status: 400 }
    );
  }

  const companions = Math.max(
    0,
    Math.min(wedding.rsvp.maxCompanions, Number(body.companions ?? 0) || 0)
  );

  const supabase = createServiceClient();
  const { error } = await supabase.from("guests").insert({
    name,
    email: body.email?.trim() || null,
    phone: body.phone?.trim() || null,
    attending: body.attending,
    companions: body.attending ? companions : 0,
    message: body.message?.trim() || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
