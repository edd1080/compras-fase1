// Plantilla genérica declarativa de pdfme para RFI/RFQ/RFP (v6).
// Reemplazable por la oficial de Compras sin recodificar (solo cambiar esta definición).
// Estructura pdfme 6: schemas = array de páginas; cada página = array de schemas;
// cada schema usa `position: {x,y}`, `width`, `height`, `type`, `content`.

export type PlantillaPdf = {
  basePdf: { width: number; height: number; padding: [number, number, number, number]; staticSchema?: unknown[] };
  schemas: Record<string, unknown>[][];
};

function textSchema(name: string, x: number, y: number, w: number, h: number, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name,
    type: "text",
    position: { x, y },
    width: w,
    height: h,
    fontSize: 9,
    ...extra,
  };
}

function row(label: string, x: number, y: number): Record<string, unknown>[] {
  return [
    textSchema(`k_${label}`, x, y, 100, 14, { fontSize: 8, alignment: "right", fontWeight: 600, content: `${label}:` }),
    textSchema(`v_${label}`, x + 108, y, 320, 14, { fontSize: 8, content: "{{valor}}" }),
  ];
}

export function createTemplate(tipo: "RFI" | "RFQ" | "RFP"): PlantillaPdf {
  const pagina = [
    textSchema("biamark", 40, 40, 200, 20, { fontSize: 16, fontWeight: 700, content: "BIA Honduras" }),
    textSchema("doctipo", 330, 40, 225, 16, { fontSize: 11, fontWeight: 700, alignment: "right", content: `${tipo} — Portal de Compras BIA` }),
    textSchema("referencia", 330, 58, 225, 14, { fontSize: 9, alignment: "right", content: "Ref: {{referencia}}" }),
    ...row("Tipo", 40, 92),
    ...row("Área solicitante", 40, 110),
    ...row("Solicitante", 40, 128),
    ...row("Coordinador", 40, 146),
    ...row("Fecha límite", 40, 164),
    textSchema("titulo", 40, 190, 515, 18, { fontSize: 14, fontWeight: 600, content: "{{titulo}}" }),
    textSchema("descripcion", 40, 212, 515, 60, { fontSize: 9, lineHeight: 1.4, content: "{{descripcion}}" }),
    textSchema("campos", 40, 278, 515, 220, { fontSize: 9, lineHeight: 1.5, content: "{{campos}}" }),
    textSchema("secrepcion", 40, 780, 515, 12, { fontSize: 7, alignment: "right", content: "Documento generado por el Portal de Compras BIA · Confidencial" }),
  ];
  return {
    basePdf: { width: 595, height: 842, padding: [0, 0, 0, 0] },
    schemas: [pagina],
  };
}