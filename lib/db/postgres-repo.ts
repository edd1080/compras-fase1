// Adaptador PostgreSQL del Repositorio — Portal de Compras BIA.
// Persistencia sobre el esquema migrado 001–006. Transición de estado + evento en la misma transacción.
import type { Pool } from "pg";
import { pool as obtenerPool } from "./pool";
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
import type {
  Repositorio,
  TransicionResultado,
} from "./repositorio";

function filaSolicitud(f: Record<string, unknown>): Solicitud {
  return {
    id: String(f.id),
    numeroReferencia: (f.numero_referencia as string) ?? undefined,
    tipo: (f.tipo as Solicitud["tipo"]) ?? undefined,
    subtipo: (f.subtipo as Solicitud["subtipo"]) ?? undefined,
    categoria: (f.categoria as string) ?? undefined,
    estado: f.estado as Solicitud["estado"],
    titulo: String(f.titulo),
    descripcion: (f.descripcion as string) ?? undefined,
    solicitanteEmail: String(f.solicitante_email),
    solicitanteNombre: String(f.solicitante_nombre),
    areaSolicitante: (f.area_solicitante as string) ?? undefined,
    coordinadorId: (f.coordinador_id as string) ?? undefined,
    fechaRequerida: f.fecha_requerida ? String(f.fecha_requerida) : undefined,
    fechaCreacion: String(f.fecha_creacion),
    fechaEnvio: f.fecha_envio ? String(f.fecha_envio) : undefined,
    fechaCierre: f.fecha_cierre ? String(f.fecha_cierre) : undefined,
    clasificacionConfianza: f.clasificacion_confianza != null ? Number(f.clasificacion_confianza) : undefined,
    clasificacionCorregida: Boolean(f.clasificacion_corregida),
    notificacionFallida: Boolean(f.notificacion_fallida),
  };
}

export class PostgresRepositorio implements Repositorio {
  constructor(private readonly pg: Pool = obtenerPool()) {}

  async crearSolicitud(
    datos: Parameters<Repositorio["crearSolicitud"]>[0],
    opciones: Parameters<Repositorio["crearSolicitud"]>[1]
  ): Promise<Solicitud> {
    const res = await this.pg.query(
      `INSERT INTO solicitud (titulo, solicitante_email, solicitante_nombre, estado,
         area_solicitante, descripcion, categoria)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        datos.titulo,
        datos.solicitanteEmail.toLowerCase(),
        datos.solicitanteNombre,
        datos.estado,
        opciones?.areaSolicitante ?? null,
        opciones?.descripcion ?? null,
        opciones?.categoria ?? null,
      ]
    );
    return filaSolicitud(res.rows[0]);
  }

  async guardarRespuestas(solicitudId: string, respuestas: RespuestaCampo[]): Promise<void> {
    for (const r of respuestas) {
      await this.pg.query(
        `INSERT INTO respuesta_campo (solicitud_id, campo_key, campo_label, valor, valor_numerico, origen)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (solicitud_id, campo_key) DO UPDATE
           SET valor = EXCLUDED.valor, valor_numerico = EXCLUDED.valor_numerico, origen = EXCLUDED.origen`,
        [solicitudId, r.campoKey, r.campoLabel, r.valor ?? null, r.valorNumerico ?? null, r.origen]
      );
    }
  }

  async transicionarEstado(
    input: Parameters<Repositorio["transicionarEstado"]>[0]
  ): Promise<TransicionResultado> {
    const client = await this.pg.connect();
    try {
      await client.query("BEGIN");
      const sel = await client.query(
        "SELECT * FROM solicitud WHERE id = $1 FOR UPDATE",
        [input.solicitudId]
      );
      if (!sel.rows[0]) throw new Error("Solicitud no encontrada");
      const actual = filaSolicitud(sel.rows[0]);

      // Reglas de transición (cerebro) — se valida contra el estado actual.
      const esTerminal = ["CERRADA_CON_DECISION", "CERRADA_SIN_DECISION", "CANCELADA"].includes(
        input.hacia
      );
      const fechaEnv = input.hacia === "ENVIADA_A_COMPRAS" && !actual.fechaEnvio
        ? new Date().toISOString()
        : actual.fechaEnvio;
      const fechaCierre = esTerminal ? new Date().toISOString() : actual.fechaCierre;

      const upd = await client.query(
        `UPDATE solicitud
         SET estado = $2,
             fecha_envio = COALESCE($3, fecha_envio),
             fecha_cierre = COALESCE($4, fecha_cierre)
         WHERE id = $1
         RETURNING *`,
        [input.solicitudId, input.hacia, fechaEnv, fechaCierre]
      );
      const evento = await client.query(
        `INSERT INTO evento_trazabilidad
           (solicitud_id, tipo_evento, estado_anterior, estado_nuevo, actor_tipo, actor_identificador, nota)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id`,
        [
          input.solicitudId,
          "cambio_estado",
          actual.estado,
          input.hacia,
          input.actorTipo,
          input.actorIdentificador ?? null,
          input.nota ?? null,
        ]
      );
      await client.query("COMMIT");
      return { solicitud: filaSolicitud(upd.rows[0]), eventoId: String(evento.rows[0].id) };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async listarCoordinadores(): Promise<Usuario[]> {
    const res = await this.pg.query(
      "SELECT id, nombre, email, rol, categorias_asignadas, activo FROM usuario WHERE rol = 'coordinador' AND activo = true"
    );
    return res.rows.map((f) => ({
      id: String(f.id),
      nombre: String(f.nombre),
      email: String(f.email),
      rol: f.rol,
      categoriasAsignadas: f.categorias_asignadas ?? [],
      activo: Boolean(f.activo),
    }));
  }

  async listarTodas(): Promise<Solicitud[]> {
    const res = await this.pg.query("SELECT * FROM solicitud ORDER BY fecha_creacion DESC");
    return res.rows.map(filaSolicitud);
  }

  async listarPorCoordinador(coordinadorId: string): Promise<Solicitud[]> {
    const res = await this.pg.query(
      "SELECT * FROM solicitud WHERE coordinador_id = $1 ORDER BY fecha_creacion DESC",
      [coordinadorId]
    );
    return res.rows.map(filaSolicitud);
  }

  async asignarCoordinador(solicitudId: string, coordinadorId: string): Promise<void> {
    await this.pg.query(
      "UPDATE solicitud SET coordinador_id = $2 WHERE id = $1",
      [solicitudId, coordinadorId]
    );
  }

  async listarPorEmail(email: string): Promise<Solicitud[]> {
    // Solicitante: solo referencia, título, estado y fechas (sin montos ni email expuesto).
    const res = await this.pg.query(
      `SELECT id, numero_referencia, titulo, estado, fecha_creacion, fecha_cierre,
              tipo, area_solicitante
       FROM solicitud WHERE solicitante_email = $1 ORDER BY fecha_creacion DESC`,
      [email.toLowerCase()]
    );
    return res.rows.map((f) => ({
      id: String(f.id),
      numeroReferencia: f.numero_referencia as string | null ?? undefined,
      titulo: String(f.titulo),
      estado: f.estado as Solicitud["estado"],
      fechaCreacion: String(f.fecha_creacion),
      fechaCierre: f.fecha_cierre ? String(f.fecha_cierre) : undefined,
      tipo: (f.tipo as Solicitud["tipo"]) ?? undefined,
      areaSolicitante: (f.area_solicitante as string) ?? undefined,
    })) as Solicitud[];
  }

  async obtenerSolicitud(id: string): Promise<Solicitud | null> {
    const res = await this.pg.query("SELECT * FROM solicitud WHERE id = $1", [id]);
    return res.rows[0] ? filaSolicitud(res.rows[0]) : null;
  }

  async guardarCotizacion(cotizacion: Omit<Cotizacion, "id">): Promise<Cotizacion> {
    const res = await this.pg.query(
      `INSERT INTO cotizacion
         (solicitud_id, proveedor_nombre, formato_original, valor_neto, moneda,
          impuestos_desglosados, monto_isv, valor_total, plazo_entrega, especificaciones_ofertadas,
          confianza_extraccion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        cotizacion.solicitudId,
        cotizacion.proveedorNombre,
        cotizacion.formatoOriginal,
        cotizacion.valorNeto ?? null,
        cotizacion.moneda ?? null,
        cotizacion.impuestosDesglosados ?? null,
        cotizacion.montoIsv ?? null,
        cotizacion.valorTotal ?? null,
        cotizacion.plazoEntrega ?? null,
        JSON.stringify(cotizacion.especificacionesOfertadas ?? {}),
        JSON.stringify(cotizacion.confianzaExtraccion ?? {}),
      ]
    );
    const f = res.rows[0];
    return {
      id: String(f.id),
      solicitudId: String(f.solicitud_id),
      proveedorNombre: String(f.proveedor_nombre),
      formatoOriginal: f.formato_original,
      valorNeto: f.valor_neto == null ? undefined : Number(f.valor_neto),
      moneda: f.moneda ?? undefined,
      impuestosDesglosados: f.impuestos_desglosados ?? undefined,
      montoIsv: f.monto_isv == null ? undefined : Number(f.monto_isv),
      valorTotal: f.valor_total == null ? undefined : Number(f.valor_total),
      plazoEntrega: f.plazo_entrega ?? undefined,
      especificacionesOfertadas: f.especificaciones_ofertadas as Record<string, string>,
      confianzaExtraccion: f.confianza_extraccion as Record<string, number>,
      editadaManualmente: Boolean(f.editada_manualmente),
      fechaCarga: String(f.fecha_carga),
    };
  }

  async actualizarCotizacion(
    id: string,
    datos: Partial<Omit<Cotizacion, "id" | "solicitudId">>
  ): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;

    const m: Record<string, keyof typeof datos> = {
      proveedor_nombre: "proveedorNombre",
      formato_original: "formatoOriginal",
      valor_neto: "valorNeto",
      moneda: "moneda",
      impuestos_desglosados: "impuestosDesglosados",
      monto_isv: "montoIsv",
      valor_total: "valorTotal",
      plazo_entrega: "plazoEntrega",
      especificaciones_ofertadas: "especificacionesOfertadas",
      confianza_extraccion: "confianzaExtraccion",
      editada_manualmente: "editadaManualmente",
      fecha_carga: "fechaCarga",
    };

    for (const [col, key] of Object.entries(m)) {
      const val = datos[key];
      if (val !== undefined) {
        sets.push(`${col} = $${i++}`);
        vals.push(typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)
          ? JSON.stringify(val)
          : val);
      }
    }

    if (sets.length === 0) return;

    vals.push(id);
    await this.pg.query(
      `UPDATE cotizacion SET ${sets.join(", ")} WHERE id = $${i}`,
      vals
    );
  }

  async listarCotizaciones(solicitudId: string): Promise<Cotizacion[]> {
    const res = await this.pg.query(
      "SELECT * FROM cotizacion WHERE solicitud_id = $1 ORDER BY fecha_carga ASC",
      [solicitudId]
    );
    return res.rows.map((f) => ({
      id: String(f.id),
      solicitudId: String(f.solicitud_id),
      proveedorNombre: String(f.proveedor_nombre),
      formatoOriginal: f.formato_original,
      valorNeto: f.valor_neto == null ? undefined : Number(f.valor_neto),
      moneda: f.moneda ?? undefined,
      impuestosDesglosados: f.impuestos_desglosados ?? undefined,
      montoIsv: f.monto_isv == null ? undefined : Number(f.monto_isv),
      valorTotal: f.valor_total == null ? undefined : Number(f.valor_total),
      plazoEntrega: f.plazo_entrega ?? undefined,
      especificacionesOfertadas: f.especificaciones_ofertadas as Record<string, string>,
      confianzaExtraccion: f.confianza_extraccion as Record<string, number>,
      editadaManualmente: Boolean(f.editada_manualmente),
      fechaCarga: String(f.fecha_carga),
    }));
  }

  async guardarComparativa(solicitudId: string, comparativa: Comparativa): Promise<Comparativa> {
    await this.pg.query(
      `INSERT INTO comparativa
         (solicitud_id, pros_contras, discrepancias_detectadas, sugerencia_ia, cotizacion_sugerida_id)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (solicitud_id) DO UPDATE
         SET pros_contras = EXCLUDED.pros_contras,
             discrepancias_detectadas = EXCLUDED.discrepancias_detectadas,
             sugerencia_ia = EXCLUDED.sugerencia_ia,
             cotizacion_sugerida_id = EXCLUDED.cotizacion_sugerida_id
       RETURNING *`,
      [
        solicitudId,
        JSON.stringify(comparativa.prosContras),
        JSON.stringify(comparativa.discrepanciasDetectadas),
        comparativa.sugerenciaIA ?? null,
        comparativa.cotizacionSugeridaId ?? null,
      ]
    );
    return comparativa;
  }

  async registrarDecision(
    decision: Parameters<Repositorio["registrarDecision"]>[0]
  ): Promise<Decision> {
    const res = await this.pg.query(
      `INSERT INTO decision
         (comparativa_id, cotizacion_seleccionada_id, decidido_por_email, ninguna_opcion, comentario)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        decision.comparativaId,
        decision.cotizacionSeleccionadaId ?? null,
        decision.decididoPorEmail,
        decision.ningunaOpcion,
        decision.comentario ?? null,
      ]
    );
    const f = res.rows[0];
    return {
      id: String(f.id),
      comparativaId: String(f.comparativa_id),
      cotizacionSeleccionadaId: f.cotizacion_seleccionada_id ?? undefined,
      decididoPorEmail: String(f.decidido_por_email),
      fechaDecision: String(f.fecha_decision),
      ningunaOpcion: Boolean(f.ninguna_opcion),
      comentario: f.comentario ?? undefined,
    };
  }

  async leerConfig(clave: string): Promise<unknown> {
    const res = await this.pg.query("SELECT valor FROM configuracion WHERE clave = $1", [clave]);
    return res.rows[0]?.valor ?? null;
  }

  async persistirDocumento(input: {
    solicitudId: string;
    tipo: string;
    rutaPdf: string;
    plantillaVersion?: number;
  }): Promise<DocumentoGenerado> {
    const res = await this.pg.query(
      `INSERT INTO documento_generado (solicitud_id, tipo, ruta_pdf, plantilla_version)
       VALUES ($1, $2, $3, $4)
       RETURNING id, solicitud_id, tipo, ruta_pdf, version, plantilla_version, fecha_generacion`,
      [input.solicitudId, input.tipo, input.rutaPdf, input.plantillaVersion ?? 1]
    );
    const f = res.rows[0];
    return {
      id: String(f.id),
      solicitudId: String(f.solicitud_id),
      tipo: f.tipo,
      rutaPdf: String(f.ruta_pdf),
      version: Number(f.version),
      plantillaVersion: Number(f.plantilla_version),
      fechaGeneracion: String(f.fecha_generacion),
    };
  }

  async registrarCorreo(input: {
    solicitudId: string;
    tipoCorreo: string;
    destinatario: string;
    asunto?: string;
    estadoEnvio: CorreoEnviado["estadoEnvio"];
    intentos?: number;
    errorDetalle?: string;
  }): Promise<CorreoEnviado> {
    const res = await this.pg.query(
      `INSERT INTO correo_enviado (solicitud_id, tipo_correo, destinatario, asunto, estado_envio, intentos, error_detalle)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, solicitud_id, tipo_correo, destinatario, asunto, estado_envio, intentos, error_detalle, fecha_envio`,
      [
        input.solicitudId,
        input.tipoCorreo,
        input.destinatario,
        input.asunto ?? null,
        input.estadoEnvio,
        input.intentos ?? 1,
        input.errorDetalle ?? null,
      ]
    );
    const f = res.rows[0];
    return {
      id: String(f.id),
      solicitudId: String(f.solicitud_id),
      tipoCorreo: String(f.tipo_correo),
      destinatario: String(f.destinatario),
      asunto: f.asunto ?? undefined,
      estadoEnvio: f.estado_envio,
      intentos: Number(f.intentos),
      errorDetalle: f.error_detalle ?? undefined,
      fechaEnvio: String(f.fecha_envio),
    };
  }
}