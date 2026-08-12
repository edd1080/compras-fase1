// Catálogo de campos — formulario dinámico — Portal de Compras BIA
// Fuente: doc 14 (catálogo de campos). ADR 0006: el catálogo es la única fuente de verdad.
// Sin dependencias. La UI genera formularios/PDF desde aquí.
import type {
  CampoCatalogo,
  OrigenCampo,
  SubtipoSolicitud,
  TipoSolicitud,
} from "./types";

export function camposParaFormulario(
  catalog: CampoCatalogo[],
  opts: {
    origen?: OrigenCampo | OrigenCampo[];
    tipo?: TipoSolicitud;
    subtipo?: SubtipoSolicitud;
    incluirInactivos?: boolean;
  }
): CampoCatalogo[] {
  const origenes = opts.origen === undefined
    ? ["plantilla", "assessment"]
    : Array.isArray(opts.origen)
      ? opts.origen
      : [opts.origen];

  return catalog
    .filter((c) => {
      if (!opts.incluirInactivos && !c.activo) return false;
      if (!origenes.includes(c.origen)) return false;
      return true;
    })
    .sort((a, b) => a.orden - b.orden);
}

export function camposDelCatalogo(
  catalog: CampoCatalogo[],
  soporte: { tipo?: TipoSolicitud; subtipo?: SubtipoSolicitud }
): CampoCatalogo[] {
  return camposParaFormulario(catalog, {
    tipo: soporte.tipo,
    subtipo: soporte.subtipo,
  });
}

export function camposObligatorios(
  catalog: CampoCatalogo[],
  soporte: { tipo?: TipoSolicitud; subtipo?: SubtipoSolicitud }
): CampoCatalogo[] {
  return camposDelCatalogo(catalog, soporte).filter((c) => c.obligatorio);
}

export function campoPorKey(
  catalog: CampoCatalogo[],
  campoKey: string
): CampoCatalogo | undefined {
  return catalog.find((c) => c.campoKey === campoKey);
}