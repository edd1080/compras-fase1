import { AppShell } from "@/components/ui-ext/AppShell";
import { obtenerSesionFixture } from "@/lib/session";

export const metadata = {
  title: "Panel de Compras — Portal de Compras BIA",
};

const NAV = [
  { label: "Bandeja", href: "/panel" },
  { label: "Mis solicitudes", href: "/mis-solicitudes" },
];

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = obtenerSesionFixture("coordinador");
  return (
    <AppShell
      eyebrow="Portal · Equipo de Compras"
      titulo="Panel de Compras"
      subtitulo="Solicitudes asignadas y flujo de gestión."
      navItems={NAV}
      activeHref="/panel"
      rol="coordinador"
      usuarioNombre={sesion.usuario.nombre}
    >
      {children}
    </AppShell>
  );
}