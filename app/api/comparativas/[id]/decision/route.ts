import { NextResponse } from "next/server";
import { z } from "zod";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

const repo = new PostgresRepositorio();

const schema = z.object({
  cotizacionSeleccionadaId: z.string().optional(),
  decididoPorEmail: z.string().email(),
  ningunaOpcion: z.boolean().default(false),
  comentario: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = schema.parse(await request.json());
    const decision = await repo.registrarDecision({
      comparativaId: id,
      cotizacionSeleccionadaId: body.ningunaOpcion ? undefined : body.cotizacionSeleccionadaId,
      decididoPorEmail: body.decididoPorEmail,
      ningunaOpcion: body.ningunaOpcion,
      comentario: body.comentario,
    });
    return NextResponse.json(decision, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", detalles: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al registrar la decisión" }, { status: 500 });
  }
}