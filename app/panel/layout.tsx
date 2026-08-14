import { requireAuth } from "@/lib/auth";
import { SesionProvider } from "@/lib/sesion-context";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

export const metadata = {
  title: "Panel de Compras — Portal de Compras BIA",
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await requireAuth(["coordinador"]);

  // Resolver el id local del coordinador en la tabla `usuario` por su email (para queries asignadas).
  let localId: string | undefined;
  try {
    const repo = new PostgresRepositorio();
    const coordinadores = await repo.listarCoordinadores();
    const match = coordinadores.find(
      (c) => c.email.toLowerCase() === sesion.email.toLowerCase()
    );
    localId = match?.id;
  } catch {
    localId = undefined;
  }

  return (
    <SesionProvider
      value={{ nombre: sesion.nombre, email: sesion.email, rol: sesion.rol, localId }}
    >
      {children}
    </SesionProvider>
  );
}