// Reglas de negocio y bloqueos duros — Portal de Compras BIA
// Fuente: PRD §7-8 (RN-01…08, B1/B2/B3). Funciones puras sin dependencias.
import type { Cotizacion } from "./types";

// ---------- B1 — Campo obligatorio de plantilla vacío ----------
export type CampoConValor = {
  campoKey: string;
  obligatorio: boolean;
  valor?: string;
  origen: "plantilla" | "assessment";
};

export function camposObligatoriosFaltantes(
  campos: CampoConValor[],
  origen: "plantilla" | "assessment"
): string[] {
  return campos
    .filter(
      (c) =>
        c.origen === origen &&
        c.obligatorio &&
        (c.valor === undefined || c.valor === null || c.valor.trim() === "")
    )
    .map((c) => c.campoKey);
}

export function bloqueoB1Activo(campos: CampoConValor[]): boolean {
  return camposObligatoriosFaltantes(campos, "plantilla").length > 0;
}

// ---------- B2 — Producto con marca sin arte oficial ----------
export function bloqueoB2Activo(opts: {
  llevaBranding?: boolean;
  archivoLogo?: string;
}): boolean {
  if (!opts.llevaBranding) return false;
  const arte = opts.archivoLogo?.trim() ?? "";
  return arte.length === 0;
}

export const FORMATOS_LOGO = ["png", "jpg", "pdf", "svg", "ai", "eps"];

export function formatoLogoValido(nombre: string): boolean {
  const ext = nombre.split(".").pop()?.toLowerCase() ?? "";
  return FORMATOS_LOGO.includes(ext);
}

// ---------- B3 — Recomendación del coordinador vacía ----------
export function bloqueoB3Activo(recomendacion?: string): boolean {
  return (recomendacion ?? "").trim().length === 0;
}

// ---------- Reglas de comparativa ----------
export const MONEDAS_SOPORTADAS = ["HNL", "USD"] as const;

export function monedaValida(moneda: string | undefined): boolean {
  if (!moneda) return false;
  return (MONEDAS_SOPORTADAS as readonly string[]).includes(moneda);
}

export type TratamientoFiscal = "incluye" | "no_incluye" | "no_declarado";

export function detectarTratamientoFiscal(
  cotizacion: Pick<
    Cotizacion,
    | "valorNeto"
    | "montoIsv"
    | "montoOtrosImpuestos"
    | "valorTotal"
    | "impuestosDesglosados"
  >
): {
  tratamiento: TratamientoFiscal;
  coherencia: "correcta" | "inconsistente" | "no_verificable";
  observacion: string | null;
  requiere_aclaracion: boolean;
} {
  const { valorNeto, montoIsv, valorTotal, impuestosDesglosados } = cotizacion;

  if (impuestosDesglosados === true && typeof valorNeto === "number" && typeof montoIsv === "number") {
    const totalCalculado = valorNeto + montoIsv + (cotizacion.montoOtrosImpuestos ?? 0);
    const coherencia =
      typeof valorTotal === "number" && Math.abs(totalCalculado - valorTotal) > 0.01
        ? "inconsistente"
        : "correcta";
    return {
      tratamiento: "incluye",
      coherencia,
      observacion:
        coherencia === "inconsistente"
          ? "Los montos de esta cotización no cuadran entre sí."
          : null,
      requiere_aclaracion: coherencia === "inconsistente",
    };
  }

  if (impuestosDesglosados === false) {
    return {
      tratamiento: "no_incluye",
      coherencia: "no_verificable",
      observacion:
        "El precio no desglosa impuestos; se recomienda pedir aclaración antes de comparar.",
      requiere_aclaracion: true,
    };
  }

  return {
    tratamiento: "no_declarado",
    coherencia: "no_verificable",
    observacion:
      "No se especifica si el precio incluye el impuesto sobre ventas; se recomienda pedir aclaración.",
    requiere_aclaracion: true,
  };
}

// ---------- RN-06 — nunca inventar cifras ----------
export function valorAusenteEsNulo(valor: number | undefined | null): boolean {
  return valor === null || valor === undefined;
}

export function formatearMontoNoEspecificado(valor: number | undefined): string {
  return typeof valor === "number" ? valor.toFixed(2) : "no especificado";
}

// ---------- Asignación de coordinador (Q1, configurable) ----------
export function asignarCoordinadorPorCategoria(opts: {
  categoria?: string;
  coordinadoresPorCategoria: Record<string, string>;
  respaldoId: string;
}): string {
  const { categoria, coordinadoresPorCategoria, respaldoId } = opts;
  return categoria && coordinadoresPorCategoria[categoria]
    ? coordinadoresPorCategoria[categoria]
    : respaldoId;
}