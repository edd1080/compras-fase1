import { NextResponse } from "next/server";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";
import { construirComparativa } from "@/lib/domain/comparativa";

const repo = new PostgresRepositorio();

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const solicitud = await repo.obtenerSolicitud(id);
    if (!solicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    const cotizaciones = await repo.listarCotizaciones(id);
    if (cotizaciones.length < 2) {
      return NextResponse.json(
        { error: "Se necesitan al menos 2 cotizaciones para generar la comparativa" },
        { status: 400 }
      );
    }

    const comparativa = construirComparativa({
      solicitudId: id,
      especificacionesSolicitadas: {},
      requerimiento: solicitud.titulo,
      cotizaciones,
      now: new Date().toISOString(),
    });
    const guardada = await repo.guardarComparativa(id, comparativa);
    // Transición a COMPARATIVA_LISTA
    if (solicitud.estado === "EN_COTIZACION") {
      await repo.transicionarEstado({
        solicitudId: id,
        hacia: "COMPARATIVA_LISTA",
        actorTipo: "coordinador",
      });
    }
    return NextResponse.json(guardada);
  } catch {
    return NextResponse.json({ error: "Error al generar la comparativa" }, { status: 500 });
  }
}