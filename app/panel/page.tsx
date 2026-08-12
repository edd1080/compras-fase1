"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/ui-ext/EmptyState";
import { solicitudesFixture } from "@/lib/fixtures";
import { obtenerSesionFixture } from "@/lib/session";

type FiltroEstado = "all" | "activas" | "esperando-cotizaciones" | "esperando-decision" | "cerradas";

export default function PanelPage() {
  const router = useRouter();
  const sesion = obtenerSesionFixture("coordinador");
  const [filtro, setFiltro] = useState<FiltroEstado>("all");

  const asignadas = solicitudesFixture.filter(
    (s) => s.coordinadorId === sesion.usuario.id
  );

  const visibles = asignadas.filter((s) => {
    if (filtro === "all") return true;
    if (filtro === "activas")
      return !["CERRADA_CON_DECISION", "CERRADA_SIN_DECISION", "CANCELADA"].includes(s.estado);
    if (filtro === "esperando-cotizaciones") return s.estado === "ENVIADA_A_COMPRAS" || s.estado === "EN_COTIZACION";
    if (filtro === "esperando-decision") return s.estado === "ENVIADA_A_SOLICITANTE";
    if (filtro === "cerradas")
      return ["CERRADA_CON_DECISION", "CERRADA_SIN_DECISION", "CANCELADA"].includes(s.estado);
    return true;
  });

  const contadores = {
    activas: asignadas.filter((s) => !["CERRADA_CON_DECISION", "CERRADA_SIN_DECISION", "CANCELADA"].includes(s.estado)).length,
    esperandoCotizaciones: asignadas.filter((s) => s.estado === "ENVIADA_A_COMPRAS" || s.estado === "EN_COTIZACION").length,
    esperandoDecision: asignadas.filter((s) => s.estado === "ENVIADA_A_SOLICITANTE").length,
    cerradas: asignadas.filter((s) => ["CERRADA_CON_DECISION", "CERRADA_SIN_DECISION", "CANCELADA"].includes(s.estado)).length,
  };

  const tabs: { key: FiltroEstado; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "activas", label: `Activas (${contadores.activas})` },
    { key: "esperando-cotizaciones", label: `Esperando cotizaciones (${contadores.esperandoCotizaciones})` },
    { key: "esperando-decision", label: `Esperando decisión (${contadores.esperandoDecision})` },
    { key: "cerradas", label: `Cerradas (${contadores.cerradas})` },
  ];

  return (
    <div className="py-8">
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFiltro(t.key)}
            className={
              "rounded-card border px-3.5 py-2 text-[12.5px] " +
              (filtro === t.key
                ? "border-azul-soft2 bg-azul-claro font-semibold text-azul-marino"
                : "border-borde bg-superficie text-texto-terciario hover:text-azul-marino")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          title="No tenés solicitudes asignadas"
          description="Cuando alguien solicite una compra de tus categorías, aparecerá acá."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {visibles.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => router.push(`/panel/solicitud/${s.id}`)}
              className="flex items-center gap-4 rounded-card border border-borde bg-superficie px-5 py-4 text-left shadow-card transition-colors hover:border-azul-medio"
            >
              <span className="w-[126px] shrink-0 font-mono text-[13px] font-medium">
                {s.numeroReferencia ?? "—"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center text-[13.5px] font-semibold">
                  {s.solicitanteNombre} — {s.tipo}
                  {["ENVIADA_A_COMPRAS", "EN_COTIZACION"].includes(s.estado) ? (
                    <span className="ml-2 rounded-full bg-brass px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Nueva
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-[12px] text-slate">
                  {s.titulo} · {s.categoria ?? "—"}
                </span>
              </span>
              <Badge label={estadoLegible(s.estado)} tone={toneDe(s.estado)} />
            </button>
          ))}
        </div>
      )}
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