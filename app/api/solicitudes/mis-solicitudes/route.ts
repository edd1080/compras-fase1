import { NextResponse } from "next/server";
import { z } from "zod";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

const repo = new PostgresRepositorio();
const schema = z.object({ email: z.string().email() });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { email } = schema.parse({ email: searchParams.get("email") });
    const solicitudes = await repo.listarPorEmail(email);
    // Solo referencia/título/estado/fechas — nunca montos ni cotizaciones (RN-06, user-flows C-).
    return NextResponse.json(solicitudes);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al consultar" }, { status: 500 });
  }
}