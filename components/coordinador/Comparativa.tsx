"use client";

import { Button } from "@/components/Button";
import type { Comparativa } from "@/lib/domain/types";
import { formato } from "@/lib/domain/comparativa";

type ComparativaViewProps = {
  comparativa: Comparativa;
  cotizaciones: { id: string; proveedorNombre: string; valorNeto?: number; montoIsv?: number; valorTotal?: number; moneda?: string; plazoEntrega?: string; impuestosDesglosados?: boolean }[];
  onContinuar: () => void;
};

export function ComparativaView({ comparativa, cotizaciones, onContinuar }: ComparativaViewProps) {
  const hayDiscrepancias = comparativa.discrepanciasDetectadas.length > 0;

  return (
    <div className="py-4">
      {hayDiscrepancias ? (
        <div className="mb-4 rounded-field border-l-4 border-advertencia bg-advertencia-fondo px-4 py-3 text-[13px] text-texto-principal">
          <b>Discrepancia de especificación:</b>{" "}
          {comparativa.discrepanciasDetectadas
            .map((d) => d.explicacion)
            .join(". ")}{" "}
          — se muestran antes que los precios.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-card border border-borde bg-superficie shadow-card">
        <table className="w-full border-collapse text-left text-[13.5px]">
          <thead>
            <tr className="bg-fondo">
              <th className="w-[150px] border-b border-borde px-4 py-3.5 font-display text-[13px] font-semibold">
                Requerimiento
              </th>
              {cotizaciones.map((c) => (
                <th
                  key={c.id}
                  className="border-b border-borde px-4 py-3.5 font-display text-[13px] font-semibold"
                >
                  {c.proveedorNombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3.5 font-medium text-slate">Valor neto</td>
              {cotizaciones.map((c) => (
                <td key={c.id} className="px-4 py-3.5 font-mono">
                  {c.valorNeto !== undefined ? `L ${formato(c.valorNeto)}` : "no especificado"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3.5 font-medium text-slate">Impuestos (ISV)</td>
              {cotizaciones.map((c) => (
                <td key={c.id} className="px-4 py-3.5 font-mono">
                  {c.impuestosDesglosados === true && c.montoIsv !== undefined ? (
                    `L ${formato(c.montoIsv)}`
                  ) : (
                    <span className="inline-flex rounded-full bg-clay-soft px-2 py-1 text-[11px] font-semibold text-clay">
                      ⚠ no especifica
                    </span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3.5 font-medium text-slate">Total</td>
              {cotizaciones.map((c) => (
                <td key={c.id} className="px-4 py-3.5 font-mono font-semibold">
                  {c.valorTotal !== undefined ? `L ${formato(c.valorTotal)}` : "no especificado"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3.5 font-medium text-slate">Entrega</td>
              {cotizaciones.map((c) => (
                <td key={c.id} className="px-4 py-3.5">{c.plazoEntrega ?? "—"}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {comparativa.discrepanciasDetectadas.length > 0 ? (
        <div className="mt-4 rounded-field border-l-4 border-clay bg-clay-soft px-4 py-3 text-[13px] text-[#7A4A2E]">
          <b>Observación fiscal:</b> {comparativa.discrepanciasDetectadas[0].explicacion}
        </div>
      ) : null}

      <Button className="mt-5" onClick={onContinuar}>
        Ver recomendación →
      </Button>
    </div>
  );
}