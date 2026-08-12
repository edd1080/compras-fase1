// Puerto del repositorio de datos — Portal de Compras BIA.
// Define lo que el dominio necesita persistir; el adaptador Postgres lo implementa.
// Esto permite migrar a Supabase Cloud con un adaptador nuevo (misma interfaz).
import type {
  Comparativa,
  Cotizacion,
  Decision,
  RespuestaCampo,
  Solicitud,
} from "@/lib/domain/types";

export type TransicionResultado = {
  solicitud: Solicitud;
  eventoId: string;
};

export interface Repositorio {
  crearSolicitud(
    datos: Pick<
      Solicitud,
      "titulo" | "solicitanteEmail" | "solicitanteNombre" | "estado"
    >,
    opciones?: { areaSolicitante?: string; descripcion?: string; tipo?: string; subtipo?: string; categoria?: string }
  ): Promise<Solicitud>;

  guardarRespuestas(solicitudId: string, respuestas: RespuestaCampo[]): Promise<void>;

  transicionarEstado(input: {
    solicitudId: string;
    hacia: Solicitud["estado"];
    actorTipo: string;
    actorIdentificador?: string;
    nota?: string;
  }): Promise<TransicionResultado>;

  listarPorCoordinador(coordinadorId: string): Promise<Solicitud[]>;

  listarPorEmail(email: string): Promise<Solicitud[]>;

  obtenerSolicitud(id: string): Promise<Solicitud | null>;

  guardarCotizacion(cotizacion: Omit<Cotizacion, "id">): Promise<Cotizacion>;

  listarCotizaciones(solicitudId: string): Promise<Cotizacion[]>;

  guardarComparativa(solicitudId: string, comparativa: Comparativa): Promise<Comparativa>;

  registrarDecision(
    decision: Omit<Decision, "id" | "fechaDecision">
  ): Promise<Decision>;

  leerConfig(clave: string): Promise<unknown>;
}