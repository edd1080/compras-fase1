import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generarComparativaConIA } from "./comparativa";
import type { Cotizacion } from "./types";

function cot(id: string, nombre: string, precios: { neto?: number; total?: number; desglosado?: boolean }) {
  return {
    id,
    solicitudId: "s1",
    proveedorNombre: nombre,
    formatoOriginal: "pdf" as const,
    especificacionesOfertadas: { material: "madera" },
    valorNeto: precios.neto,
    valorTotal: precios.total,
    impuestosDesglosados: precios.desglosado,
    moneda: "HNL",
    confianzaExtraccion: {},
    editadaManualmente: false,
    fechaCarga: "2026-07-21",
  } as Cotizacion;
}

const cotizaciones = [
  cot("c1", "CostaPrint", { neto: 86000, total: 98900, desglosado: true }),
  cot("c2", "PlayaPromo", { neto: 3000, total: 3150, desglosado: false }),
];

describe("generarComparativaConIA", () => {
  let prevKey: string | undefined;

  beforeEach(() => {
    prevKey = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    process.env.IA_TIMEOUT_COMPARATIVA = "500";
  });

  afterEach(() => {
    process.env.OPENROUTER_API_KEY = prevKey;
    vi.restoreAllMocks();
  });

  it("usa la sugerencia IA cuando el orquestador responde", async () => {
    vi.stubGlobal("fetch", async () => ({
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({
          discrepanciasDetectadas: [],
          prosContras: {
            CostaPrint: { pros: ["Impresión con mejor resolución"], contras: ["Más caro"] },
            PlayaPromo: { pros: ["Menor precio"], contras: ["Sin desglose fiscal"] },
          },
          sugerenciaIA: "PlayaPromo ofrece el menor total, aunque sin desglose de impuestos.",
          cotizacionSugeridaId: "c2",
          advertenciaGeneral: null,
        }) } }],
      }),
    } as Response));

    const cmp = await generarComparativaConIA({
      solicitudId: "s1",
      especificacionesSolicitadas: { material: "madera" },
      requerimiento: "Sombrillas",
      cotizaciones,
      now: "2026-07-22T10:00:00Z",
    });

    expect(cmp.cotizacionSugeridaId).toBe("c2");
    expect(cmp.sugerenciaIA).toContain("PlayaPromo");
    expect(cmp.sugerenciaIA).toContain("Generada por el sistema");
    expect(cmp.prosContras.c1.pros).toContain("Impresión con mejor resolución");
    // El fallback determinístico sigue ahí (RN-01: la IA sugiere, no decide).
    expect(cmp.analysis?.sugerencia?.cotizacionId).toBe("c2");
  });

  it("cae al motor determinístico cuando la IA falla", async () => {
    vi.stubGlobal("fetch", async () => ({ ok: false, status: 500, text: async () => "error", json: async () => ({}) } as Response));
    const cmp = await generarComparativaConIA({
      solicitudId: "s1",
      especificacionesSolicitadas: { material: "madera" },
      requerimiento: "Sombrillas",
      cotizaciones,
      now: "2026-07-22T10:00:00Z",
    });
    // Menor precio total (PlayaPromo) como antes de la IA.
    expect(cmp.cotizacionSugeridaId).toBe("c2");
    expect(cmp.sugerenciaIA).toBeTruthy();
  });

  it("hace fallback cuando no hay clave/o error general", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const cmp = await generarComparativaConIA({
      solicitudId: "s1",
      especificacionesSolicitadas: { material: "madera" },
      requerimiento: "Sombrillas",
      cotizaciones,
      now: "2026-07-22T10:00:00Z",
    });
    expect(cmp.cotizacionSugeridaId).toBe("c2");
  });
});