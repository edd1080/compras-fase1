import { NextResponse } from "next/server";
import { z } from "zod";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

const repo = new PostgresRepositorio();

const createSchema = z.object({
  campoKey: z.string().min(1).regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y guión bajo"),
  label: z.string().min(1),
  ayuda: z.string().optional(),
  tipoDato: z.enum(["texto", "texto_largo", "numero", "fecha", "seleccion", "seleccion_multiple", "booleano", "archivo", "moneda"]),
  catalogoOpciones: z.string().optional(),
  obligatorio: z.boolean().default(false),
  origen: z.enum(["plantilla", "assessment"]),
  seccionPdf: z.string().optional(),
  orden: z.number().default(100),
});

export async function GET() {
  try {
    const campos = await repo.listarCampoCatalogo(true);
    return NextResponse.json(campos);
  } catch {
    return NextResponse.json({ error: "Error al listar campos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());
    await repo.guardarCampoCatalogo({ ...body, activo: true });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", detalles: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo crear el campo" }, { status: 500 });
  }
}