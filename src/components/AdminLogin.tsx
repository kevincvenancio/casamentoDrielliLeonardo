"use client";

import { useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Falha no login.");
    setLoading(false);
  }

  return (
    <div className="container-page py-24">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-sm space-y-4 rounded-2xl border border-sand bg-white p-8"
      >
        <h1 className="font-serif text-2xl">Area Administrativa</h1>
        <div>
          <label className="field-label">Senha</label>
          <input
            type="password"
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
