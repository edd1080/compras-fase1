import { notFound } from "next/navigation";
import { DetalleSolicitud } from "@/components/coordinador/DetalleSolicitud";
import { solicitudesFixture } from "@/lib/fixtures";
import { Badge } from "@/components/Badge";

export default async function SolicitudDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const solicitud = solicitudesFixture.find((s) => s.id === id);
  if (!solicitud) notFound();

  return (
    <div className="py-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[19px] font-medium">
            {solicitud.numeroReferencia ?? "—"}
          </div>
          <div className="mt-1 font-display text-[20px] font-semibold">{solicitud.titulo}</div>
          <div className="mt-1 text-[13px] text-slate">
            {solicitud.solicitanteNombre} · {solicitud.areaSolicitante ?? "—"} · Requerida:{" "}
            {solicitud.fechaRequerida ?? "—"}
          </div>
        </div>
        <Badge label={estadoLegible(solicitud.estado)} tone={toneDe(solicitud.estado)} />
      </div>
      <DetalleSolicitud solicitud={solicitud} />
    </div>
  );
}

function estadoLegible(e: string): string {
  const m: Record<string, string> = {
    ENVIADA_A_COMPRAS: "Enviada a Compras",
    EN_COTIZACION: "En cotización",
    COMPARATIVA_LISTA: "Comparativa lista",
    ENVIADA_A_SOLICITANTE: "Esperando decisión",
    CERRADA_CON_DECISION: "Cerrada con decisión",
    CERRADA_SIN_DECISION: "Cerrada sin decisión",
    CANCELADA: "Cancelada",
  };
  return m[e] ?? e;
}

function toneDe(e: string): "blue" | "success" | "warning" | "gray" {
  if (e === "CERRADA_CON_DECISION") return "success";
  if (e === "CERRADA_SIN_DECISION" || e === "CANCELADA") return "gray";
  if (e === "ENVIADA_A_SOLICITANTE") return "warning";
  return "blue";
}