import { describe, it, expect } from "vitest";
import { detectarAlertas } from "./alertas";
import type { Cotizacion, Solicitud } from "./types";

function sol(id: string, estado: Solicitud["estado"], dias: number): Solicitud {
  return {
    id,
    titulo: `Solicitud ${id}`,
    estado,
    solicitanteEmail: "x@bia.hn",
    solicitanteNombre: "X",
    fechaCreacion: new Date(Date.now() - dias * 86400000).toISOString(),
    clasificacionCorregida: false,
    notificacionFallida: false,
  };
}

function cot(id: string, proveedor: string, valorTotal?: number, desglosado?: boolean): Cotizacion {
  return {
    id,
    solicitudId: "s",
    proveedorNombre: proveedor,
    formatoOriginal: "manual",
    valorTotal,
    impuestosDesglosados: desglosado,
    especificacionesOfertadas: {},
    confianzaExtraccion: {},
    editadaManualmente: false,
    fechaCarga: "2026-08-18",
  };
}

describe("detectarAlertas", () => {
  it("alerta por inactividad cuando supera el umbral y no ha avanzado", () => {
    const alertas = detectarAlertas({
      solicitudes: [sol("s1", "ENVIADA_A_COMPRAS", 15)],
      cotizacionesPorSolicitud: { s1: [] },
      umbralDias: 5,
    });
    expect(alertas.some((a) => a.tipo === "inactividad")).toBe(true);
  });

  it("no alerta inactividad si hubo avance (fechaEnvio) o terminal", () => {
    const s = sol("s1", "CERRADA_CON_DECISION", 20);
    const alertas = detectarAlertas({ solicitudes: [s], cotizacionesPorSolicitud: { s1: [] }, umbralDias: 5 });
    expect(alertas.filter((a) => a.tipo === "inactividad")).toHaveLength(0);
  });

  it("alerta sin desglose fiscal cuando hay monto y no desglosa", () => {
    const alertas = detectarAlertas({
      solicitudes: [sol("s1", "EN_COTIZACION", 1)],
      cotizacionesPorSolicitud: { s1: [cot("c1", "Proveedor A", 100, false)] },
    });
    expect(alertas.some((a) => a.tipo === "sin_desglose_fiscal")).toBe(true);
  });

  it("alerta una sola cotización para comparar", () => {
    const alertas = detectarAlertas({
      solicitudes: [sol("s1", "COMPARATIVA_LISTA", 1)],
      cotizacionesPorSolicitud: { s1: [cot("c1", "A", 100, true)] },
    });
    expect(alertas.some((a) => a.tipo === "una_sola_cotizacion")).toBe(true);
  });

  it("alerta discrepancia cuando el mapa lo indica", () => {
    const alertas = detectarAlertas({
      solicitudes: [sol("s1", "COMPARATIVA_LISTA", 1)],
      cotizacionesPorSolicitud: { s1: [] },
      discrepanciasPorSolicitud: { s1: true },
    });
    expect(alertas.some((a) => a.tipo === "discrepancia")).toBe(true);
  });
});