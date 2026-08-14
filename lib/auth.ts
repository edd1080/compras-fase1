// Helpers de autenticación — Portal de Compras BIA.
// Extrae la sesión y el rol del usuario autenticado en Supabase.
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Rol = "coordinador" | "admin";

export type SesionAutenticada = {
  session: Session;
  rol: Rol;
  nombre: string;
  email: string;
};

// Lee la sesión actual sin lanzar (para usos no bloqueantes).
export async function getSession(): Promise<SesionAutenticada | null> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const rol = (session.user.app_metadata?.rol as Rol) ?? null;
    const nombre =
      (session.user.user_metadata?.nombre as string) ||
      session.user.email?.split("@")[0] ||
      "Usuario";
    if (!rol) return null;
    return { session, rol, nombre, email: session.user.email ?? nombre };
  } catch {
    return null;
  }
}

// Requiere autenticación con uno de los roles dados; si no, redirige.
export async function requireAuth(roles: Rol[]): Promise<SesionAutenticada> {
  const sesion = await getSession();
  if (!sesion) {
    redirect(`/login/${roles[0] ?? "coordinador"}`);
  }
  if (!roles.includes(sesion.rol)) {
    // Rol no permitido para esta ruta -> redirige a su portal o a login.
    redirect(sesion.rol === "admin" ? "/admin" : "/panel");
  }
  return sesion;
}

// Devuelve la ruta raíz correspondiente a un rol.
export function rutaPorRol(rol: Rol): string {
  return rol === "admin" ? "/admin" : "/panel";
}
