"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/ui-ext/MetricCard";
import { BarChart } from "@/components/ui-ext/BarChart";
import { EmptyState } from "@/components/ui-ext/EmptyState";
import { api } from "@/lib/api-client";
import type { MetricasDashboard } from "@/lib/domain/metrics";
import { usuariosFixture } from "@/lib/fixtures";

type Rango = "all" | "hoy" | "semana" | "mes";

const METRICAS_VACIAS: MetricasDashboard = {
  tasaConversion: null,
  tiempoCicloPromedioDias: null,
  solicitudesActivas: 0,
  solicitudesSinDecision: 0,
  volumenPorCoordinador: {},
  distribucionPorTipo: {},
};

export default function AdminDashboardPage() {
  const [rango, setRango] = useState<Rango>("all");
  const [coordinador, setCoordinador] = useState("all");
  const [metricas, setMetricas] = useState<MetricasDashboard>(METRICAS_VACIAS);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .metricas()
      .then((m) => setMetricas(m))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar métricas"))
      .finally(() => setCargando(false));
  }, [rango, coordinador]);

  const nombreCoordinador = (id: string) =>
    usuariosFixture.find((u) => u.id === id)?.nombre ?? id;

  const volumenBarras = Object.entries(metricas.volumenPorCoordinador).map(
    ([id, v]) => ({ label: nombreCoordinador(id), value: v })
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

      {cargando ? (
        <p className="text-[13.5px] text-texto-secundario">Calculando métricas…</p>
      ) : error ? (
        <EmptyState
          title="No se pudieron cargar las métricas"
          description={error}
        />
      ) : (
        <EmptyState
          title="Aún no hay solicitudes suficientes para mostrar métricas"
          description="Los indicadores aparecerán conforme el equipo empiece a usar el portal."
        />
      )}
    </div>
  );
}

function EmptyText() {
  return <p className="py-4 text-[13px] text-texto-terciario">Sin datos en este período.</p>;
}