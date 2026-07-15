import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Fetch que nunca usa o Data Cache do Next.js.
 *
 * O Next patcheia o fetch global e, por padrao, guarda o resultado das
 * requisicoes GET do supabase-js no Data Cache -- servindo um retrato ANTIGO
 * do banco mesmo em rotas `force-dynamic` (ex.: a lista de presentes ficava
 * congelada, e a checagem de disponibilidade no checkout poderia usar dados
 * velhos). Forcamos `cache: "no-store"` para que toda consulta leia o banco
 * ao vivo.
 */
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

/**
 * Cliente publico (anon key). Seguro para o browser.
 * Respeita RLS: so consegue ler o que a policy publica permite (gifts).
 */
export function createPublicClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY sao obrigatorios."
    );
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });
}

/**
 * Cliente admin (service role key). EXCLUSIVAMENTE server-side.
 * Ignora RLS. Nunca importe isto em componentes client.
 */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: noStoreFetch },
  });
}
