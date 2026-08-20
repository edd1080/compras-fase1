import { NextResponse } from "next/server";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

const repo = new PostgresRepositorio();
const CLAVES = ["umbral_dias_sin_movimiento", "expiracion_link_dias", "destinatario_alertas"] as const;

export async function GET() {
  try {
    const out: Record<string, unknown> = {};
    for (const k of CLAVES) out[k] = await repo.leerConfig(k);
    return NextResponse.json(out);
  } catch {
    return NextResponse.json({ error: "Error al leer configuración" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    for (const k of CLAVES) {
      if (body[k] !== undefined) {
        const v = typeof body[k] === "string" && (k === "umbral_dias_sin_movimiento" || k === "expiracion_link_dias")
          ? Number(body[k])
          : body[k];
        if (!(k === "umbral_dias_sin_movimiento" || k === "expiracion_link_dias") || Number.isFinite(Number(v))) {
          await repo.guardarConfig(k, v);
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la configuración" }, { status: 500 });
  }
}
