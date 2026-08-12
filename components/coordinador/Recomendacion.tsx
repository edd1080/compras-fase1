"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import type { Cotizacion, ProsContras } from "@/lib/domain/types";
import { bloqueoB3Activo } from "@/lib/domain/rules";
import { formato } from "@/lib/domain/comparativa";

type RecomendacionProps = {
  cotizaciones: Cotizacion[];
  prosContras: Record<string, ProsContras>;
  sugerenciaIA?: string;
  cotizacionSugeridaId?: string;
  onEnviar: (recomendacion: string) => void;
};

export function Recomendacion({
  cotizaciones,
  prosContras,
  sugerenciaIA,
  cotizacionSugeridaId,
  onEnviar,
}: RecomendacionProps) {
  const [recomendacion, setRecomendacion] = useState("");
  const sugerida = cotizaciones.find((c) => c.id === cotizacionSugeridaId);
  const bloqueado = bloqueoB3Activo(recomendacion);

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cotizaciones.map((c) => {
          const pc = prosContras[c.id];
          return (
            <div
              key={c.id}
              className={
                "rounded-card border-[1.5px] bg-superficie px-4 py-4 " +
                (c.id === cotizacionSugeridaId ? "border-brass bg-brass-soft" : "border-borde-fuerte")
              }
            >
              <h3 className="font-display text-[14.5px] font-semibold">{c.proveedorNombre}</h3>
              {(pc?.pros ?? []).map((p) => (
                <div key={p} className="mt-1.5 text-[12.5px] text-sage">✓ {p}</div>
              ))}
              {(pc?.contras ?? []).map((c2) => (
                <div key={c2} className="mt-1 text-[12.5px] text-clay">✗ {c2}</div>
              ))}
              <div className="mt-2 font-mono text-[16px] font-medium">
                L {formato(c.valorTotal)}
              </div>
            </div>
          );
        })}
      </div>

      {sugerenciaIA ? (
        <div className="mt-5 flex gap-3.5 rounded-card bg-azul-claro px-5 py-4">
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] bg-azul-marino font-display text-[13px] font-bold text-white">
            IA
          </div>
          <div className="text-[13.5px] leading-relaxed text-azul-marino">
            <b>Sugerencia del asistente:</b>{" "}
            {sugerenciaIA}
            {sugerida ? `. Proveedor sugerido: ${sugerida.proveedorNombre}.` : ""}
          </div>
        </div>
      ) : null}

      <div className="mt-4 rounded-card border border-borde bg-superficie p-6 shadow-card">
        <label className="mb-2 block text-[12.5px] font-semibold text-texto-secundario">
          Recomendación del coordinador{" "}
          <span className="font-normal text-clay">— obligatorio</span>
        </label>
        <textarea
          value={recomendacion}
          onChange={(e) => setRecomendacion(e.target.value)}
          placeholder="Ej. Recomiendo Impresos del Valle: buen precio, calidad conocida y ya hemos trabajado con ellos antes."
          className="min-h-[90px] w-full resize-y rounded-field border-[1.5px] border-borde-fuerte bg-fondo px-3.5 py-3 text-[14.5px] focus:border-azul-medio focus:bg-superficie focus:outline-none"
        />
        <p className="mt-1.5 text-[12px] text-texto-terciario">
          La IA sugiere, pero la palabra final siempre es del coordinador — este campo no puede
          quedar vacío.
        </p>
        <Button
          className="mt-4"
          disabled={bloqueado}
          onClick={() => onEnviar(recomendacion)}
        >
          Enviar comparativa al solicitante
        </Button>
        {bloqueado ? (
          <p
            className="mt-2 rounded-field border-l-4 border-advertencia bg-advertencia-fondo px-3 py-2 text-[13px]"
            role="alert"
          >
            Escribí tu recomendación antes de enviar. El solicitante decide, pero tu criterio es
            lo que más le sirve para decidir.
          </p>
        ) : null}
      </div>
    </div>
  );
}