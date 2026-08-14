// Generador de PDF con pdfme — Portal de Compras BIA.
// Recibe una plantilla declarativa JSON (genérica/reemplazable) e inputs, y devuelve el Buffer.
import { generate } from "@pdfme/generator";
import { text, line } from "@pdfme/schemas";
import type { Solicitud } from "@/lib/domain/types";
import { createTemplate } from "./plantilla-generica";

export type DocGenerado = {
  buffer: Uint8Array;
  tipo: string;
  referencia: string;
};

export async function generarDocumento(opts: {
  tipo: "RFI" | "RFQ" | "RFP";
  solicitud: Solicitud;
  respuestas: Record<string, string>;
  coordenadorNombre?: string;
  fechaLimite?: string;
}): Promise<DocGenerado> {
  const { tipo, solicitud, respuestas, coordenadorNombre, fechaLimite } = opts;

  const campos = Object.entries(respuestas)
    .map(([k, v]) => `${k}: ${v || "no especificado"}`)
    .join("\n") || "Sin campos adicionales";

  const inputs: Record<string, string> = {
    referencia: solicitud.numeroReferencia ?? "SIN-REF",
    tipo,
    area: solicitud.areaSolicitante ?? "no especificado",
    solicitante: solicitud.solicitanteNombre,
    coordenador: coordenadorNombre ?? "no especificado",
    fechaLimite: fechaLimite ?? solicitud.fechaRequerida ?? "no especificado",
    titulo: solicitud.titulo,
    descripcion: solicitud.descripcion ?? "no especificado",
    campos,
  };

  const template = createTemplate(tipo) as unknown as Parameters<typeof generate>[0]["template"];

  // pdfme 6: generate({ template, inputs, plugins })
  const buffer = await generate({
    template,
    inputs: [inputs],
    plugins: { text, line },
  });

  return { buffer, tipo, referencia: inputs.referencia };
}