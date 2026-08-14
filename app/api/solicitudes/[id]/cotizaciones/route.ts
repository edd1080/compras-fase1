import { NextResponse } from "next/server";
import { z } from "zod";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

const repo = new PostgresRepositorio();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cotizaciones = await repo.listarCotizaciones(id);
    return NextResponse.json(cotizaciones);
  } catch {
    return NextResponse.json({ error: "Error al listar cotizaciones" }, { status: 500 });
  }
}

const schema = z.object({
  proveedorNombre: z.string().min(1),
  formatoOriginal: z.enum(["pdf", "docx", "imagen", "manual"]),
  valorNeto: z.number().nullable().optional(),
  moneda: z.string().optional(),
  impuestosDesglosados: z.boolean().nullable().optional(),
  montoIsv: z.number().nullable().optional(),
  valorTotal: z.number().nullable().optional(),
  plazoEntrega: z.string().optional(),
  especificacionesOfertadas: z.record(z.string(), z.string()).default({}),
  confianzaExtraccion: z.record(z.string(), z.number()).default({}),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = schema.parse(await request.json());
    const cotizacion = await repo.guardarCotizacion({
      solicitudId: id,
      proveedorNombre: body.proveedorNombre,
      formatoOriginal: body.formatoOriginal,
      valorNeto: body.valorNeto ?? undefined,
      moneda: body.moneda,
      impuestosDesglosados: body.impuestosDesglosados ?? undefined,
      montoIsv: body.montoIsv ?? undefined,
      valorTotal: body.valorTotal ?? undefined,
      plazoEntrega: body.plazoEntrega,
      especificacionesOfertadas: body.especificacionesOfertadas,
      confianzaExtraccion: body.confianzaExtraccion,
      editadaManualmente: false,
      fechaCarga: new Date().toISOString(),
    });
    return NextResponse.json(cotizacion, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", detalles: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al guardar la cotización" }, { status: 500 });
  }
}