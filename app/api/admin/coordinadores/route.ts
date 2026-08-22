import { NextResponse } from "next/server";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

const repo = new PostgresRepositorio();

// GET: lista real de coordinadores (id + nombre + email) para filtros y tablas del panel admin.
// La autorización la aplica el middleware en /api/admin/*.
export async function GET() {
  try {
    const coordinadores = await repo.listarCoordinadores();
    return NextResponse.json(
      coordinadores.map((c) => ({ id: c.id, nombre: c.nombre, email: c.email }))
    );
  } catch {
    return NextResponse.json({ error: "Error al listar coordinadores" }, { status: 500 });
  }
}
