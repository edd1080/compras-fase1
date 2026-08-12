"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import type { Cotizacion, ProsContras } from "@/lib/domain/types";
import { formato } from "@/lib/domain/comparativa";

type VistaPublicaProps = {
  cotizaciones: Cotizacion[];
  prosContras: Record<string, ProsContras>;
  recomendacion?: string;
  advertenciaGeneral?: string | null;
};

export function VistaPublica({
  cotizaciones,
  prosContras,
  recomendacion,
  advertenciaGeneral,
}: VistaPublicaProps) {
  const [elegida, setElegida] = useState<string | null>(null);
  const [ningunaSirve, setNingunaSirve] = useState(false);

  return (
    <div className="rounded-card border-[1.5px] border-dashed border-borde-fuerte p-1.5">
      <div className="rounded-card bg-superficie px-8 py-8">
        <div className="mb-5 flex items-center gap-2.5 rounded-[10px] border border-borde bg-fondo px-4 py-3 text-[12.5px] text-texto-secundario">
          ✉️ Estás viendo esto como el enlace público que llegó por correo — sin necesidad de
          iniciar sesión.
        </div>

        <div className="mb-4 inline-flex rounded-full bg-borde/50 px-2.5 py-1 text-[11px] font-semibold text-texto-terciario">
          Enlace público · sin iniciar sesión
        </div>

        <h2 className="font-display text-[19px] font-semibold">Comparativa lista</h2>
        <p className="mb-6 text-[13px] text-slate">
          Seleccioná la opción que prefieras. Compras ya revisó cada oferta.
        </p>

        {advertenciaGeneral ? (
          <div className="mb-4 rounded-field border-l-4 border-advertencia bg-advertencia-fondo px-4 py-3 text-[13px]">
            <b>Advertencia:</b> {advertenciaGeneral}
          </div>
        ) : null}

        {recomendacion ? (
          <div className="mb-5 animate-fade flex gap-3.5 rounded-card bg-azul-claro px-5 py-4">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] bg-azul-marino font-display text-[13px] font-bold text-white">
              CM
            </div>
            <div className="text-[13.5px] leading-relaxed text-azul-marino">
              <span className="mb-0.5 block font-display text-[11px] font-bold uppercase tracking-wide text-azul-medio">
                Recomendación de Compras
              </span>
              {recomendacion}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cotizaciones.map((c) => {
            const pc = prosContras[c.id];
            const elegidaEsta = elegida === c.id;
            return (
              <div
                key={c.id}
                className={
                  "rounded-card border-[1.5px] bg-superficie px-4 py-4 transition-[border-color,box-shadow,transform] duration-150 " +
                  (elegidaEsta
                    ? "border-sage shadow-[0_2px_10px_rgba(79,122,87,0.2)]"
                    : "border-borde-fuerte hover:-translate-y-0.5 hover:border-azul-soft2 hover:shadow-pop")
                }
              >
                <div className="font-display text-[14.5px] font-semibold">
                  {c.proveedorNombre}
                </div>
                {(pc?.pros ?? []).slice(0, 2).map((p) => (
                  <div key={p} className="mt-1.5 text-[12.5px] text-sage">✓ {p}</div>
                ))}
                {(pc?.contras ?? []).slice(0, 1).map((c2) => (
                  <div key={c2} className="mt-1 text-[12.5px] text-clay">✗ {c2}</div>
                ))}
                <div className="mt-2 font-mono text-[16px] font-medium tabular">
                  L {formato(c.valorTotal)}
                </div>
                <div className="mt-1 text-[12px] text-slate">{c.plazoEntrega ?? "—"}</div>
                <Button
                  variant={elegidaEsta ? "primary" : "secondary"}
                  className="mt-3 w-full"
                  disabled={elegida !== null && !elegidaEsta}
                  onClick={() => setElegida(c.id)}
                >
                  {elegidaEsta ? "✓ Elegida" : "Elegir esta opción"}
                </Button>
              </div>
            );
          })}
        </div>

        {elegida ? (
          <div className="mt-5 flex items-center gap-3.5 rounded-card border-l-4 border-sage bg-sage-soft px-5 py-4 text-[13.5px]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-soft">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-sage">
                <path d="M4 12l6 6L20 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <div className="font-semibold">
                ¡Listo! Seleccionaste la opción de{" "}
                {cotizaciones.find((c) => c.id === elegida)?.proveedorNombre}.
              </div>
              <div className="text-[12px] text-slate">
                Registrado ahora · se notificó al equipo de Compras.
              </div>
            </div>
          </div>
        ) : null}

        {!elegida ? (
          <Button
            variant="ghost"
            className="mt-6 w-full"
            onClick={() => setNingunaSirve(true)}
            disabled={ningunaSirve}
          >
            {ningunaSirve
              ? "Se notificó a Compras — no se cerró con decisión"
              : "Ninguna me sirve, necesito hablar con Compras"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}