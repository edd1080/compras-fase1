// Guard de autorización para rutas API — Portal de Compras BIA.
// Valida la sesión real del usuario (cookie Supabase) y que su rol esté permitido.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export type ApiRol = "coordinador" | "admin";

// Retorna la sesión si el usuario autenticado tiene un rol permitido; si no, una
// respuesta 401 (sin sesión) o 403 (rol no autorizado). Si está autorizado, undefined.
export async function guardApi(roles: ApiRol[]): Promise<
  { sesion: NonNullable<Awaited<ReturnType<typeof getSession>>>; negada?: undefined } | { negada: NextResponse; sesion?: undefined }
> {
  const sesion = await getSession();
  if (!sesion) {
    return { negada: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }
  if (!roles.includes(sesion.rol)) {
    return { negada: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { sesion };
}