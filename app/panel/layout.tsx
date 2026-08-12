import { Topbar } from "@/components/ui-ext/Topbar";
import { Shell } from "@/components/ui-ext/Shell";

export const metadata = {
  title: "Panel de Compras — Portal de Compras BIA",
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Shell>
      <Topbar
        meta={{
          eyebrow: "Portal · Equipo de Compras",
          title: "Panel de Compras",
          sub: "Solicitudes asignadas y flujo de gestión.",
        }}
        brandHref="/panel"
        brandLabel="Inicio"
      />
      {children}
    </Shell>
  );
}