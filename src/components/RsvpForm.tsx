"use client";

import { useState } from "react";

export function RsvpForm({ maxCompanions }: { maxCompanions: number }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [companions, setCompanions] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Informe seu nome.");
    if (attending === null) return setError("Informe se voce vai comparecer.");

    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          attending,
          companions,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar. Tente novamente.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Erro de conexao. Tente novamente.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-sand bg-white p-8 text-center">
        <h2 className="font-serif text-2xl">Obrigado!</h2>
        <p className="mt-2 text-stone">
          {attending
            ? "Sua presenca foi confirmada. Mal podemos esperar para celebrar com voce!"
            : "Agradecemos o retorno. Sentiremos sua falta!"}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-sand bg-white p-6"
    >
      <div>
        <label className="field-label">Nome completo *</label>
        <input
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">E-mail</label>
          <input
            type="email"
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Telefone</label>
          <input
            className="field-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div>
        <span className="field-label">Voce vai comparecer? *</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAttending(true)}
            className={
              attending === true ? "btn-primary flex-1" : "btn-outline flex-1"
            }
          >
            Sim, vou!
          </button>
          <button
            type="button"
            onClick={() => setAttending(false)}
            className={
              attending === false ? "btn-primary flex-1" : "btn-outline flex-1"
            }
          >
            Nao poderei
          </button>
        </div>
      </div>

      {attending === true && (
        <div>
          <label className="field-label">
            Acompanhantes (alem de voce)
          </label>
          <select
            className="field-input"
            value={companions}
            onChange={(e) => setCompanions(Number(e.target.value))}
          >
            {Array.from({ length: maxCompanions + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="field-label">Mensagem para os noivos</label>
        <textarea
          className="field-input"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Enviando..." : "Confirmar"}
      </button>
    </form>
  );
}
