import { NextResponse } from "next/server";
import { z } from "zod";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

const repo = new PostgresRepositorio();

const patchSchema = z.object({
  activo: z.boolean().optional(),
  label: z.string().min(1).optional(),
});

// Desactivar/editar un campo del catálogo.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = patchSchema.parse(await request.json());
    if (body.label !== undefined) {
      await repo.guardarCampoCatalogo({
        campoKey: id,
        label: body.label,
        tipoDato: "texto",
        origen: "assessment",
        obligatorio: false,
        orden: 100,
        activo: true,
      });
      return NextResponse.json({ ok: true });
    }
    if (body.activo !== undefined) {
      await repo.actualizarCampoCatalogo(id, { activo: body.activo });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el campo" }, { status: 500 });
  }
}