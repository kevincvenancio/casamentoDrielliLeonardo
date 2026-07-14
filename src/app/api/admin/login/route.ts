import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD nao configurado." },
      { status: 500 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  if (body.password !== pwd) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}
