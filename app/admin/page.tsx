"use client";

import { useState } from "react";
import { MetricCard } from "@/components/ui-ext/MetricCard";
import { BarChart } from "@/components/ui-ext/BarChart";
import { DataTable } from "@/components/ui-ext/DataTable";
import { EmptyState } from "@/components/ui-ext/EmptyState";
import { Badge } from "@/components/Badge";
import { calcularMetricas } from "@/lib/domain/metrics";
import type { Solicitud } from "@/lib/domain/types";
import { solicitudesFixture, usuariosFixture } from "@/lib/fixtures";

type Rango = "all" | "hoy" | "semana" | "mes";

export default function AdminDashboardPage() {
  const [rango, setRango] = useState<Rango>("all");
  const [coordinador, setCoordinador] = useState("all");
  const hoy = new Date("2026-07-27T00:00:00Z");

  const filtradas = solicitudesFixture.filter((s) => {
    if (coordinador !== "all" && s.coordinadorId !== coordinador) return false;
    if (rango === "all") return true;
    const creada = new Date(s.fechaCreacion).getTime();
    const dif = hoy.getTime() - creada;
    const dias = dif / (1000 * 60 * 60 * 24);
    if (rango === "hoy") return dias < 1;
    if (rango === "semana") return dias <= 7;
    if (rango === "mes") return dias <= 31;
    return true;
  });

  const metricas = calcularMetricas(filtradas, { hoy: hoy.toISOString() });

  const nombreCoordinador = (id: string) =>
    usuariosFixture.find((u) => u.id === id)?.nombre ?? id;

  const volumenBarras = Object.entries(metricas.volumenPorCoordinador).map(
    ([id, v]) => ({
      label: nombreCoordinador(id),
      value: v,
    })
  );

  const tipoBarras = Object.entries(metricas.distribucionPorTipo).map(([tipo, v]) => ({
    label: tipo,
    value: v,
  }));

  return (
    <div className="py-8">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          hero
          label="Conversión solicitud → aceptación"
          value={metricas.tasaConversion === null ? "sin datos" : `${Math.round(metricas.tasaConversion)}%`}
          note="La métrica que hoy Compras no puede medir de ninguna forma."
        />
        <MetricCard
          label="Tiempo de ciclo promedio"
          value={metricas.tiempoCicloPromedioDias === null ? "—" : `${metricas.tiempoCicloPromedioDias.toFixed(1)}d`}
          note="Desde creación hasta cierre"
        />
        <MetricCard
          label="Solicitudes activas"
          value={String(metricas.solicitudesActivas)}
          note="En algún punto del ciclo"
          valueClassName="text-azul-marino"
        />
        <MetricCard
          label="Sin decisión > 5 días"
          value={String(metricas.solicitudesSinDecision)}
          note="Requieren seguimiento"
          valueClassName="text-clay"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-borde bg-superficie px-6 py-5 shadow-card">
          <h3 className="mb-4 font-display text-[14px] font-semibold">Volumen por coordinador</h3>
          {volumenBarras.length ? <BarChart data={volumenBarras} /> : <EmptyText />}
        </div>
        <div className="rounded-card border border-borde bg-superficie px-6 py-5 shadow-card">
          <h3 className="mb-4 font-display text-[14px] font-semibold">Distribución por tipo</h3>
          {tipoBarras.length ? <BarChart data={tipoBarras} /> : <EmptyText />}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "hoy", "semana", "mes"] as Rango[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRango(r)}
              className={
                "rounded-full border px-3.5 py-2 text-[12.5px] " +
                (rango === r
                  ? "border-azul-marino bg-azul-marino text-white"
                  : "border-borde-fuerte bg-superficie text-texto-secundario")
              }
            >
              {r === "all" ? "Todo" : r === "hoy" ? "Hoy" : r === "semana" ? "Esta semana" : "Este mes"}
            </button>
          ))}
        </div>
        <select
          value={coordinador}
          onChange={(e) => setCoordinador(e.target.value)}
          className="rounded-full border border-borde-fuerte bg-superficie px-3.5 py-2 text-[12.5px]"
        >
          <option value="all">Todos los coordinadores</option>
          {usuariosFixture
            .filter((u) => u.rol === "coordinador")
            .map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
        </select>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          title="Aún no hay solicitudes suficientes para mostrar métricas"
          description="Los indicadores aparecerán conforme el equipo empiece a usar el portal."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtradas}
          rowKey={(s) => s.id}
        />
      )}
    </div>
  );
}

function EmptyText() {
  return <p className="py-4 text-[13px] text-texto-terciario">Sin datos en este período.</p>;
}

const columns = [
  { key: "ref", header: "Referencia", render: (s: Solicitud) => (
    <span className="font-mono font-medium">{s.numeroReferencia ?? "—"}</span>
  ) },
  { key: "tipo", header: "Tipo", render: (s: Solicitud) => s.tipo ?? "—" },
  { key: "solicitante", header: "Solicitante", render: (s: Solicitud) => s.solicitanteNombre },
  { key: "coordinador", header: "Coordinador", render: (s: Solicitud) => s.coordinadorId ?? "—" },
  { key: "estado", header: "Estado", render: (s: Solicitud) => (
    <Badge label={estadoLegible(s.estado)} tone={toneDe(s.estado)} />
  ) },
  { key: "creada", header: "Creada", render: (s: Solicitud) => new Date(s.fechaCreacion).toLocaleDateString("es-HN") },
  { key: "cerrada", header: "Cerrada", render: (s: Solicitud) => s.fechaCierre ? new Date(s.fechaCierre).toLocaleDateString("es-HN") : "—" },
];

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

function toneDe(e: string): "blue" | "success" | "warning" | "gray"{
  if (e === "CERRADA_CON_DECISION") return "success";
  if (e === "CERRADA_SIN_DECISION" || e === "CANCELADA") return "gray";
  if (e === "ENVIADA_A_SOLICITANTE") return "warning";
  return "blue";
}