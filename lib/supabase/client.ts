import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Cliente de Supabase para uso en el cliente/navegador.
 * El sistema es autocontenido (ADR 0005): no lee ni escribe en sistemas externos del cliente.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY (ver .env.example)"
    );
  }
  return createClient(url, anonKey);
}
