// Motor de alertas — Portal de Compras BIA
// Fuente: doc 17 H4.4 + RF-57. Reglas determinísticas (sin IA). Puras, sin dependencias de IO.
import type { Cotizacion, Solicitud } from "./types";

export type AlertaCompras = {
  tipo: "inactividad" | "sin_desglose_fiscal" | "una_sola_cotizacion" | "discrepancia";
  solicitudId: string;
  titulo: string;
  detalle: string;
  criticidad: "alta" | "media";
};

const TERMINALES = ["CERRADA_CON_DECISION", "CERRADA_SIN_DECISION", "CANCELADA"];

export function detectarAlertas(opts: {
  solicitudes: Solicitud[];
  cotizacionesPorSolicitud: Record<string, Cotizacion[]>;
  discrepanciasPorSolicitud?: Record<string, boolean>;
  umbralDias?: number;
  hoy?: string;
}): AlertaCompras[] {
  const {
    solicitudes,
    cotizacionesPorSolicitud,
    discrepanciasPorSolicitud = {},
    umbralDias = 5,
    hoy = new Date().toISOString(),
  } = opts;
  const alertas: AlertaCompras[] = [];
  const umbralMs = umbralDias * 24 * 60 * 60 * 1000;

  for (const s of solicitudes) {
    if (TERMINALES.includes(s.estado)) continue;
    const cotizaciones = cotizacionesPorSolicitud[s.id] ?? [];

    // 1. Inactividad: sin movimiento desde la creación mayor al umbral.
    const antiguedadMs = new Date(hoy).getTime() - new Date(s.fechaCreacion).getTime();
    if (antiguedadMs > umbralMs && !s.fechaEnvio) {
      alertas.push({
        tipo: "inactividad",
        solicitudId: s.id,
        titulo: s.titulo,
        detalle: `Sin avance hace más de ${umbralDias} días.`,
        criticidad: "media",
      });
    }

    // 2. Sin desglose fiscal (hay monto total pero impuestos no desglosados ni declarados).
    cotizaciones.forEach((c) => {
      if (c.valorTotal === undefined) return;
      if (c.impuestosDesglosados !== true) {
        alertas.push({
          tipo: "sin_desglose_fiscal",
          solicitudId: s.id,
          titulo: s.titulo,
          detalle: `La cotización de ${c.proveedorNombre} no desglosa impuestos.`,
          criticidad: "alta",
        });
      }
    });

    // 3. Una sola cotización (no comparable).
    if (cotizaciones.length === 1) {
      alertas.push({
        tipo: "una_sola_cotizacion",
        solicitudId: s.id,
        titulo: s.titulo,
        detalle: "Solo hay una cotización; se necesita al menos una más para comparar.",
        criticidad: "media",
      });
    }

    // 4. Discrepancia de especificación detectada.
    if (discrepanciasPorSolicitud[s.id]) {
      alertas.push({
        tipo: "discrepancia",
        solicitudId: s.id,
        titulo: s.titulo,
        detalle: "Los proveedores ofertaron especificaciones distintas.",
        criticidad: "alta",
      });
    }
  }

  return alertas;
}