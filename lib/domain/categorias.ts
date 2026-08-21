// Catálogo canónico de categorías — Portal de Compras BIA.
// Fuente autoritativa: migración 006 (catalogo_valor, catalogo='categoria').
// El wizard del solicitante guarda la CLAVE (no la etiqueta) para que la asignación
// por categoría a coordinadores funcione con claves canónicas homogéneas.

export const CATEGORIAS: { clave: string; etiqueta: string }[] = [
  { clave: "materia_prima", etiqueta: "Materia prima y empaque" },
  { clave: "servicios_logisticos", etiqueta: "Servicios logísticos" },
  { clave: "administrativa", etiqueta: "Compras administrativas" },
  { clave: "mercadeo_publicidad", etiqueta: "Mercadeo y publicidad" },
  { clave: "capex_indirectos", etiqueta: "CAPEX e indirectos de manufactura" },
  { clave: "tecnologia", etiqueta: "Tecnología" },
  { clave: "otra", etiqueta: "Otra" },
];

const ETIQUETA_POR_CLAVE: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.clave, c.etiqueta])
);

// Devuelve la etiqueta legible de una clave de categoría.
// Si la clave no es del catálogo (datos viejos con etiquetas libres), la devuelve tal cual.
export function nombreCategoria(clave: string | null | undefined): string {
  if (!clave) return "—";
  return ETIQUETA_POR_CLAVE[clave] ?? clave;
}