"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CargaCotizaciones } from "./CargaCotizaciones";
import { ComparativaView } from "./Comparativa";
import { Recomendacion } from "./Recomendacion";
import {
  cotizacionesFixture,
  comparativaFixture,
} from "@/lib/fixtures";
import type { Solicitud } from "@/lib/domain/types";

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
        className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] text-slate hover:text-azul-marino"
      >
        ← Bandeja de Compras
      </button>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.n}
            type="button"
            disabled={!comparativa && t.n === 8 && true}
            onClick={() => setEtapa(t.n)}
            className={
              "rounded-card border px-3.5 py-2 text-[12.5px] " +
              (etapa === t.n
                ? "border-azul-soft2 bg-azul-claro font-semibold text-azul-marino"
                : "border-borde bg-superficie text-texto-terciario hover:text-azul-marino")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {enviada ? (
        <div className="rounded-card border-l-4 border-sage bg-sage-soft px-5 py-4 text-[13.5px]">
          <b>Comparativa enviada</b> — la solicitud queda en espera de la decisión del
          solicitante.
        </div>
      ) : etapa === 7 ? (
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
        <div>
          <Recomendacion
            cotizaciones={cotizaciones}
            prosContras={comparativa?.prosContras ?? {}}
            sugerenciaIA={comparativa?.sugerenciaIA}
            cotizacionSugeridaId={comparativa?.cotizacionSugeridaId}
            onEnviar={() => setEnviada(true)}
          />
        </div>
      )}
    </div>
  );
}