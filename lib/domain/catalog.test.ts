import { describe, it, expect } from "vitest";
import {
  campoPorKey,
  camposDelCatalogo,
  camposObligatorios,
  camposParaFormulario,
} from "./catalog";
import type { CampoCatalogo } from "./types";

const catalog: CampoCatalogo[] = [
  { campoKey: "titulo", label: "¿Qué necesitas?", tipoDato: "texto", obligatorio: true, origen: "plantilla", orden: 1, activo: true },
  { campoKey: "dimensiones", label: "Dimensiones", tipoDato: "texto", obligatorio: true, origen: "plantilla", orden: 2, activo: true },
  { campoKey: "color_acabado", label: "Color", tipoDato: "texto", obligatorio: false, origen: "assessment", orden: 3, activo: true },
  { campoKey: "oculto", label: "Inactivo", tipoDato: "texto", obligatorio: false, origen: "assessment", orden: 4, activo: false },
];

describe("catalog", () => {
  it("ordena por orden", () => {
    const c = camposDelCatalogo(catalog, {});
    expect(c.map((x) => x.campoKey)).toEqual(["titulo", "dimensiones", "color_acabado"]);
  });

  it("filtra por origen", () => {
    const plantilla = camposParaFormulario(catalog, { origen: "plantilla" });
    expect(plantilla.map((x) => x.campoKey)).toEqual(["titulo", "dimensiones"]);
  });

  it("excluye inactivos por defecto", () => {
    const c = camposParaFormulario(catalog, { incluirInactivos: false });
    expect(c.some((x) => x.campoKey === "oculto")).toBe(false);
  });

  it("devuelve solo obligatorios", () => {
    expect(camposObligatorios(catalog, {}).map((x) => x.campoKey)).toEqual([
      "titulo",
      "dimensiones",
    ]);
  });

  it("encuentra por key", () => {
    expect(campoPorKey(catalog, "dimensiones")?.label).toBe("Dimensiones");
  });
});