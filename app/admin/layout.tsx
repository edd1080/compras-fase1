import { Topbar } from "@/components/ui-ext/Topbar";
import { Shell } from "@/components/ui-ext/Shell";

export const metadata = {
  title: "Administración — Portal de Compras BIA",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Shell>
      <Topbar
        meta={{
          eyebrow: "Administración · Trazabilidad",
          title: "Panel de Trazabilidad",
          sub: "Métricas y estado de todas las solicitudes.",
        }}
        brandHref="/admin"
        brandLabel="Inicio"
      />
      {children}
    </Shell>
  );
}