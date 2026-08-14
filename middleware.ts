import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Rutas públicas: solicitante + vista pública + login + assets.
const PUBLICAS = [
  "/",
  "/solicitud",
  "/mis-solicitudes",
  "/comparativa",
  "/login",
  "/_next",
  "/favicon",
];

// Mapa de ruta protegida -> rol requerido.
const PROTEGIDAS: Record<string, "coordinador" | "admin"> = {
  "/panel": "coordinador",
  "/admin": "admin",
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refrescar la sesión (renueva cookies si es necesario).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Si está en una ruta pública protegida por rol, resolverla.
  for (const [prefix, rol] of Object.entries(PROTEGIDAS)) {
    if (pathname.startsWith(prefix)) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = `/login/${rol}`;
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
      const userRol = user.app_metadata?.rol as string | undefined;
      if (userRol !== rol) {
        // Rol incorrecto: redirige a su portal correspondiente.
        const dest = userRol === "admin" ? "/admin" : "/panel";
        if (pathname.startsWith(dest)) return response;
        return NextResponse.redirect(new URL(dest, request.url));
      }
      return response;
    }
  }

  // Si está en /login y ya tiene sesión, redirigir a su portal.
  if (pathname.startsWith("/login") && user) {
    const rol = user.app_metadata?.rol as string | undefined;
    const dest = rol === "admin" ? "/admin" : "/panel";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export const PUBLIC_ROUTES = PUBLICAS;
