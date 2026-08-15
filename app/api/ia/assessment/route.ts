import { NextResponse } from "next/server";
import { z } from "zod";
import { assessment_requerimiento } from "@/lib/domain/assessment";
import { PostgresRepositorio } from "@/lib/db/postgres-repo";
import type { CampoCatalogo, TipoDatoCampo, OrigenCampo } from "@/lib/domain/types";

const repo = new PostgresRepositorio();

const schema = z.object({
  tipo: z.enum(["RFI", "RFQ", "RFP"]),
  subtipo: z.enum(["producto", "servicio", "mixto"]),
  categoria: z.string(),
  camposCapturados: z.array(z.object({ campoKey: z.string(), valor: z.string().optional() })).default([]),
  catalogo: z.array(z.object({
    campoKey: z.string(),
    label: z.string(),
    ayuda: z.string().optional(),
    tipoDato: z.string(),
    obligatorio: z.boolean(),
    origen: z.string(),
    seccionPdf: z.string().optional(),
    orden: z.number(),
    activo: z.boolean(),
  })).default([]),
  llevaBranding: z.boolean().optional(),
  archivoLogo: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    // Si el cliente no trae catálogo, lo cargamos desde la DB (RN-02: solo campos vigentes).
    const catalogoBody: CampoCatalogo[] = body.catalogo.map((c) => ({
      campoKey: c.campoKey,
      label: c.label,
      ayuda: c.ayuda,
      tipoDato: c.tipoDato as TipoDatoCampo,
      catalogoOpciones: undefined,
      obligatorio: c.obligatorio,
      origen: c.origen as OrigenCampo,
      seccionPdf: c.seccionPdf,
      orden: c.orden,
      activo: c.activo,
    }));
    const catalogo = catalogoBody.length > 0
      ? catalogoBody
      : await repo.listarCampoCatalogo();

    const res = await assessment_requerimiento({
      tipo: body.tipo,
      subtipo: body.subtipo,
      camposCapturados: body.camposCapturados,
      camposDisponiblesCatalogo: catalogo,
      llevaBranding: body.llevaBranding,
      archivoLogo: body.archivoLogo,
    });
    return NextResponse.json(res);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Entrada inválida", detalles: e.issues }, { status: 400 });
    }
    return NextResponse.json(null);
  }
}