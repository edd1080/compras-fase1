"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { VistaPublica } from "@/components/publica/VistaPublica";
import { cotizacionesFixture, comparativaFixture, usuariosFixture } from "@/lib/fixtures";
import type { Cotizacion, ProsContras } from "@/lib/domain/types";

type Datos = {
  solicitudId: string;
  cotizaciones: Cotizacion[];
  prosContras: Record<string, ProsContras>;
  recomendacion?: string;
  advertenciaGeneral?: string | null;
};

export default function ComparativaPublicaPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!token) return;
    if (token === "demo-2026") {
      const cmp = comparativaFixture("s014");
      if (!cmp) { setTimeout(() => { setError("Demo no disponible"); setCargando(false); }, 0); return; }
      const coord = usuariosFixture[0];
      setTimeout(() => {
        setDatos({
          solicitudId: "s1",
          cotizaciones: cotizacionesFixture.s014 ?? [],
          prosContras: cmp.prosContras,
          recomendacion: cmp.recomendacionComprador ? `Recomendación de ${coord?.nombre ?? "Compras"}` : undefined,
          advertenciaGeneral: cmp.analysis?.advertenciaGeneral ?? null,
        });
        setCargando(false);
      }, 0);
      return;
    }
    fetch(`/api/comparativas/${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error ?? "Enlace no válido");
        }
        return r.json();
      })
      .then((d) => {
        setDatos({
          solicitudId: d.solicitudId,
          cotizaciones: d.cotizaciones,
          prosContras: d.comparativa.prosContras ?? {},
          recomendacion: d.comparativa.recomendacionComprador,
          advertenciaGeneral: d.comparativa.analysis?.advertenciaGeneral ?? null,
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar"))
      .finally(() => setCargando(false));
  }, [token]);

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Cargando comparativa…</div>;
  }
  if (error || !datos) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-8 text-center">
          <div className="text-2xl mb-3">🔒</div>
          <div className="text-base font-semibold text-slate-900 mb-1">No se pudo abrir el enlace</div>
          <div className="text-sm text-slate-500">{error ?? "Este enlace no es válido."}</div>
        </div>
      </div>
    );
  }
  return (
    <VistaPublica
      token={token}
      solicitudId={datos.solicitudId}
      cotizaciones={datos.cotizaciones}
      prosContras={datos.prosContras}
      recomendacion={datos.recomendacion}
      advertenciaGeneral={datos.advertenciaGeneral}
    />
  );
}