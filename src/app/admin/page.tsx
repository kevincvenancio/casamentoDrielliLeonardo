import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase";
import { AdminLogin } from "@/components/AdminLogin";
import { formatBRL } from "@/lib/format";
import { listGifts } from "@/lib/gifts";
import type { Guest, Payment } from "@/lib/types";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const supabase = createServiceClient();

  const [{ data: guestsData }, { data: paymentsData }, gifts] =
    await Promise.all([
      supabase
        .from("guests")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("*")
        .eq("status", "approved")
        .order("updated_at", { ascending: false }),
      listGifts({ includeInactive: true }),
    ]);

  const guests = (guestsData ?? []) as Guest[];
  const payments = (paymentsData ?? []) as Payment[];

  // Com estoque, o mesmo presente aparece varias vezes na lista de
  // pagamentos -- o titulo deixou de ser adivinhavel pelo valor.
  const giftTitleById = new Map(gifts.map((g) => [g.id, g.title]));

  const attending = guests.filter((g) => g.attending);
  const totalPeople = attending.reduce(
    (acc, g) => acc + 1 + (g.companions ?? 0),
    0
  );
  const totalRaisedCents = payments.reduce(
    (acc, p) => acc + (p.amount_cents ?? 0),
    0
  );

  return (
    <div className="container-page py-12">
      <h1 className="section-title mb-8">Painel</h1>

      {/* Totais */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <StatCard label="Confirmações (sim)" value={String(attending.length)} />
        <StatCard label="Total de pessoas" value={String(totalPeople)} />
        <StatCard
          label="Arrecadado (aprovado)"
          value={formatBRL(totalRaisedCents)}
        />
      </div>

      {/* Confirmacoes */}
      <section className="mb-12">
        <h2 className="mb-4 font-serif text-2xl">
          Confirmações ({guests.length})
        </h2>
        <div className="overflow-x-auto rounded-xl border border-sand bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand/50 text-stone">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Contato</th>
                <th className="p-3">Vai?</th>
                <th className="p-3">Acompanhantes</th>
                <th className="p-3">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <tr key={g.id} className="border-t border-sand align-top">
                  <td className="p-3 font-medium">{g.name}</td>
                  <td className="p-3 text-stone">
                    {g.email || g.phone || "-"}
                  </td>
                  <td className="p-3">{g.attending ? "Sim" : "Não"}</td>
                  <td className="p-3">
                    <Acompanhantes guest={g} />
                  </td>
                  <td className="p-3 text-stone">{g.message || "-"}</td>
                </tr>
              ))}
              {guests.length === 0 && (
                <tr>
                  <td className="p-3 text-stone" colSpan={5}>
                    Nenhuma confirmação ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Presentes e estoque */}
      <section className="mb-12">
        <h2 className="mb-1 font-serif text-2xl">
          Presentes ({gifts.length})
        </h2>
        <p className="mb-4 text-sm text-stone">
          Estoque <strong>ilimitado</strong> significa que o presente nunca sai
          da lista. Para limitar, rode no SQL Editor do Supabase:{" "}
          <code className="rounded bg-sand px-1">
            update gifts set stock_total = 10 where title = &apos;...&apos;;
          </code>
        </p>
        <div className="overflow-x-auto rounded-xl border border-sand bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand/50 text-stone">
              <tr>
                <th className="p-3">Presente</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Vendidos</th>
                <th className="p-3">Em pagamento</th>
                <th className="p-3">Estoque</th>
                <th className="p-3">Arrecadado</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map((g) => (
                <tr key={g.id} className="border-t border-sand">
                  <td className="p-3 font-medium">
                    {g.title}
                    {!g.active && (
                      <span className="ml-2 text-xs italic text-stone">
                        (desativado)
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-stone">{formatBRL(g.price_cents)}</td>
                  <td className="p-3">{g.paidCount}</td>
                  <td className="p-3 text-stone">{g.reservedCount}</td>
                  <td className="p-3 text-stone">
                    {g.remaining === null
                      ? "ilimitado"
                      : `${g.remaining} de ${g.stock_total}`}
                  </td>
                  <td className="p-3">
                    {formatBRL(g.paidCount * g.price_cents)}
                  </td>
                </tr>
              ))}
              {gifts.length === 0 && (
                <tr>
                  <td className="p-3 text-stone" colSpan={6}>
                    Nenhum presente cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagamentos aprovados */}
      <section>
        <h2 className="mb-4 font-serif text-2xl">
          Pagamentos aprovados ({payments.length})
        </h2>
        <div className="overflow-x-auto rounded-xl border border-sand bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand/50 text-stone">
              <tr>
                <th className="p-3">Comprador</th>
                <th className="p-3">Presente</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Valor</th>
                <th className="p-3">MP Payment ID</th>
                <th className="p-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-sand">
                  <td className="p-3 font-medium">{p.buyer_name || "-"}</td>
                  <td className="p-3 text-stone">
                    {(p.gift_id && giftTitleById.get(p.gift_id)) || "-"}
                  </td>
                  <td className="p-3 text-stone">{p.buyer_email || "-"}</td>
                  <td className="p-3">{formatBRL(p.amount_cents ?? 0)}</td>
                  <td className="p-3 text-stone">{p.mp_payment_id || "-"}</td>
                  <td className="p-3 text-stone">
                    {new Date(p.updated_at).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td className="p-3 text-stone" colSpan={6}>
                    Nenhum pagamento aprovado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/**
 * Lista os nomes dos acompanhantes.
 *
 * Confirmacoes feitas ANTES da migration 0002 so tem a quantidade, sem nomes.
 * Nesses casos sinalizamos explicitamente, em vez de mostrar "0" e dar a
 * impressao errada de que a pessoa vai sozinha.
 */
function Acompanhantes({ guest }: { guest: Guest }) {
  if (!guest.attending) return <span className="text-stone">-</span>;

  const nomes = guest.companion_names ?? [];
  const quantidade = guest.companions ?? 0;

  if (nomes.length === 0 && quantidade > 0) {
    return (
      <span className="text-stone">
        {quantidade}{" "}
        <span className="text-xs italic">(nomes não informados)</span>
      </span>
    );
  }

  if (nomes.length === 0) return <span className="text-stone">-</span>;

  return (
    <ol className="list-inside list-decimal space-y-0.5">
      {nomes.map((nome, i) => (
        <li key={i}>{nome}</li>
      ))}
    </ol>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sand bg-white p-6">
      <p className="text-xs uppercase tracking-widest text-stone">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </div>
  );
}
