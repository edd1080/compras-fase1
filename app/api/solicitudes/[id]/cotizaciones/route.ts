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
  markdownExtraido: z.string().optional(),
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

    // Si se incluyó markdown extraído, ejecutar extracción IA y actualizar.
    if (body.markdownExtraido) {
      try {
        const { extraerCotizacion } = await import("@/lib/ai/orchestrator");
        const extraida = await extraerCotizacion({
          markdown: body.markdownExtraido,
          especificacionesSolicitadas: {},
        });
        if (extraida) {
          await repo.actualizarCotizacion(cotizacion.id, {
            proveedorNombre: extraida.proveedorNombre ?? cotizacion.proveedorNombre,
            valorNeto: extraida.valorNeto ?? undefined,
            moneda: extraida.moneda ?? undefined,
            impuestosDesglosados: extraida.impuestosDesglosados ?? undefined,
            montoIsv: extraida.montoIsv ?? undefined,
            valorTotal: extraida.valorTotal ?? undefined,
            plazoEntrega: extraida.plazoEntrega ?? undefined,
            especificacionesOfertadas: extraida.especificacionesOfertadas,
            confianzaExtraccion: extraida.confianzaPorCampo,
            fechaCarga: new Date().toISOString(),
          });
        }
      } catch {
        // Si la extracción IA falla, se guarda con los datos originales (no bloqueante).
      }
    }

    // Releer para devolver datos actualizados.
    const actualizada = body.markdownExtraido
      ? (await repo.listarCotizaciones(id)).find((c) => c.id === cotizacion.id) ?? cotizacion
      : cotizacion;

    return NextResponse.json(actualizada, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", detalles: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al guardar la cotización" }, { status: 500 });
  }
}