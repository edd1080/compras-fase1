import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { clasificar, assessment, extraerCotizacion, comparativa } from "./orchestrator";

function mockOpenRouterResponde(contenido: unknown, status = 200) {
  return vi.fn(async (_url: string, init?: RequestInit) => {
    await new Promise((r) => setTimeout(r, 1));
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => (status >= 200 && status < 300 ? "" : JSON.stringify({ error: "boom" })),
      json: async () => ({ choices: [{ message: { content: JSON.stringify(contenido) } }] }),
    } as Response;
  });
}

describe("Orquestador IA", () => {
  let prevKey: string | undefined;
  let prevModel: string | undefined;

  beforeEach(() => {
    prevKey = process.env.OPENROUTER_API_KEY;
    prevModel = process.env.IA_MODEL;
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    process.env.IA_TIMEOUT_CLASIFICAR = "500";
  });

  afterEach(() => {
    process.env.OPENROUTER_API_KEY = prevKey;
    process.env.IA_MODEL = prevModel;
    vi.restoreAllMocks();
  });

  it("clasificar devuelve salida tipada con JSON válido", async () => {
    vi.stubGlobal("fetch", mockOpenRouterResponde({
      tipo: "RFQ",
      subtipo: "producto",
      confianza: 0.92,
      razonamientoBreve: "Producto estándar con precio definido.",
    }));
    const res = await clasificar({ titulo: "Camisetas", descripcion: "5000 unidades", categoria: "empaque" });
    expect(res?.tipo).toBe("RFQ");
    expect(res?.subtipo).toBe("producto");
    expect(res?.confianza).toBeCloseTo(0.92);
  });

  it("clasificar devuelve null si la salida no es JSON válido", async () => {
    vi.stubGlobal("fetch", mockOpenRouterResponde("esto no es json"));
    const res = await clasificar({ titulo: "x", descripcion: "", categoria: "" });
    expect(res).toBeNull();
  });

  it("intenta el modelo fallback si el principal falla", async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(async () => {
        return { ok: false, status: 500, text: async () => "error", json: async () => ({}) } as Response;
      })
      .mockImplementationOnce(mockOpenRouterResponde({
        tipo: "RFP",
        subtipo: "servicio",
        confianza: 0.8,
        razonamientoBreve: "Servicio a medida.",
      }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await clasificar({ titulo: "Auditoría", descripcion: "", categoria: "" });
    expect(res?.tipo).toBe("RFP");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("assessment filtra campoKey fuera del catálogo", async () => {
    vi.stubGlobal("fetch", mockOpenRouterResponde({
      preguntas: [
        { campoKey: "material", pregunta: "¿Material?", porQue: "Para cotizar", critica: false },
        { campoKey: "inventado_fuera", pregunta: "¿?", porQue: "?", critica: false },
      ],
      contextoInvestigado: "test",
      sinPreguntasPendientes: false,
    }));
    const res = await assessment({
      tipo: "RFQ",
      subtipo: "producto",
      categoria: "materia_prima",
      camposCapturados: {},
      catalogo: [{
        campoKey: "material", label: "Material", tipoDato: "texto", obligatorio: false,
        origen: "assessment", orden: 1, activo: true,
      }],
    });
    expect(res?.preguntas.map((p) => p.campoKey)).toEqual(["material"]);
  });

  it("extraerCotizacion extrae los campos con confianza", async () => {
    vi.stubGlobal("fetch", mockOpenRouterResponde({
      proveedorNombre: "CostaPrint",
      valorNeto: 86000,
      moneda: "HNL",
      impuestosDesglosados: true,
      montoIsv: 12900,
      valorTotal: 98900,
      plazoEntrega: "12 días",
      especificacionesOfertadas: { material: "poliéster" },
      ilegible: false,
      confianzaPorCampo: { valorNeto: 0.95, valorTotal: 0.94 },
    }));
    const res = await extraerCotizacion({
      markdown: "Cotización 1",
      especificacionesSolicitadas: {},
    });
    expect(res?.proveedorNombre).toBe("CostaPrint");
    expect(res?.valorTotal).toBe(98900);
    expect(res?.confianzaPorCampo.valorNeto).toBeGreaterThan(0.5);
  });

  it("comparativa devuelve sugerencia razonada", async () => {
    vi.stubGlobal("fetch", mockOpenRouterResponde({
      discrepanciasDetectadas: [],
      prosContras: {},
      sugerenciaIA: "CostaPrint ofrece el menor total.",
      cotizacionSugeridaId: "c1",
      advertenciaGeneral: null,
    }));
    const res = await comparativa({
      tituloSolicitud: "Sombrillas",
      especificacionesSolicitadas: {},
      cotizaciones: [
        { proveedorNombre: "CostaPrint", valorNeto: 86000, moneda: "HNL", montoIsv: null, valorTotal: 98900, plazoEntrega: "12 días", especificacionesOfertadas: {} },
        { proveedorNombre: "PlayaPromo", valorNeto: 3150, moneda: "USD", montoIsv: null, valorTotal: 3150, plazoEntrega: "10 días", especificacionesOfertadas: {} },
      ],
    });
    expect(res?.cotizacionSugeridaId).toBe("c1");
    expect(res?.sugerenciaIA).toContain("CostaPrint");
  });

  it("devuelve null sin excepción cuando la clave no está", async () => {
    delete process.env.OPENROUTER_API_KEY;
    await expect(clasificar({ titulo: "x", descripcion: "", categoria: "" })).resolves.toBeNull();
  });
});