import { createClient, SupabaseClient } from "@supabase/supabase-js";

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
  });
}
