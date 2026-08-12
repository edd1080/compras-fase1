import { NextResponse } from "next/server";
import { z } from "zod";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";
import { esTransicionValida } from "@/lib/domain/state-machine";

const repo = new PostgresRepositorio();

const schema = z.object({
  hacia: z.enum([
    "BORRADOR",
    "ENVIADA_A_COMPRAS",
    "EN_COTIZACION",
    "COMPARATIVA_LISTA",
    "ENVIADA_A_SOLICITANTE",
    "CERRADA_CON_DECISION",
    "CERRADA_SIN_DECISION",
    "CANCELADA",
  ]),
  actorTipo: z.enum(["solicitante", "coordinador", "admin", "sistema"]),
  actorIdentificador: z.string().optional(),
  nota: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = schema.parse(await request.json());

    const solicitud = await repo.obtenerSolicitud(id);
    if (!solicitud) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }
    if (!esTransicionValida(solicitud.estado, body.hacia)) {
      return NextResponse.json(
        {
          error: `Transición inválida: ${solicitud.estado} → ${body.hacia}`,
          estadoActual: solicitud.estado,
        },
        { status: 409 }
      );
    }

    const res = await repo.transicionarEstado({
      solicitudId: id,
      hacia: body.hacia,
      actorTipo: body.actorTipo,
      actorIdentificador: body.actorIdentificador,
      nota: body.nota,
    });
    return NextResponse.json(res);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", detalles: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno en la transición" }, { status: 500 });
  }
}