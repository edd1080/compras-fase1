"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CargaCotizaciones } from "./CargaCotizaciones";
import { ComparativaView } from "./Comparativa";
import { Recomendacion } from "./Recomendacion";
import { cotizacionesFixture, comparativaFixture } from "@/lib/fixtures";
import type { Solicitud } from "@/lib/domain/types";
import { Card } from "@/components/Card";

type Etapa = 7 | 8 | 9;

export function DetalleSolicitud({ solicitud }: { solicitud: Solicitud }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>(7);
  const [enviada, setEnviada] = useState(false);
  const cotizaciones = cotizacionesFixture[solicitud.id] ?? [];
  const comparativa = comparativaFixture(solicitud.id);

  const tabs: { n: Etapa; label: string }[] = [
    { n: 7, label: "07 · Cotizaciones" },
    { n: 8, label: "08 · Comparativa" },
    { n: 9, label: "09 · Recomendación" },
  ];

  return (
    <div className="py-6">
      <button
        type="button"
        onClick={() => router.push("/panel")}
        className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] text-slate transition-colors hover:text-azul-marino"
      >
        ← Bandeja de Compras
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Etapas + contenido */}
        <div className="min-w-0">
          {enviada ? (
            <div className="mb-4 animate-fade rounded-card border-l-4 border-sage bg-sage-soft px-5 py-4 text-[13.5px]">
              <b>Comparativa enviada</b> — la solicitud queda en espera de la decisión del
              solicitante.
            </div>
          ) : null}

          <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Etapas">
            {tabs.map((t) => (
              <button
                key={t.n}
                type="button"
                aria-pressed={etapa === t.n}
                disabled={!comparativa && t.n === 8}
                onClick={() => setEtapa(t.n)}
                className={
                  "rounded-card border px-3.5 py-2 text-[12.5px] transition-all " +
                  (etapa === t.n
                    ? "border-azul-marino bg-azul-marino font-semibold text-white shadow-[0_2px_6px_rgba(46,95,201,0.25)]"
                    : "border-borde bg-superficie text-texto-terciario hover:border-azul-medio hover:text-azul-marino")
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="animate-view" key={etapa}>
            {enviada ? null : etapa === 7 ? (
              <CargaCotizaciones
                cotizaciones={cotizaciones}
                onPosibleGenerar={() => undefined}
                onGenerar={() => setEtapa(8)}
              />
            ) : etapa === 8 ? (
              comparativa ? (
                <ComparativaView
                  comparativa={comparativa}
                  cotizaciones={cotizaciones}
                  onContinuar={() => setEtapa(9)}
                />
              ) : (
                <p className="text-[13.5px] text-texto-terciario">
                  Aún no hay cotizaciones cargadas para esta solicitud.
                </p>
              )
            ) : (
              <Recomendacion
                cotizaciones={cotizaciones}
                prosContras={comparativa?.prosContras ?? {}}
                sugerenciaIA={comparativa?.sugerenciaIA}
                cotizacionSugeridaId={comparativa?.cotizacionSugeridaId}
                onEnviar={() => setEnviada(true)}
              />
            )}
          </div>
        </div>

        {/* Panel lateral: metadatos de la solicitud */}
        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="title-sm mb-3">Solicitud</h3>
            <dl className="flex flex-col gap-2 text-[13px]">
              <Metarow k="Correo" v={solicitud.solicitanteEmail} />
              <Metarow k="Área" v={solicitud.areaSolicitante ?? "—"} />
              <Metarow k="Tipo" v={solicitud.tipo ?? "—"} />
              <Metarow k="Subtipo" v={solicitud.subtipo ?? "—"} />
              <Metarow k="Requerida" v={solicitud.fechaRequerida ?? "—"} />
              <Metarow k="Creada" v={new Date(solicitud.fechaCreacion).toLocaleDateString("es-HN")} />
            </dl>
          </Card>
          <Card className="p-5">
            <h3 className="title-sm mb-2">Solicitante</h3>
            <p className="text-[13.5px] font-medium">{solicitud.solicitanteNombre}</p>
            <p className="mt-0.5 text-[12.5px] text-texto-secundario">{solicitud.descripcion}</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Metarow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-texto-terciario">{k}</dt>
      <dd className="text-right font-medium text-texto-principal">{v}</dd>
    </div>
  );
}