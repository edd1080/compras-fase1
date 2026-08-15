"use client";

// Hook del wizard del solicitante — usa la capa de dominio (cerebro) y persiste vía API.
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { SubtipoSolicitud, TipoSolicitud } from "@/lib/domain/types";
import { bloqueoB2Activo } from "@/lib/domain/rules";
import { leerBorradorEmail, guardarBorradorEmail, guardarBorrador, limpiarBorrador, leerBorrador } from "@/lib/cookie";

export type PasoWizard = 1 | 2 | 3 | 4 | 5 | 6;

export type EstadoEnvio =
  | { estado: "inactivo" }
  | { estado: "enviando" }
  | { estado: "ok"; referencia?: string }
  | { estado: "error"; mensaje: string };

export type WizardState = {
  paso: PasoWizard;
  maxAlcanzado: PasoWizard;
  email: string;
  nombre: string;
  titulo: string;
  tipoNecesidad: string;
  subtipo: SubtipoSolicitud;
  fechaRequerida: string;
  area: string;
  descripcion: string;
  clasificacion: TipoSolicitud;
  confianzaClasificacion: number;
  razonamientoBreve: string;
  clasificacionCorregida: boolean;
  llevaBranding: boolean;
  archivoLogo: string;
  assessmentListo: boolean;
  assessmentPreguntas: { campoKey: string; pregunta: string }[];
  solicitudId: string | null;
};

function estadoInicial(): WizardState {
  const guardado = leerBorrador<WizardState>();
  const base: WizardState = {
    paso: 2,
    maxAlcanzado: 2,
    email: leerBorradorEmail() ?? "",
    nombre: "",
    titulo: "",
    tipoNecesidad: "",
    subtipo: "producto",
    fechaRequerida: "",
    area: "",
    descripcion: "",
    clasificacion: "RFQ",
    confianzaClasificacion: 0.9,
    razonamientoBreve: "",
    clasificacionCorregida: false,
    llevaBranding: true,
    archivoLogo: "",
    assessmentListo: false,
    assessmentPreguntas: [],
    solicitudId: null,
  };
  // Si hay un borrador guardado y coincide con el email, se retoma.
  if (guardado && guardado.email === base.email && guardado.solicitudId === null) {
    return { ...base, ...guardado };
  }
  return base;
}

export function useSolicitudWizard() {
  const router = useRouter();
  const [estado, setEstado] = useState<WizardState>(() => estadoInicial());
  const [envio, setEnvio] = useState<EstadoEnvio>({ estado: "inactivo" });
  const [borradoAt, setBorradoAt] = useState<number | null>(null);
  const [clasificandoIA, setClasificandoIA] = useState(false);
  const [evaluandoAssessment, setEvaluandoAssessment] = useState(false);

  // Autoguarda el borrador en cada cambio (para que back/forward y recarga conserven los datos).
  useEffect(() => {
    if (estado.paso >= 6) return;
    guardarBorrador({ ...estado, email: estado.email });
  }, [estado]);

  const siguiente = useCallback(() => {
    setEstado((s) => {
      const paso = Math.min(6, s.paso + 1) as PasoWizard;
      guardarBorradorEmail(s.email);
      return { ...s, paso, maxAlcanzado: Math.max(s.maxAlcanzado, paso) as PasoWizard };
    });
  }, []);

  // Clasificación IA del solicitante (P2→P3). Llamada server-side vía API.
  const clasificarIA = useCallback(async () => {
    setClasificandoIA(true);
    try {
      const { api } = await import("@/lib/api-client");
      const res = await api.clasificarIA({
        titulo: estado.titulo,
        descripcion: estado.descripcion,
        categoria: estado.tipoNecesidad,
      });
      if (res && res.confianza >= 0.7) {
        setEstado((s) => ({
          ...s,
          clasificacion: res.tipo ?? "RFQ",
          subtipo: res.subtipo ?? "producto",
          confianzaClasificacion: res.confianza,
          razonamientoBreve: res.razonamiento_breve,
        }));
      } else {
        // Confianza baja o fallo → sin preselección.
        setEstado((s) => ({ ...s, confianzaClasificacion: 0 }));
      }
    } catch {
      setEstado((s) => ({ ...s, confianzaClasificacion: 0 }));
    } finally {
      setClasificandoIA(false);
    }
  }, [estado.titulo, estado.descripcion, estado.tipoNecesidad]);

  // Assessment IA del solicitante (P3→P4). Llamada server-side vía API.
  const evaluarAssessment = useCallback(async () => {
    setEvaluandoAssessment(true);
    try {
      const { api } = await import("@/lib/api-client");
      const catalogo: import("@/lib/domain/types").CampoCatalogo[] = [];
      const res = await api.assessmentIA({
        tipo: estado.clasificacion,
        subtipo: estado.subtipo,
        categoria: estado.tipoNecesidad,
        camposCapturados: [
          { campoKey: "titulo", valor: estado.titulo },
          { campoKey: "descripcion", valor: estado.descripcion },
          { campoKey: "tipoNecesidad", valor: estado.tipoNecesidad },
        ],
        catalogo,
        llevaBranding: estado.llevaBranding,
        archivoLogo: estado.archivoLogo,
      });
      if (res) {
        setEstado((s) => ({
          ...s,
          assessmentPreguntas: res.preguntas.map((p) => ({
            campoKey: p.campoKey,
            pregunta: p.pregunta,
          })),
          assessmentListo: res.sin_preguntas_pendientes,
        }));
      } else {
        setEstado((s) => ({ ...s, assessmentListo: true }));
      }
    } catch {
      setEstado((s) => ({ ...s, assessmentListo: true }));
    } finally {
      setEvaluandoAssessment(false);
    }
  }, [estado.titulo, estado.descripcion, estado.tipoNecesidad, estado.clasificacion, estado.subtipo, estado.llevaBranding, estado.archivoLogo]);

  // Persiste la solicitud al pasar del paso 5 (documento) al 6 (confirmación).
  const enviarSolicitud = useCallback(async () => {
    setEnvio({ estado: "enviando" });
    try {
      const { api } = await import("@/lib/api-client");
      const creada = await api.crearSolicitud({
        titulo: estado.titulo,
        solicitanteEmail: estado.email,
        solicitanteNombre: estado.nombre || "Colaborador",
        areaSolicitante: estado.area,
        descripcion: estado.descripcion,
        categoria: estado.tipoNecesidad,
      });
      await api.transicionar({
        solicitudId: creada.id,
        hacia: "ENVIADA_A_COMPRAS",
        actorTipo: "solicitante",
        actorIdentificador: estado.email,
        nota: "Solicitud completada por el solicitante",
        respuestas: {
          titulo: estado.titulo,
          tipoNecesidad: estado.tipoNecesidad,
          descripcion: estado.descripcion,
          subtipo: estado.subtipo,
          llevaBranding: String(estado.llevaBranding),
        },
      });
      setEnvio({ estado: "ok", referencia: creada.numeroReferencia });
      setEstado((s) => ({ ...s, paso: 6, maxAlcanzado: 6, solicitudId: creada.id }));
    } catch (e) {
      setEnvio({
        estado: "error",
        mensaje: e instanceof Error ? e.message : "No se pudo enviar la solicitud",
      });
    }
  }, [estado]);

  const anterior = useCallback(() => {
    setEstado((s) => ({ ...s, paso: Math.max(1, s.paso - 1) as PasoWizard }));
  }, []);

  const irA = useCallback((paso: PasoWizard) => {
    setEstado((s) =>
      paso <= s.maxAlcanzado ? { ...s, paso } : s
    );
  }, []);

  const set = useCallback(
    <K extends keyof WizardState>(key: K, valor: WizardState[K]) => {
      setEstado((s) => ({ ...s, [key]: valor }));
    },
    []
  );

  const pasoValido = useMemo(() => {
    const s = estado;
    switch (s.paso) {
      case 1:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim());
      case 2:
        return Boolean(s.titulo.trim() && s.tipoNecesidad && s.fechaRequerida && s.area.trim());
      case 3:
        return true;
      case 4:
        // B2: branding sin logo bloquea (RN-03)
        return !bloqueoB2Activo({ llevaBranding: s.llevaBranding, archivoLogo: s.archivoLogo });
      case 5:
        return true;
      case 6:
        return true;
    }
  }, [estado]);

  const guardarBorradorActual = useCallback(() => {
    const copia = { ...estado, paso: estado.paso as PasoWizard, maxAlcanzado: estado.maxAlcanzado as PasoWizard };
    guardarBorrador(copia);
    setBorradoAt(Date.now());
  }, [estado]);

  const cancelar = useCallback(() => {
    limpiarBorrador();
    router.push("/");
  }, [router]);

  return {
    estado,
    siguiente,
    anterior,
    irA,
    set,
    pasoValido,
    envio,
    enviarSolicitud,
    clasificandoIA,
    clasificarIA,
    evaluandoAssessment,
    evaluarAssessment,
    guardarBorrador: guardarBorradorActual,
    cancelar,
    borradoAt,
  };
}
