// Cookie de continuidad del solicitante (30 días) — sin autenticación.
// Fuente: user-flows.md §2.3. No es autenticación: solo asocia borrador/email.

export const COOKIE_NOMBRE = "bia_session";

export function leerCookie(nombre = COOKIE_NOMBRE): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${nombre}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function escribirCookie(
  valor: string,
  opts: { nombre?: string; dias?: number } = {}
): void {
  if (typeof document === "undefined") return;
  const nombre = opts.nombre ?? COOKIE_NOMBRE;
  const dias = opts.dias ?? 30;
  const expira = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${nombre}=${encodeURIComponent(
    valor
  )}; expires=${expira}; path=/; samesite=lax`;
}

export function limpiarCookie(nombre = COOKIE_NOMBRE): void {
  if (typeof document === "undefined") return;
  document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function guardarBorradorEmail(email: string): void {
  escribirCookie(JSON.stringify({ borradorEmail: email }));
}

export function leerBorradorEmail(): string | null {
  const raw = leerCookie();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { borradorEmail?: string };
    return parsed.borradorEmail ?? null;
  } catch {
    return null;
  }
}