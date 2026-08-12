// Métricas derivadas del dashboard — Portal de Compras BIA
// Fuente: diccionario 15 §4. Se calculan desde solicitudes (en prod, desde eventos).
// Puras, sin dependencias.
import type { Solicitud } from "./types";

export type MetricasDashboard = {
  tasaConversion: number | null;
  tiempoCicloPromedioDias: number | null;
  solicitudesActivas: number;
  solicitudesSinDecision: number;
  volumenPorCoordinador: Record<string, number>;
  distribucionPorTipo: Record<string, number>;
};

function diasEntre(a?: string, b?: string): number | null {
  if (!a || !b) return null;
  const diff = new Date(b).getTime() - new Date(a).getTime();
  return diff / (1000 * 60 * 60 * 24);
}

export function calcularMetricas(
  solicitudes: Solicitud[],
  opts?: { hoy?: string }
): MetricasDashboard {
  const hoy = opts?.hoy ?? new Date().toISOString();

  const enviadas = solicitudes.filter((s) => s.estado !== "BORRADOR");
  const cerradasConDecision = solicitudes.filter(
    (s) => s.estado === "CERRADA_CON_DECISION"
  );
  const tasaConversModelo =
    enviadas.length === 0 ? null : cerradasConDecision.length / enviadas.length;

  const conTiempo = solicitudes
    .map((s) => diasEntre(s.fechaEnvio, s.fechaCierre))
    .filter((d): d is number => d !== null && d >= 0);
  const tiempoCiclo =
    conTiempo.length === 0 ? null : conTiempo.reduce((a, b) => a + b, 0) / conTiempo.length;

  const activas = solicitudes.filter(
    (s) => !["CERRADA_CON_DECISION", "CERRADA_SIN_DECISION", "CANCELADA", "BORRADOR"].includes(s.estado)
  );

  const sinDecision = solicitudes.filter(
    (s) =>
      !["CERRADA_CON_DECISION", "CERRADA_SIN_DECISION", "CANCELADA"].includes(s.estado) &&
      diasEntre(s.fechaCreacion, hoy) !== null &&
      (diasEntre(s.fechaCreacion, hoy) ?? 0) > 5
  );

  const volumenPorCoordinador: Record<string, number> = {};
  const distribucionPorTipo: Record<string, number> = {};
  for (const s of solicitudes) {
    if (s.coordinadorId) {
      volumenPorCoordinador[s.coordinadorId] =
        (volumenPorCoordinador[s.coordinadorId] ?? 0) + 1;
    }
    const tipo = s.tipo ?? "SIN_TIPO";
    distribucionPorTipo[tipo] = (distribucionPorTipo[tipo] ?? 0) + 1;
  }

  return {
    tasaConversion: tasaConversModelo === null ? null : tasaConversModelo * 100,
    tiempoCicloPromedioDias: tiempoCiclo,
    solicitudesActivas: activas.length,
    solicitudesSinDecision: sinDecision.length,
    volumenPorCoordinador,
    distribucionPorTipo,
  };
}

export function tasaConversionTexto(m: MetricasDashboard): string {
  return m.tasaConversion === null
    ? "sin datos"
    : `${m.tasaConversion.toFixed(0)}%`;
}