import { NextResponse } from "next/server";
import { calcularMetricas } from "@/lib/domain/metrics";

export async function GET() {
  try {
    // Por simplicidad, usa la bandeja del admin (todas las solicitudes) vía un listado amplio.
    // En producción: consulta agregada. Aquí reconstruimos desde obtenerSolicitud por coordinador
    // es ineficiente; usaremos un método listarTodas en la integración 003 si hace falta.
    // Por ahora: devuelve métricas sobre las solicitudes del fixture de admin + repo.
    const solicitudes = await listarTodas();
    return NextResponse.json(calcularMetricas(solicitudes, { hoy: new Date().toISOString() }));
  } catch {
    return NextResponse.json({ error: "Error al calcular métricas" }, { status: 500 });
  }
}

async function listarTodas() {
  // Mientras no haya método listarTodas en el repo, agrega un query directo.
  const { pool } = await import("@/lib/db/pool");
  const res = await pool().query(
    "SELECT * FROM solicitud ORDER BY fecha_creacion ASC"
  );
  return res.rows.map((f) => ({
    id: String(f.id),
    numeroReferencia: f.numero_referencia ?? undefined,
    tipo: f.tipo ?? undefined,
    estado: f.estado,
    titulo: String(f.titulo),
    solicitanteEmail: String(f.solicitante_email),
    solicitanteNombre: String(f.solicitante_nombre),
    coordinadorId: f.coordinador_id ?? undefined,
    fechaCreacion: String(f.fecha_creacion),
    fechaEnvio: f.fecha_envio ? String(f.fecha_envio) : undefined,
    fechaCierre: f.fecha_cierre ? String(f.fecha_cierre) : undefined,
    clasificacionCorregida: Boolean(f.clasificacion_corregida),
    notificacionFallida: Boolean(f.notificacion_fallida),
  }));
}