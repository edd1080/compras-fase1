import { describe, it, expect } from "vitest";
import { assessment_requerimiento } from "./assessment";
import type { CampoCatalogo } from "./types";

const catalogo: CampoCatalogo[] = [
  { campoKey: "dimensiones", label: "Dimensiones", tipoDato: "texto", obligatorio: true, origen: "assessment", orden: 1, activo: true },
  { campoKey: "materiales", label: "Materiales", tipoDato: "texto", obligatorio: true, origen: "assessment", orden: 2, activo: true },
  { campoKey: "color_acabado", label: "Color y acabado", tipoDato: "texto", obligatorio: false, origen: "assessment", orden: 3, activo: true },
  { campoKey: "archivo_logo", label: "Archivo del logo", tipoDato: "archivo", obligatorio: false, origen: "assessment", orden: 4, activo: true, validacion: { dependeDe: "lleva_branding", bloqueante: true } },
];

function capturados(keys: string[]) {
  return keys.map((campoKey) => ({ campoKey }));
}

describe("assessment_requerimiento", () => {
  it("pide solo campos faltantes del catálogo", () => {
    const r = assessment_requerimiento({
      camposCapturados: capturados(["dimensiones"]),
      camposDisponiblesCatalogo: catalogo,
    });
    const keys = r.preguntas.map((p) => p.campoKey);
    expect(keys).toContain("materiales");
    expect(keys).not.toContain("dimensiones");
    expect(keys.every((k) => catalogo.some((c) => c.campoKey === k))).toBe(true);
  });

  it("respeta el límite de 6 preguntas", () => {
    const grande: CampoCatalogo[] = Array.from({ length: 20 }, (_, i) => ({
      campoKey: `campo_${i}`,
      label: `Campo ${i}`,
      tipoDato: "texto" as const,
      obligatorio: false,
      origen: "assessment" as const,
      orden: i,
      activo: true,
    }));
    const r = assessment_requerimiento({
      camposCapturados: [],
      camposDisponiblesCatalogo: grande,
    });
    expect(r.preguntas.length).toBeLessThanOrEqual(6);
  });

  it("no devuelve preguntas si no falta nada", () => {
    const r = assessment_requerimiento({
      camposCapturados: capturados(["dimensiones", "materiales", "color_acabado", "archivo_logo"]),
      camposDisponiblesCatalogo: catalogo,
    });
    // archivo_logo solo es crítico con branding; sin branding no se pide por regla.
    expect(r.sin_preguntas_pendientes).toBe(true);
  });

  it("marca crítico el logo cuando hay branding sin archivo (B2)", () => {
    const r = assessment_requerimiento({
      camposCapturados: capturados(["dimensiones", "materiales"]),
      camposDisponiblesCatalogo: catalogo,
      llevaBranding: true,
    });
    const logo = r.preguntas.find((p) => p.campoKey === "archivo_logo");
    expect(logo?.critica).toBe(true);
  });

  it("descarta campos no existentes en el catálogo (validación dura)", () => {
    const r = assessment_requerimiento({
      camposCapturados: capturados(["campo_inventado"]),
      camposDisponiblesCatalogo: catalogo,
    });
    const keys = r.preguntas.map((p) => p.campoKey);
    expect(keys.every((k) => catalogo.some((c) => c.campoKey === k))).toBe(true);
  });
});