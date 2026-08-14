// Puerto del repositorio de datos — Portal de Compras BIA.
// Define lo que el dominio necesita persistir; el adaptador Postgres lo implementa.
// Esto permite migrar a Supabase Cloud con un adaptador nuevo (misma interfaz).
import type {
  Comparativa,
  CorreoEnviado,
  Cotizacion,
  Decision,
  DocumentoGenerado,
  RespuestaCampo,
  Solicitud,
  Usuario,
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

  listarCoordinadores(): Promise<Usuario[]>;

  listarPorCoordinador(coordinadorId: string): Promise<Solicitud[]>;

  listarTodas(): Promise<Solicitud[]>;

  asignarCoordinador(solicitudId: string, coordinadorId: string): Promise<void>;

  listarPorEmail(email: string): Promise<Solicitud[]>;

  obtenerSolicitud(id: string): Promise<Solicitud | null>;

  guardarCotizacion(cotizacion: Omit<Cotizacion, "id">): Promise<Cotizacion>;

  listarCotizaciones(solicitudId: string): Promise<Cotizacion[]>;

  guardarComparativa(solicitudId: string, comparativa: Comparativa): Promise<Comparativa>;

  registrarDecision(
    decision: Omit<Decision, "id" | "fechaDecision">
  ): Promise<Decision>;

  persistirDocumento(input: {
    solicitudId: string;
    tipo: string;
    rutaPdf: string;
    plantillaVersion?: number;
  }): Promise<DocumentoGenerado>;

  registrarCorreo(input: {
    solicitudId: string;
    tipoCorreo: string;
    destinatario: string;
    asunto?: string;
    estadoEnvio: CorreoEnviado["estadoEnvio"];
    intentos?: number;
    errorDetalle?: string;
  }): Promise<CorreoEnviado>;

  leerConfig(clave: string): Promise<unknown>;
}