"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/ui-ext/AdminShell";
import type { CampoCatalogo } from "@/lib/domain/types";

export default function AdminCamposPage() {
  const [campos, setCampos] = useState<CampoCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrandoForm, setMostrandoForm] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [form, setForm] = useState({
    campoKey: "",
    label: "",
    tipoDato: "texto",
    origen: "assessment",
    obligatorio: false,
    orden: 100,
  });

  function recargar() {
    fetch("/api/admin/campos")
      .then((r) => r.json())
      .then((d) => setCampos(d))
      .catch(() => setCampos([]));
  }

  useEffect(() => {
    fetch("/api/admin/campos")
      .then((r) => r.json())
      .then((d) => { setCampos(d); setCargando(false); })
      .catch(() => { setCampos([]); setCargando(false); });
  }, []);

  async function crearCampo() {
    if (!form.campoKey.trim() || !form.label.trim()) return;
    const res = await fetch("/api/admin/campos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMensaje("Campo creado correctamente.");
      setMostrandoForm(false);
      setForm({ campoKey: "", label: "", tipoDato: "texto", origen: "assessment", obligatorio: false, orden: 100 });
      recargar();
    } else {
      const d = await res.json().catch(() => ({}));
      setMensaje(d.error ?? "No se pudo crear el campo.");
    }
  }

  async function toggleCampo(c: CampoCatalogo) {
    await fetch(`/api/admin/campos/${encodeURIComponent(c.campoKey)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !c.activo }),
    });
    recargar();
  }

  return (
    <AdminShell title="Catálogo de campos" subtitle="Gestión de campos que el sistema pide y que la IA usa para completar cotizaciones.">
      {mensaje ? (
        <div className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{mensaje}</span>
          <button onClick={() => setMensaje(null)} className="text-emerald-600">Cerrar</button>
        </div>
      ) : null}

      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-slate-600">{campos.filter((c) => c.activo).length} campos activos · {campos.length} en total</div>
        <button
          onClick={() => setMostrandoForm((v) => !v)}
          className="bg-sky-600 text-white text-[11px] font-semibold uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-sky-700 shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          {mostrandoForm ? "Cancelar" : "Nuevo campo"}
        </button>
      </div>

      {mostrandoForm ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="text-base font-semibold text-slate-900 mb-5">Nuevo campo del catálogo</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Clave interna</span>
              <input value={form.campoKey} onChange={(e) => setForm({ ...form, campoKey: e.target.value })} placeholder="ej. dimensiones" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Etiqueta (visible al usuario)</span>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="ej. Dimensiones" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de dato</span>
              <select value={form.tipoDato} onChange={(e) => setForm({ ...form, tipoDato: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 cursor-pointer transition-all">
                {["texto", "texto_largo", "numero", "fecha", "seleccion", "booleano", "archivo", "moneda"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Origen</span>
              <select value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 cursor-pointer transition-all">
                <option value="assessment">Assessment (asistente)</option>
                <option value="plantilla">Plantilla (formulario base)</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">Orden</span>
              <input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
            </label>
            <label className="flex items-end gap-3 pb-2">
              <input type="checkbox" checked={form.obligatorio} onChange={(e) => setForm({ ...form, obligatorio: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm text-slate-700">Obligatorio</span>
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={crearCampo} disabled={!form.campoKey.trim() || !form.label.trim()} className="bg-slate-900 text-white text-sm px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-40 transition-all">
              Guardar campo
            </button>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="px-5 py-10 text-sm text-slate-500">Cargando campos…</div>
        ) : (
          <table className="min-w-full text-left">
            <thead className="bg-slate-50/70">
              <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-semibold">Clave</th>
                <th className="px-5 py-3 font-semibold">Etiqueta</th>
                <th className="px-5 py-3 font-semibold">Tipo</th>
                <th className="px-5 py-3 font-semibold">Origen</th>
                <th className="px-5 py-3 font-semibold">Orden</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {campos.map((c) => (
                <tr key={c.campoKey} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{c.campoKey}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{c.label}</td>
                  <td className="px-5 py-3.5">{c.tipoDato}</td>
                  <td className="px-5 py-3.5">
                    <span className={"px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider " + (c.origen === "assessment" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600")}>
                      {c.origen}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{c.orden}</td>
                  <td className="px-5 py-3.5">
                    <span className={"px-2 py-0.5 rounded text-[10px] font-bold uppercase " + (c.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => toggleCampo(c)} className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
                      {c.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}