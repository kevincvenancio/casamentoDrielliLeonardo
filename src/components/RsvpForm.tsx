"use client";

import { useState } from "react";

export function RsvpForm({ maxCompanions }: { maxCompanions: number }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  // Um campo de texto por acompanhante. A quantidade e o tamanho desta lista.
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addCompanion() {
    if (companionNames.length >= maxCompanions) return;
    setCompanionNames((prev) => [...prev, ""]);
  }

  function removeCompanion(index: number) {
    setCompanionNames((prev) => prev.filter((_, i) => i !== index));
  }

  function setCompanionName(index: number, value: string) {
    setCompanionNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Informe seu nome.");
    if (attending === null) return setError("Informe se você vai comparecer.");

    const nomes = companionNames.map((n) => n.trim());
    if (attending && nomes.some((n) => !n)) {
      return setError(
        "Preencha o nome de cada acompanhante (ou remova o campo vazio)."
      );
    }

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
          companionNames: attending ? nomes : [],
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
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-sand bg-white p-8 text-center">
        <h2 className="font-serif text-2xl">Obrigado!</h2>
        <p className="mt-2 text-stone">
          {attending
            ? "Sua presença foi confirmada. Mal podemos esperar para celebrar com você!"
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
        <span className="field-label">Você vai comparecer? *</span>
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
            onClick={() => {
              setAttending(false);
              setCompanionNames([]);
            }}
            className={
              attending === false ? "btn-primary flex-1" : "btn-outline flex-1"
            }
          >
            Não poderei
          </button>
        </div>
      </div>

      {attending === true && (
        <div>
          <span className="field-label">Acompanhantes</span>

          {companionNames.length === 0 ? (
            <p className="mb-3 text-sm text-stone">
              Vai levar alguém? Adicione o nome de cada acompanhante.
            </p>
          ) : (
            <ul className="mb-3 space-y-3">
              {companionNames.map((nome, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    className="field-input"
                    value={nome}
                    placeholder={`Nome do ${i + 1}º acompanhante`}
                    aria-label={`Nome do ${i + 1}º acompanhante`}
                    onChange={(e) => setCompanionName(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeCompanion(i)}
                    aria-label={`Remover ${i + 1}º acompanhante`}
                    className="shrink-0 rounded-lg border border-sand px-3 py-2 text-sm text-stone transition hover:border-stone hover:text-ink"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}

          {companionNames.length < maxCompanions ? (
            <button
              type="button"
              onClick={addCompanion}
              className="btn-outline w-full py-2 text-sm"
            >
              + Adicionar acompanhante
            </button>
          ) : (
            <p className="text-sm text-stone">
              Máximo de {maxCompanions} acompanhantes. Se precisar de mais, fale
              com os noivos.
            </p>
          )}
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
