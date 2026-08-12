// assessment_requerimiento — Portal de Compras BIA
// Fuente: doc 16 (función del agente) + PRD RF-12…18. Contrato tipado listo para la IA (Sprint 3).
// Ahora implementa por reglas del catálogo: pide solo los campos faltantes y determinantes.
import type { CampoCatalogo } from "./types";
import { bloqueoB2Activo } from "./rules";

export type PreguntaAssessment = {
  campoKey: string;
  pregunta: string;
  por_que: string;
  critica: boolean;
};

export type ResultadoAssessment = {
  preguntas: PreguntaAssessment[];
  contexto_investigado: string;
  sin_preguntas_pendientes: boolean;
};

export type AssessmentInput = {
  camposCapturados: { campoKey: string; valor?: string }[];
  camposDisponiblesCatalogo: CampoCatalogo[];
  tipo?: string;
  subtipo?: string;
  llevaBranding?: boolean;
  archivoLogo?: string;
};

const MAX_PREGUNTAS = 6;

export function assessment_requerimiento(input: AssessmentInput): ResultadoAssessment {
  const { camposCapturados, camposDisponiblesCatalogo, llevaBranding, archivoLogo } = input;
  const respondidos = new Set(camposCapturados.map((c) => c.campoKey));
  const preguntas: PreguntaAssessment[] = [];

  // Validación dura: solo campos que existan en el catálogo (RN-02).
  const validos = camposDisponiblesCatalogo.filter(
    (c) => c.activo && c.origen === "assessment"
  );

  // Orden: obligatorios/determinantes primero (que más afectan la comparabilidad).
  const ordenados = [...validos].sort((a, b) => {
    const peso = (k: CampoCatalogo) =>
      (k.obligatorio ? 0 : 1) + (k.validacion?.bloqueante ? 0 : 10);
    return peso(a) - peso(b);
  });

  for (const campo of ordenados) {
    if (preguntas.length >= MAX_PREGUNTAS) break;
    if (respondidos.has(campo.campoKey)) continue;

    // branding activo sin logo → crítica (B2)
    const esLogo = campo.campoKey === "archivo_logo";
    const criticaPorBranding =
      esLogo && bloqueoB2Activo({ llevaBranding, archivoLogo });

    preguntas.push({
      campoKey: campo.campoKey,
      pregunta: campo.label,
      por_que: campo.ayuda ?? "Determina que los proveedores coticen de forma comparable.",
      critica: campo.obligatorio || criticaPorBranding,
    });
  }

  return {
    preguntas,
    contexto_investigado: "Assessment por reglas del catálogo (IA se integra en Sprint 3).",
    sin_preguntas_pendientes: preguntas.length === 0,
  };
}