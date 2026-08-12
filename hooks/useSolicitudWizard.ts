"use client";

// Hook del wizard del solicitante — usa la capa de dominio (cerebro).
import { useState, useCallback, useMemo } from "react";
import type { SubtipoSolicitud, TipoSolicitud } from "@/lib/domain/types";
import { bloqueoB2Activo } from "@/lib/domain/rules";
import { leerBorradorEmail, guardarBorradorEmail } from "@/lib/cookie";

export type PasoWizard = 1 | 2 | 3 | 4 | 5 | 6;

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
  clasificacionCorregida: boolean;
  llevaBranding: boolean;
  archivoLogo: string;
  assessmentListo: boolean;
  assessmentPreguntas: { campoKey: string; pregunta: string }[];
};

const estadoInicial = (): WizardState => ({
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
  clasificacionCorregida: false,
  llevaBranding: true,
  archivoLogo: "",
  assessmentListo: false,
  assessmentPreguntas: [],
});

export function useSolicitudWizard() {
  const [estado, setEstado] = useState<WizardState>(() => estadoInicial());

  const siguiente = useCallback(() => {
    setEstado((s) => {
      const paso = Math.min(6, s.paso + 1) as PasoWizard;
      guardarBorradorEmail(s.email);
      return { ...s, paso, maxAlcanzado: Math.max(s.maxAlcanzado, paso) as PasoWizard };
    });
  }, []);

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

  return {
    estado,
    siguiente,
    anterior,
    irA,
    set,
    pasoValido,
  };
}
