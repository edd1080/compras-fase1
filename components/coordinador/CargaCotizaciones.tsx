"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import type { Cotizacion } from "@/lib/domain/types";

type CargaCotizacionesProps = {
  cotizaciones: Cotizacion[];
  onPosibleGenerar: (n: number) => void;
  onGenerar: () => void;
};

const ETIQUETAS: Record<string, string> = {
  c1: "cotizacion_publicidadtotal.pdf",
  c2: "cotizacion_impresosdelvalle.docx",
  c3: "foto_grafimax.jpg",
};

export function CargaCotizaciones({ cotizaciones, onPosibleGenerar, onGenerar }: CargaCotizacionesProps) {
  const [cargadas, setCargadas] = useState<string[]>([]);
  const tiene = (id: string) => cargadas.includes(id);

  function cargar(id: string) {
    setCargadas((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      onPosibleGenerar(next.length);
      return next;
    });
  }

  return (
    <div className="py-4">
      <p className="mb-5 text-[13.5px] text-texto-secundario">
        Subí las cotizaciones a medida que las recibas de los proveedores — en cualquier
        formato (PDF, Word o imagen) y cada una se convierte internamente a Markdown antes del
        análisis.
      </p>
      <div className="flex flex-col gap-3">
        {cotizaciones.map((c) => (
          <div
            key={c.id}
            className={
              "flex items-center gap-3.5 rounded-card border-[1.5px] px-4 py-4 transition-colors " +
              (tiene(c.id) ? "border-sage" : "border-borde-fuerte")
            }
          >
            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] border border-borde-fuerte bg-fondo font-mono text-[10.5px] font-medium text-slate">
              {c.formatoOriginal.toUpperCase().slice(0, 3)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold">{c.proveedorNombre}</div>
              <div className="mt-0.5 text-[12px] text-slate">
                {tiene(c.id) ? `${ETIQUETAS[c.id] ?? "archivo"} · convertido a Markdown ✓` : "Sin archivo aún"}
              </div>
            </div>
            <div>
              {tiene(c.id) ? (
                <Button disabled variant="ghost">Cargado</Button>
              ) : (
                <Button variant="ghost" onClick={() => cargar(c.id)}>Adjuntar</Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-5" disabled={cargadas.length < 2} onClick={onGenerar}>
        Generar comparativa
      </Button>
      {cargadas.length < 2 ? (
        <p className="mt-2 text-[12px] text-texto-terciario">
          Se necesitan al menos 2 cotizaciones para generar una comparativa.
        </p>
      ) : null}
    </div>
  );
}