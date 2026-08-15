import { z } from "zod";

export const ClasificarInputSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().optional().default(""),
  categoria: z.string().optional().default(""),
});

export const ClasificarOutputSchema = z.object({
  tipo: z.enum(["RFI", "RFQ", "RFP"]).nullable(),
  subtipo: z.enum(["producto", "servicio", "mixto"]).nullable(),
  confianza: z.number().min(0).max(1),
  razonamientoBreve: z.string(),
});

export type ClasificarInput = z.infer<typeof ClasificarInputSchema>;
export type ClasificarOutput = z.infer<typeof ClasificarOutputSchema>;

export const AssessmentInputSchema = z.object({
  tipo: z.enum(["RFI", "RFQ", "RFP"]),
  subtipo: z.enum(["producto", "servicio", "mixto"]),
  categoria: z.string(),
  camposCapturados: z.record(z.string(), z.unknown()),
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
  })),
});

export const PreguntaAssessmentSchema = z.object({
  campoKey: z.string(),
  pregunta: z.string(),
  porQue: z.string(),
  critica: z.boolean(),
});

export const AssessmentOutputSchema = z.object({
  preguntas: z.array(PreguntaAssessmentSchema).max(6),
  contextoInvestigado: z.string(),
  sinPreguntasPendientes: z.boolean(),
});

export type AssessmentInput = z.infer<typeof AssessmentInputSchema>;
export type AssessmentOutput = z.infer<typeof AssessmentOutputSchema>;

export const ExtraerCotizacionInputSchema = z.object({
  markdown: z.string().min(1),
  especificacionesSolicitadas: z.record(z.string(), z.string()).default({}),
});

export const ExtraerCotizacionOutputSchema = z.object({
  proveedorNombre: z.string().nullable(),
  proveedorIdentificacionFiscal: z.string().nullable().optional(),
  proveedorContacto: z.string().nullable().optional(),
  valorNeto: z.number().nullable(),
  moneda: z.string().nullable(),
  impuestosDesglosados: z.boolean().nullable(),
  montoIsv: z.number().nullable(),
  montoOtrosImpuestos: z.number().nullable().optional(),
  valorTotal: z.number().nullable(),
  plazoEntrega: z.string().nullable(),
  formaPago: z.string().nullable().optional(),
  vigenciaOferta: z.string().nullable().optional(),
  garantia: z.string().nullable().optional(),
  especificacionesOfertadas: z.record(z.string(), z.string()),
  observacionesFiscales: z.string().nullable().optional(),
  ilegible: z.boolean(),
  confianzaPorCampo: z.record(z.string(), z.number()),
});

export type ExtraerCotizacionInput = z.infer<typeof ExtraerCotizacionInputSchema>;
export type ExtraerCotizacionOutput = z.infer<typeof ExtraerCotizacionOutputSchema>;

export const ComparativaInputSchema = z.object({
  tituloSolicitud: z.string(),
  especificacionesSolicitadas: z.record(z.string(), z.string()),
  cotizaciones: z.array(z.object({
    proveedorNombre: z.string(),
    valorNeto: z.number().nullable(),
    moneda: z.string().nullable(),
    montoIsv: z.number().nullable(),
    valorTotal: z.number().nullable(),
    plazoEntrega: z.string().nullable(),
    especificacionesOfertadas: z.record(z.string(), z.string()),
  })),
});

export const ProsContrasSchema = z.object({
  pros: z.array(z.string()),
  contras: z.array(z.string()),
});

export const DiscrepanciaSchema = z.object({
  aspecto: z.string(),
  solicitado: z.string(),
  porProveedor: z.record(z.string(), z.string()),
  severidad: z.enum(["alta", "media", "baja"]),
  explicacion: z.string(),
});

export const ComparativaOutputSchema = z.object({
  discrepanciasDetectadas: z.array(DiscrepanciaSchema),
  prosContras: z.record(z.string(), ProsContrasSchema),
  sugerenciaIA: z.string().nullable(),
  cotizacionSugeridaId: z.string().nullable(),
  advertenciaGeneral: z.string().nullable(),
});

export type ComparativaInput = z.infer<typeof ComparativaInputSchema>;
export type ComparativaOutput = z.infer<typeof ComparativaOutputSchema>;

export const FuncionPromptSchema = z.object({
  systemPrompt: z.string(),
  userPromptTemplate: z.string(),
});