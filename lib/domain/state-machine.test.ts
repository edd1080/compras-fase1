import { describe, it, expect } from "vitest";
import {
  aplicarTransicion,
  esTransicionValida,
  transicionesDesde,
} from "./state-machine";
import type { Solicitud } from "./types";

function baseSolicitud(overrides: Partial<Solicitud> = {}): Solicitud {
  return {
    id: "s1",
    estado: "BORRADOR",
    titulo: "Sombrillas brandeadas",
    solicitanteEmail: "a@bia.hn",
    solicitanteNombre: "María",
    clasificacionCorregida: false,
    notificacionFallida: false,
    fechaCreacion: "2026-07-20T10:00:00Z",
    ...overrides,
  };
}

describe("state-machine", () => {
  it("acepta BORRADOR → ENVIADA_A_COMPRAS", () => {
    expect(esTransicionValida("BORRADOR", "ENVIADA_A_COMPRAS")).toBe(true);
  });

  it("rechaza BORRADOR → CANCELADA y EN_COTIZACION → ENVIADA directo", () => {
    expect(esTransicionValida("BORRADOR", "CERRADA_CON_DECISION")).toBe(false);
    expect(esTransicionValida("EN_COTIZACION", "ENVIADA_A_SOLICITANTE")).toBe(false);
  });

  it("devuelve las transiciones desde un estado", () => {
    expect(transicionesDesde("BORRADOR")).toEqual(["ENVIADA_A_COMPRAS", "CANCELADA"]);
  });

  it("aplica una transición válida y escribe evento + fechaEnvio", () => {
    const res = aplicarTransicion(baseSolicitud(), "ENVIADA_A_COMPRAS", {
      actorTipo: "solicitante",
      now: "2026-07-21T12:00:00Z",
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.solicitud.estado).toBe("ENVIADA_A_COMPRAS");
    expect(res.solicitud.fechaEnvio).toBe("2026-07-21T12:00:00Z");
    expect(res.evento.estadoAnterior).toBe("BORRADOR");
    expect(res.evento.estadoNuevo).toBe("ENVIADA_A_COMPRAS");
  });

  it("fija fechaCierre al entrar a un estado terminal", () => {
    const res = aplicarTransicion(
      baseSolicitud({ estado: "ENVIADA_A_SOLICITANTE" }),
      "CERRADA_CON_DECISION",
      { now: "2026-07-25T09:00:00Z" }
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.solicitud.fechaCierre).toBe("2026-07-25T09:00:00Z");
  });

  it("no muta el estado en una transición inválida", () => {
    const res = aplicarTransicion(baseSolicitud(), "CERRADA_CON_DECISION");
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("inválida");
  });
});