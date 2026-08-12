import { describe, it, expect } from "vitest";
import {
  bloqueoB1Activo,
  bloqueoB2Activo,
  bloqueoB3Activo,
  detectarTratamientoFiscal,
  formatoLogoValido,
  monedaValida,
} from "./rules";

describe("bloqueo B1 — obligatorios", () => {
  it("no bloquea si los obligatorios están completos", () => {
    expect(
      bloqueoB1Activo([
        { campoKey: "titulo", obligatorio: true, valor: "Algo", origen: "plantilla" },
      ])
    ).toBe(false);
  });

  it("bloquea si un obligatorio de plantilla está vacío", () => {
    expect(
      bloqueoB1Activo([
        { campoKey: "titulo", obligatorio: true, valor: "  ", origen: "plantilla" },
      ])
    ).toBe(true);
  });
});

describe("bloqueo B2 — arte de marca", () => {
  it("no bloquea sin branding", () => {
    expect(bloqueoB2Activo({ llevaBranding: false })).toBe(false);
  });
  it("bloquea con branding y sin logo", () => {
    expect(bloqueoB2Activo({ llevaBranding: true })).toBe(true);
  });
  it("no bloquea con branding y logo", () => {
    expect(bloqueoB2Activo({ llevaBranding: true, archivoLogo: "logo.svg" })).toBe(false);
  });
  it("valida formato de logo", () => {
    expect(formatoLogoValido("logo.svg")).toBe(true);
    expect(formatoLogoValido("logo.exe")).toBe(false);
  });
});

describe("bloqueo B3 — recomendación", () => {
  it("bloquea si está vacía o con espacios", () => {
    expect(bloqueoB3Activo("")).toBe(true);
    expect(bloqueoB3Activo("   ")).toBe(true);
  });
  it("no bloquea con texto", () => {
    expect(bloqueoB3Activo("Recomiendo Impresos del Valle")).toBe(false);
  });
});

describe("validación fiscal (RN-06 y detección de desglose)", () => {
  it("declara no_declarado si no se especifica tratamiento", () => {
    const r = detectarTratamientoFiscal({
      valorNeto: 100,
      montoIsv: undefined,
      valorTotal: 115,
      impuestosDesglosados: undefined,
    });
    expect(r.tratamiento).toBe("no_declarado");
    expect(r.observacion).toBeTruthy();
  });

  it("reporta inconsistencia si neto+impuesto != total", () => {
    const r = detectarTratamientoFiscal({
      valorNeto: 100,
      montoIsv: 15,
      valorTotal: 120,
      impuestosDesglosados: true,
    });
    expect(r.coherencia).toBe("inconsistente");
  });

  it("coherencia correcta si cuadran", () => {
    const r = detectarTratamientoFiscal({
      valorNeto: 100,
      montoIsv: 15,
      valorTotal: 115,
      impuestosDesglosados: true,
    });
    expect(r.coherencia).toBe("correcta");
  });
});

describe("moneda", () => {
  it("acepta HNL y USD", () => {
    expect(monedaValida("HNL")).toBe(true);
    expect(monedaValida("USD")).toBe(true);
  });
  it("rechaza monedas no soportadas", () => {
    expect(monedaValida("EUR")).toBe(false);
  });
});