import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para uso en el cliente/navegador.
 * El sistema es autocontenido (ADR 0005): no lee ni escribe en sistemas externos del cliente.
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
