import { AppShell } from "@/components/ui-ext/AppShell";
import { obtenerSesionFixture } from "@/lib/session";

export const metadata = {
  title: "Administración — Portal de Compras BIA",
};

const NAV = [
  { label: "Tablero", href: "/admin" },
  { label: "Mis solicitudes", href: "/mis-solicitudes" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = obtenerSesionFixture("admin");
  return (
    <AppShell
      eyebrow="Administración · Trazabilidad"
      titulo="Panel de Trazabilidad"
      subtitulo="Métricas y estado de todas las solicitudes."
      navItems={NAV}
      activeHref="/admin"
      rol="admin"
      usuarioNombre={sesion.usuario.nombre}
    >
      {children}
    </AppShell>
  );
}