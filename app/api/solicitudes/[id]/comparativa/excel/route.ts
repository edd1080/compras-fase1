import { NextResponse } from "next/server";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";
import { generarExcelComparativo } from "@/lib/excel/comparativo";

const repo = new PostgresRepositorio();

// Genera y descarga el comparativo en Excel (3 hojas, doc 13 §5).
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
    if (cotizaciones.length < 2) {
      return NextResponse.json(
        { error: "Se necesitan al menos 2 cotizaciones para el comparativo" },
        { status: 400 }
      );
    }

    const { generarComparativaConIA } = await import("@/lib/domain/comparativa");
    const comparativa = await generarComparativaConIA({
      solicitudId: id,
      especificacionesSolicitadas: {},
      requerimiento: solicitud.titulo,
      cotizaciones,
      now: new Date().toISOString(),
    });

    // Persistir ruta del Excel (columna existente).
    await repo.guardarComparativa(id, comparativa);
    await repo.actualizarRutaExcel(id, `exportables/${solicitud.numeroReferencia ?? id}/comparativo.xlsx`);

    const buffer = generarExcelComparativo({
      solicitud,
      comparativa,
      cotizaciones,
    });

    const nombre = `${solicitud.numeroReferencia ?? "comparativo"}.xlsx`;
    const body = new Uint8Array(buffer);
    return new NextResponse(body as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nombre}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Error al generar el Excel" }, { status: 500 });
  }
}