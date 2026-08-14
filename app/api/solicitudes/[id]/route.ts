import { NextResponse } from "next/server";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

const repo = new PostgresRepositorio();

export async function GET(
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
    return NextResponse.json({ solicitud, cotizaciones });
  } catch {
    return NextResponse.json({ error: "Error al obtener la solicitud" }, { status: 500 });
  }
}