"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/ui-ext/AdminShell";

export default function AdminConfiguracionPage() {
  const [descargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [config, setConfig] = useState({ umbral_dias_sin_movimiento: 5, expiracion_link_dias: 90, destinatario_alertas: "" });

  useEffect(() => {
    fetch("/api/admin/configuracion")
      .then((r) => r.json())
      .then((d) => {
        setConfig({
          umbral_dias_sin_movimiento: Number(d.umbral_dias_sin_movimiento ?? 5) || 5,
          expiracion_link_dias: Number(d.expiracion_link_dias ?? 90) || 90,
          destinatario_alertas: String(d.destinatario_alertas ?? ""),
        });
      })
      .catch(() => undefined)
      .finally(() => setCargando(false));
  }, []);

  async function guardar() {
    setMensaje(null);
    const res = await fetch("/api/admin/configuracion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) setMensaje({ tipo: "ok", texto: "Configuración guardada." });
    else setMensaje({ tipo: "error", texto: "No se pudo guardar." });
  }

  return (
    <AdminShell title="Ajustes Generales" subtitle="Umbrales, expiración de enlaces y destinatarios de alertas.">
      {mensaje ? (
        <div className={"mb-4 text-sm px-4 py-3 rounded-xl border " + (mensaje.tipo === "ok" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200")}>
          {mensaje.texto}
        </div>
      ) : null}

      {descargando ? (
        <div className="text-sm text-slate-500">Cargando configuración…</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 max-w-xl">
          <div className="space-y-5">
            <label className="block">
              <span className="block text-sm font-semibold text-slate-700 mb-1.5">Umbral de inactividad (días)</span>
              <span className="block text-xs text-slate-500 mb-2">Alertar cuando una solicitud activa no avanza más de este tiempo.</span>
              <input
                type="number"
                min={1}
                value={config.umbral_dias_sin_movimiento}
                onChange={(e) => setConfig({ ...config, umbral_dias_sin_movimiento: Number(e.target.value) || 5 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-slate-700 mb-1.5">Expiración del enlace público (días)</span>
              <input
                type="number"
                min={1}
                value={config.expiracion_link_dias}
                onChange={(e) => setConfig({ ...config, expiracion_link_dias: Number(e.target.value) || 90 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-slate-700 mb-1.5">Destinatario de alertas (correo)</span>
              <span className="block text-xs text-slate-500 mb-2">Recibe los correos de alerta de inactividad.</span>
              <input
                type="email"
                value={config.destinatario_alertas}
                onChange={(e) => setConfig({ ...config, destinatario_alertas: e.target.value })}
                placeholder="compras@bia.hn"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={guardar} className="bg-slate-900 text-white text-sm px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-all">
              Guardar configuración
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}