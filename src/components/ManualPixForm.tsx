"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatBRL } from "@/lib/format";
import { parseBRLToCents } from "@/lib/manual-pix";

/** Formulario do painel para lancar um Pix recebido direto na conta. */
export function ManualPixForm() {
  const router = useRouter();
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mostra como o valor foi entendido antes de salvar: "1.500" e mil e
  // quinhentos, nao um e cinquenta.
  const preview = amount.trim() ? parseBRLToCents(amount) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);
    setLoading(true);

    const res = await fetch("/api/admin/pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donorName, amount }),
    }).catch(() => null);

    setLoading(false);

    if (res?.ok) {
      setSaved(`Pix de ${donorName.trim()} lançado.`);
      setDonorName("");
      setAmount("");
      router.refresh();
      return;
    }

    const data = res ? await res.json().catch(() => ({})) : {};
    setError(data.error ?? "Não foi possível salvar. Tente de novo.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xl border border-sand bg-white p-6 sm:grid-cols-[1fr_12rem_auto] sm:items-start"
    >
      <div>
        <label className="field-label" htmlFor="pix-nome">
          Quem fez o Pix
        </label>
        <input
          id="pix-nome"
          className="field-input"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Nome da pessoa"
          maxLength={120}
          required
        />
      </div>

      <div>
        <label className="field-label" htmlFor="pix-valor">
          Valor recebido
        </label>
        <input
          id="pix-valor"
          className="field-input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="150,00"
          inputMode="decimal"
          autoComplete="off"
          required
        />
        <p className="mt-1 h-4 text-xs text-stone">
          {amount.trim() &&
            (preview != null ? `= ${formatBRL(preview)}` : "Valor inválido")}
        </p>
      </div>

      <button
        type="submit"
        className="btn-primary sm:mt-6"
        disabled={loading}
      >
        {loading ? "Salvando..." : "Lançar Pix"}
      </button>

      {(error || saved) && (
        <p
          className={`text-sm sm:col-span-3 ${error ? "text-red-600" : "text-stone"}`}
          role="status"
        >
          {error ?? saved}
        </p>
      )}
    </form>
  );
}

/** Botao de remover um lancamento manual, com confirmacao. */
export function DeleteManualPixButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm(`Remover o Pix de ${label}?`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/pix?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(() => null);
    setLoading(false);
    if (res?.ok) {
      router.refresh();
      return;
    }
    const data = res ? await res.json().catch(() => ({})) : {};
    window.alert(data.error ?? "Não foi possível remover.");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-stone underline underline-offset-2 hover:text-red-600 disabled:opacity-50"
    >
      {loading ? "Removendo..." : "Remover"}
    </button>
  );
}
