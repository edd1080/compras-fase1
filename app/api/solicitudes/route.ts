import { NextResponse } from "next/server";
import { z } from "zod";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

const repo = new PostgresRepositorio();

const crearSchema = z.object({
  titulo: z.string().min(1),
  solicitanteEmail: z.string().email(),
  solicitanteNombre: z.string().min(1),
  areaSolicitante: z.string().optional(),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = crearSchema.parse(await request.json());
    const solicitud = await repo.crearSolicitud(
      {
        titulo: body.titulo,
        solicitanteEmail: body.solicitanteEmail,
        solicitanteNombre: body.solicitanteNombre,
        estado: "BORRADOR",
      },
      {
        areaSolicitante: body.areaSolicitante,
        descripcion: body.descripcion,
        categoria: body.categoria,
      }
    );
    return NextResponse.json(solicitud, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", detalles: e.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error interno al crear la solicitud" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coordinadorId = searchParams.get("coordinadorId");
    if (!coordinadorId) {
      return NextResponse.json(
        { error: "Falta coordinadorId" },
        { status: 400 }
      );
    }
    const solicitudes = await repo.listarPorCoordinador(coordinadorId);
    return NextResponse.json(solicitudes);
  } catch {
    return NextResponse.json(
      { error: "Error al listar solicitudes" },
      { status: 500 }
    );
  }
}