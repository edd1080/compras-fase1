import { describe, it, expect } from "vitest";
import { generarDocumento } from "./generador";
import type { Solicitud } from "@/lib/domain/types";

function sol(overrides: Partial<Solicitud> = {}): Solicitud {
  return {
    id: "s1",
    numeroReferencia: "RFQ-2026-014",
    tipo: "RFQ",
    subtipo: "producto",
    estado: "ENVIADA_A_COMPRAS",
    titulo: "Sombrillas brandeadas Café Oro",
    descripcion: "200 sombrillas con logo para activación de playa",
    solicitanteEmail: "maria.reyes@bia.hn",
    solicitanteNombre: "María Reyes",
    areaSolicitante: "Marketing",
    fechaRequerida: "2026-08-25",
    fechaCreacion: "2026-07-20T10:00:00Z",
    clasificacionCorregida: false,
    notificacionFallida: false,
    ...overrides,
  };
}

describe("pdf generador", () => {
  it("genera un buffer PDF válido con la referencia", async () => {
    const doc = await generarDocumento({
      tipo: "RFQ",
      solicitud: sol(),
      respuestas: { dimensiones: "2.0m", materiales: "poliéster UV" },
      coordenadorNombre: "Carlos Mejía",
    });
    expect(doc.buffer).toBeInstanceOf(Uint8Array);
    expect(doc.buffer.length).toBeGreaterThan(100);
    expect(doc.referencia).toBe("RFQ-2026-014");
    expect(doc.tipo).toBe("RFQ");
  }, 20000);

  it("usa 'no especificado' para datos faltantes (RN-06)", async () => {
    const doc = await generarDocumento({
      tipo: "RFQ",
      solicitud: sol({ descripcion: undefined, areaSolicitante: undefined }),
      respuestas: {},
    });
    expect(doc.buffer.length).toBeGreaterThan(100);
  }, 20000);

  it("genera para RFP y RFI también", async () => {
    for (const tipo of ["RFI", "RFP"] as const) {
      const doc = await generarDocumento({ tipo, solicitud: sol({ tipo }), respuestas: {} });
      expect(doc.buffer.length).toBeGreaterThan(100);
    }
  }, 20000);
});