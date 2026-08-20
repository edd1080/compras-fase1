import { NextResponse } from "next/server";
import { z } from "zod";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";

const repo = new PostgresRepositorio();

const schema = z.object({
  cotizacionId: z.string().optional(),
  ningunaOpcion: z.boolean().default(false),
  decididoPorEmail: z.string().email().optional(),
  comentario: z.string().optional(),
});

// Registra la decisión del solicitante por token y cierra la solicitud.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = schema.parse(await request.json());

    const link = await repo.obtenerLinkPorToken(token);
    if (!link) return NextResponse.json({ error: "Enlace no válido" }, { status: 404 });
    if (link.revocado) return NextResponse.json({ error: "Enlace revocado" }, { status: 403 });
    if (link.fechaExpiracion && new Date(link.fechaExpiracion).getTime() < Date.now()) {
      return NextResponse.json({ error: "Enlace expirado" }, { status: 403 });
    }

    const comparativa = await repo.obtenerComparativaPorId(link.comparativaId);
    if (!comparativa) return NextResponse.json({ error: "Comparativa no encontrada" }, { status: 404 });

    const solicitud = await repo.obtenerSolicitud(comparativa.solicitudId);
    if (!solicitud) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    if (solicitud.estado !== "ENVIADA_A_SOLICITANTE") {
      return NextResponse.json(
        { error: "Esta solicitud ya no está en espera de decisión" },
        { status: 409 }
      );
    }

    // Validar que la cotización elegida pertenezca a esta solicitud.
    if (!body.ningunaOpcion && body.cotizacionId) {
      const cotizaciones = await repo.listarCotizaciones(comparativa.solicitudId);
      if (!cotizaciones.some((c) => c.id === body.cotizacionId)) {
        return NextResponse.json({ error: "Cotización no válida para esta solicitud" }, { status: 400 });
      }
    }

    await repo.registrarDecisionYCerrar({
      comparativaId: comparativa.id,
      solicitudId: comparativa.solicitudId,
      cotizacionSeleccionadaId: body.ningunaOpcion ? undefined : body.cotizacionId,
      decididoPorEmail: body.decididoPorEmail ?? solicitud.solicitanteEmail,
      ningunaOpcion: body.ningunaOpcion,
      comentario: body.comentario,
    });

    return NextResponse.json({ ok: true, estadoFinal: body.ningunaOpcion ? "CERRADA_SIN_DECISION" : "CERRADA_CON_DECISION" });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", detalles: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al registrar la decisión" }, { status: 500 });
  }
}