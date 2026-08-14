// Cliente de API tipado para el frontend — Portal de Compras BIA.
// Reemplaza el uso de fixtures en runtime; delgado, sobre fetch.
import type {
  Comparativa,
  Cotizacion,
  Decision,
  EstadoSolicitud,
  Solicitud,
} from "@/lib/domain/types";
import type { MetricasDashboard as Metricas } from "@/lib/domain/metrics";

export type SalidaCorta = Pick<
  Solicitud,
  "id" | "numeroReferencia" | "titulo" | "estado" | "fechaCreacion" | "fechaCierre"
>;

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  crearSolicitud(payload: {
    titulo: string;
    solicitanteEmail: string;
    solicitanteNombre: string;
    areaSolicitante?: string;
    descripcion?: string;
    categoria?: string;
  }): Promise<Solicitud> {
    return fetch("/api/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => json<Solicitud>(r));
  },

  transicionar(payload: {
    solicitudId: string;
    hacia: EstadoSolicitud;
    actorTipo: string;
    actorIdentificador?: string;
    nota?: string;
    respuestas?: Record<string, string>;
    coordenadorNombre?: string;
  }): Promise<{ solicitud: Solicitud; eventoId: string; pipeline?: unknown }> {
    return fetch(`/api/solicitudes/${payload.solicitudId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => json(r));
  },

  listarSolicitudes(coordinadorId: string): Promise<Solicitud[]> {
    return fetch(`/api/solicitudes?coordinadorId=${encodeURIComponent(coordinadorId)}`).then(
      (r) => json<Solicitud[]>(r)
    );
  },

  listarSolicitudesTodas(): Promise<Solicitud[]> {
    return fetch("/api/solicitudes?coordinadorId=all").then((r) => json<Solicitud[]>(r));
  },

  obtenerSolicitud(id: string): Promise<Solicitud> {
    return fetch(`/api/solicitudes/${encodeURIComponent(id)}`).then((r) => json<Solicitud>(r));
  },

  listarCotizaciones(solicitudId: string): Promise<Cotizacion[]> {
    return fetch(`/api/solicitudes/${encodeURIComponent(solicitudId)}/cotizaciones`).then(
      (r) => json<Cotizacion[]>(r)
    );
  },

  misSolicitudes(email: string): Promise<SalidaCorta[]> {
    return fetch(`/api/solicitudes/mis-solicitudes?email=${encodeURIComponent(email)}`).then(
      (r) => json<SalidaCorta[]>(r)
    );
  },

  cargarCotizacion(payload: {
    solicitudId: string;
    proveedorNombre: string;
    formatoOriginal: Cotizacion["formatoOriginal"];
    valorNeto?: number | null;
    moneda?: string;
    impuestosDesglosados?: boolean | null;
    montoIsv?: number | null;
    valorTotal?: number | null;
    plazoEntrega?: string;
    especificacionesOfertadas?: Record<string, string>;
  }): Promise<Cotizacion> {
    return fetch(`/api/solicitudes/${payload.solicitudId}/cotizaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => json<Cotizacion>(r));
  },

  generarComparativa(solicitudId: string): Promise<Comparativa> {
    return fetch(`/api/solicitudes/${solicitudId}/comparativa`, { method: "POST" }).then(
      (r) => json<Comparativa>(r)
    );
  },

  registrarDecision(payload: {
    comparativaId: string;
    cotizacionSeleccionadaId?: string;
    decididoPorEmail: string;
    ningunaOpcion: boolean;
    comentario?: string;
  }): Promise<Decision> {
    return fetch(`/api/comparativas/${payload.comparativaId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => json<Decision>(r));
  },

  metricas(): Promise<Metricas> {
    return fetch("/api/metricas").then((r) => json<Metricas>(r));
  },
};