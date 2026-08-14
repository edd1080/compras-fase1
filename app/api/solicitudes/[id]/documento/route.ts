import { NextResponse } from "next/server";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";
import { generarDocumento } from "@/lib/pdf/generador";

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
    const tipo = solicitud.tipo ?? "RFQ";
    const pdf = await generarDocumento({ tipo, solicitud, respuestas: {} });
    const nombre = `${solicitud.numeroReferencia ?? solicitud.id}.pdf`;
    return new NextResponse(Buffer.from(pdf.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${nombre}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Error al generar el documento" }, { status: 500 });
  }
}