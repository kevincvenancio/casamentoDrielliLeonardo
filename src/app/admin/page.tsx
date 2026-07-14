import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase";
import { AdminLogin } from "@/components/AdminLogin";
import { formatBRL } from "@/lib/format";
import type { Guest, Payment } from "@/lib/types";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdminAuthenticated()) {
    return <AdminLogin />;
  }

  const supabase = createServiceClient();

  const [{ data: guestsData }, { data: paymentsData }] = await Promise.all([
    supabase.from("guests").select("*").order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("*")
      .eq("status", "approved")
      .order("updated_at", { ascending: false }),
  ]);

  const guests = (guestsData ?? []) as Guest[];
  const payments = (paymentsData ?? []) as Payment[];

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
        <StatCard label="Confirmacoes (sim)" value={String(attending.length)} />
        <StatCard label="Total de pessoas" value={String(totalPeople)} />
        <StatCard
          label="Arrecadado (aprovado)"
          value={formatBRL(totalRaisedCents)}
        />
      </div>

      {/* Confirmacoes */}
      <section className="mb-12">
        <h2 className="mb-4 font-serif text-2xl">
          Confirmacoes ({guests.length})
        </h2>
        <div className="overflow-x-auto rounded-xl border border-sand bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand/50 text-stone">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Contato</th>
                <th className="p-3">Vai?</th>
                <th className="p-3">Acomp.</th>
                <th className="p-3">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <tr key={g.id} className="border-t border-sand">
                  <td className="p-3 font-medium">{g.name}</td>
                  <td className="p-3 text-stone">
                    {g.email || g.phone || "-"}
                  </td>
                  <td className="p-3">{g.attending ? "Sim" : "Nao"}</td>
                  <td className="p-3">{g.companions ?? 0}</td>
                  <td className="p-3 text-stone">{g.message || "-"}</td>
                </tr>
              ))}
              {guests.length === 0 && (
                <tr>
                  <td className="p-3 text-stone" colSpan={5}>
                    Nenhuma confirmacao ainda.
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
                  <td className="p-3 text-stone" colSpan={5}>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sand bg-white p-6">
      <p className="text-xs uppercase tracking-widest text-stone">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </div>
  );
}
