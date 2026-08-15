"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AmbientBackground } from "@/components/ui-ext/AmbientBackground";
import { useSolicitudWizard } from "@/hooks/useSolicitudWizard";

const PASOS_SIDEBAR = [
  { id: 1, label: "Captura Inicial" },
  { id: 2, label: "Clasificación" },
  { id: 3, label: "Detalles técnicos" },
  { id: 4, label: "Documento" },
];

export function SolicitanteWizard() {
  const searchParams = useSearchParams();
  const w = useSolicitudWizard();
  const { estado, set, siguiente, anterior, pasoValido, envio, enviarSolicitud, guardarBorrador, cancelar, borradoAt } = w;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const emailInicial = searchParams.get("email") ?? "";
  const nombreInicial = searchParams.get("nombre") ?? "";
  const areaInicial = searchParams.get("area") ?? "";

  useEffect(() => {
    if (emailInicial) set("email", emailInicial);
    if (nombreInicial) set("nombre", nombreInicial);
    if (areaInicial) set("area", areaInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailInicial, nombreInicial, areaInicial]);

  // Mapeo html step (2..6) -> sidebar progress (1..4)
  const progress = useMemo(() => {
    const p = estado.paso <= 2 ? 1 : estado.paso === 3 ? 2 : estado.paso === 4 ? 3 : 4;
    const listo = estado.paso >= 6;
    return { p, listo };
  }, [estado.paso]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <AmbientBackground />
      <main className="w-full max-w-[1024px] bg-white/70 backdrop-blur-3xl rounded-3xl md:rounded-[2.5rem] border border-white shadow-[0_8px_40px_rgb(0,0,0,0.06)] flex flex-col md:flex-row h-[90vh] md:h-[80vh] min-h-[650px] max-h-[850px] overflow-hidden relative z-10">
        {/* Sidebar: progress tracker */}
        <aside className="md:w-[280px] lg:w-[320px] bg-gradient-to-br from-sky-100 to-slate-50 p-6 lg:p-8 flex flex-col relative border-b md:border-b-0 md:border-r border-white/60 shrink-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-r from-sky-200 to-transparent rounded-full mix-blend-multiply blur-[40px] opacity-60 animate-fluid-blob pointer-events-none" />
          <div className="relative z-10 flex items-center gap-2 mb-8 md:mb-12">
            <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center">
              <span className="text-white text-[11px] font-bold tracking-tighter">BIA</span>
            </div>
            <span className="text-sm font-medium tracking-tight">Compras</span>
          </div>

          <div className="relative z-10 flex h-full flex-col">
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-6">
              Progreso de la solicitud
            </h3>
            <ul className="space-y-7 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[2px] before:bg-slate-200 before:-z-10">
              {PASOS_SIDEBAR.map((paso) => {
                const isActive = progress.p === paso.id;
                const isDone = estado.paso > paso.id + 1 || (paso.id === 4 && progress.listo);
                return (
                  <li key={paso.id} className="relative flex items-center gap-4">
                    <span
                      className={
                        "absolute left-0 w-6 h-6 rounded-full border-[3px] border-white z-10 flex items-center justify-center transition-all duration-300 " +
                        (isDone
                          ? "bg-sky-500 shadow-sm"
                          : isActive
                            ? "bg-white ring-4 ring-sky-500/20"
                            : "bg-slate-200")
                      }
                    >
                      {isDone ? (
                        <svg className="text-white text-[10px]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 13l4 4L19 7"/></svg>
                      ) : isActive ? (
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                      ) : null}
                    </span>
                    <span
                      className={
                        "ml-10 text-sm transition-colors duration-300 " +
                        (isActive ? "font-semibold text-sky-600" : isDone ? "font-medium text-slate-900" : "text-slate-400 font-medium")
                      }
                    >
                      {paso.label}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto bg-white/60 p-4 rounded-xl border border-white flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600"><path d="M12 8v4l2.5 2.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/></svg>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Estado actual</span>
                <span
                  className={
                    "text-xs font-medium px-2 py-0.5 rounded " +
                    (progress.listo ? "text-green-700 bg-green-100" : "text-slate-900 bg-slate-100")
                  }
                >
                  {progress.listo ? "Enviada" : estado.paso >= 5 ? "Lista para envío" : "Borrador activo"}
                </span>
              </div>
            </div>
            {estado.paso < 6 ? (
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => guardarBorrador()}
                  className="w-full text-[11px] font-bold text-white bg-sky-600 hover:bg-sky-700 border border-sky-600 rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 transition-colors"
                >
                  {borradoAt ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
                      ¡Guardado!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
                      Guardar borrador
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  className="w-full text-[11px] font-semibold text-rose-600 hover:bg-rose-50 bg-rose-50/40 border border-rose-100 rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                  Cancelar y descartar
                </button>
                {borradoAt ? (
                  <p className="text-center text-[10px] text-green-600">Borrador guardado en este navegador.</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>

        {/* Main form area */}
        <section className="flex-1 p-5 md:p-8 relative overflow-y-auto no-scrollbar bg-white/30 flex flex-col">
          {estado.paso === 2 ? (
            <PasoCaptura estado={estado} set={set} siguiente={siguiente} pasoValido={pasoValido} />
          ) : estado.paso === 3 ? (
            <PasoClasificacion estado={estado} set={set} siguiente={siguiente} anterior={anterior} />
          ) : estado.paso === 4 ? (
            <PasoDetalles estado={estado} set={set} siguiente={siguiente} anterior={anterior} pasoValido={pasoValido} />
          ) : estado.paso === 5 ? (
            <PasoDocumento estado={estado} enviarSolicitud={enviarSolicitud} anterior={anterior} envio={envio} />
          ) : (
            <PasoConfirmacion estado={estado} />
          )}
        </section>
      </main>

      {confirmCancel ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmCancel(false)} />
          <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md relative z-10 p-6 md:p-8 step-enter">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
              <svg className="text-rose-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">Descartar la solicitud</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Vas a perder los datos de esta solicitud como borrador. Esta acción no se puede deshacer.
              ¿Continuar?
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmCancel(false)} className="flex-1 bg-white text-slate-700 text-xs px-4 py-3 rounded-full font-medium border border-slate-200 hover:bg-slate-50 transition-all">
                Seguir editando
              </button>
              <button type="button" onClick={cancelar} className="flex-1 bg-rose-600 text-white text-xs px-4 py-3 rounded-full font-medium hover:bg-rose-700 transition-all">
                Descartar y salir
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- STEP 2: Captura inicial ---------- */
function PasoCaptura({
  estado,
  set,
  siguiente,
  pasoValido,
}: {
  estado: ReturnType<typeof useSolicitudWizard>["estado"];
  set: ReturnType<typeof useSolicitudWizard>["set"];
  siguiente: () => void;
  pasoValido: boolean;
}) {
  return (
    <div className="flex flex-col h-full w-full step-enter">
      <div className="mb-6">
        <h2 className="text-2xl font-medium tracking-tight mb-1">¿Qué necesitás?</h2>
        <p className="text-xs text-slate-500">Describí brevemente tu solicitud.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 md:p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label htmlFor="titulo" className="block text-xs font-medium text-slate-700 mb-1.5">Título de la solicitud</label>
            <input id="titulo" type="text" value={estado.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ej. Sombrillas brandeadas — activación playa" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:bg-white transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Tipo de necesidad</label>
            <select value={estado.tipoNecesidad} onChange={(e) => set("tipoNecesidad", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:bg-white transition-all cursor-pointer">
              <option value="" disabled>Seleccioná una opción</option>
              <option>Empaque y branding</option>
              <option>Materia prima</option>
              <option>Servicios logísticos</option>
              <option>Administrativo</option>
              <option>Proyecto o CAPEX</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">¿Producto o servicio?</label>
            <div className="grid grid-cols-2 gap-2">
              {([["producto", "Producto"], ["servicio", "Servicio"]] as const).map(([val, label]) => (
                <label key={val} className="group cursor-pointer relative">
                  <input type="radio" name="prod_serv" checked={estado.subtipo === val} onChange={() => set("subtipo", val)} className="sr-only" />
                  <div className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center transition-all group-has-[:checked]:border-sky-500 group-has-[:checked]:bg-sky-500/5 group-has-[:checked]:ring-1 group-has-[:checked]:ring-sky-500/30">
                    <div className={"text-xs font-medium " + (estado.subtipo === val ? "text-sky-600" : "text-slate-600")}>{label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">¿Para cuándo lo necesitás?</label>
            <input type="date" value={estado.fechaRequerida} onChange={(e) => set("fechaRequerida", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:bg-white transition-all text-slate-600" />
            {estado.fechaRequerida && diasHasta(estado.fechaRequerida) < 5 ? (
              <p className="text-[10px] text-amber-600 mt-1.5 font-medium">Este plazo es muy corto para cotizar. ¿Es una urgencia real?</p>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Descripción breve</label>
            <textarea value={estado.descripcion} onChange={(e) => set("descripcion", e.target.value)} rows={2} placeholder="Añadí un poco más de contexto..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:bg-white transition-all resize-none" />
          </div>
        </div>
      </div>
      <div className="mt-auto flex justify-between items-center">
        <span className="text-xs font-medium text-slate-400">Área: {estado.area || "—"}</span>
        <button onClick={siguiente} disabled={!pasoValido} className="bg-slate-900 text-white text-xs px-6 py-3 rounded-full font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2">
          Continuar
          <svg className="text-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ---------- STEP 3: Clasificación ---------- */
function PasoClasificacion({
  estado,
  set,
  siguiente,
  anterior,
}: {
  estado: ReturnType<typeof useSolicitudWizard>["estado"];
  set: ReturnType<typeof useSolicitudWizard>["set"];
  siguiente: () => void;
  anterior: () => void;
}) {
  const opts = [
    { v: "RFI", sigla: "RFI", nombre: "Solicitud de Información", texto: "Todavía estoy explorando opciones, no sé qué existe en el mercado." },
    { v: "RFQ", sigla: "RFQ", nombre: "Solicitud de Cotización", texto: "Ya sé qué necesito, solo me falta comparar precio y tiempos." },
    { v: "RFP", sigla: "RFP", nombre: "Solicitud de Propuesta", texto: "Tengo un problema o proyecto amplio, busco que el proveedor proponga una solución." },
  ] as const;
  return (
    <div className="flex flex-col h-full w-full step-enter">
      <div className="mb-6">
        <h2 className="text-2xl font-medium tracking-tight mb-1">Clasificación de tu solicitud</h2>
        <p className="text-xs text-slate-500">Nuestro sistema ha analizado tus datos.</p>
      </div>
      <div className="bg-gradient-to-br from-white to-sky-50/50 rounded-2xl border border-slate-200/60 p-7 md:p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-full translate-x-4 -translate-y-4" />
        <div className="flex items-center gap-2 mb-5 relative z-10">
          <span className="bg-sky-500 text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
            Sugerencia IA
          </span>
          <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">Confianza Alta</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-medium tracking-tight mb-3 text-slate-900 relative z-10">
          Esto parece una <span className="font-semibold text-sky-600">{estado.clasificacion}</span>
        </h3>
        <p className="text-sm font-semibold text-slate-700 relative z-10 mb-2">
          {estado.clasificacion === "RFQ"
            ? "Solicitud de Cotización"
            : estado.clasificacion === "RFI"
              ? "Solicitud de Información"
              : "Solicitud de Propuesta"}
        </p>
        <p className="text-[13px] text-slate-500 relative z-10 max-w-md leading-loose">
          {estado.clasificacion === "RFQ"
            ? "Ya sabés exactamente qué necesitás — solo nos falta cotizar el precio con los proveedores del mercado."
            : estado.clasificacion === "RFI"
              ? "Todavía estás explorando qué existe en el mercado antes de decidir."
              : "Tenés un problema o proyecto amplio y buscás que un proveedor proponga la solución."}
        </p>
      </div>
      <p className="text-xs text-slate-600 mb-3 font-medium">¿No te parece correcto? Podés cambiarlo con un clic:</p>
      <div className="space-y-3 mb-6">
        {opts.map((o) => (
          <label key={o.v} className="group flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300 has-[:checked]:border-sky-500 has-[:checked]:ring-1 has-[:checked]:ring-sky-500/30 has-[:checked]:bg-sky-500/5 transition-all shadow-sm">
            <input type="radio" name="classif" checked={estado.clasificacion === o.v} onChange={() => { set("clasificacion", o.v); set("clasificacionCorregida", true); }} className="sr-only" />
            <div className={"mt-0.5 w-4 h-4 shrink-0 rounded-full border flex items-center justify-center transition-colors " + (estado.clasificacion === o.v ? "border-sky-500 bg-sky-500" : "border-slate-300")}>
              <div className="w-1.5 h-1.5 bg-white rounded-full" style={{ opacity: estado.clasificacion === o.v ? 1 : 0 }} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 leading-none mb-1.5">
                {o.sigla} <span className="text-xs text-slate-500 font-normal ml-1">— {o.nombre}</span>
              </div>
              <div className="text-[11px] text-slate-500">{"«" + o.texto + "»"}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-auto flex justify-between items-center">
        <button onClick={anterior} className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors px-2 py-2">Atrás</button>
        <button onClick={siguiente} className="bg-slate-900 text-white text-xs px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-all flex items-center gap-2">
          Confirmar clasificación
          <svg className="text-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ---------- STEP 4: Detalles técnicos ---------- */
function PasoDetalles({
  estado,
  set,
  siguiente,
  anterior,
  pasoValido,
}: {
  estado: ReturnType<typeof useSolicitudWizard>["estado"];
  set: ReturnType<typeof useSolicitudWizard>["set"];
  siguiente: () => void;
  anterior: () => void;
  pasoValido: boolean;
}) {
  return (
    <div className="flex flex-col h-full w-full step-enter">
      <div className="mb-6">
        <h2 className="text-2xl font-medium tracking-tight mb-1">Detalles para cotizar</h2>
        <p className="text-xs text-slate-500">Completá la información técnica requerida para tu solicitud.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 md:p-6 mb-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Dimensiones esperadas</label>
            <input type="text" placeholder="Ej. 2m x 2m, Talle M, etc." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:bg-white transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Materiales sugeridos</label>
            <input type="text" placeholder="Ej. Lona impermeable, cartón corrugado..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:bg-white transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Calidad requerida</label>
            <div className="grid grid-cols-2 gap-3">
              {[["estandar", "Estándar (Funcional)"], ["premium", "Premium (Alta gama)"]].map(([val, label]) => (
                <label key={val} className="group cursor-pointer relative">
                  <input type="radio" name="quality" defaultChecked={val === "estandar"} className="sr-only" />
                  <div className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-center transition-all group-has-[:checked]:border-slate-900 group-has-[:checked]:bg-slate-900">
                    <div className="text-xs font-medium text-slate-600 group-has-[:checked]:text-white">{label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
          <div>
            <div className="text-sm font-medium text-slate-900 mb-0.5">¿Lleva marca o branding?</div>
            <div className="text-[11px] text-slate-500 leading-tight">Material POP, uniformes, empaques, etc.</div>
          </div>
          <button
            type="button"
            aria-pressed={estado.llevaBranding}
            onClick={() => set("llevaBranding", !estado.llevaBranding)}
            className={"relative shrink-0 ml-4 w-10 h-5 rounded-full transition-colors " + (estado.llevaBranding ? "bg-sky-500" : "bg-slate-200")}
          >
            <span className={"absolute top-[2px] left-[2px] w-4 h-4 bg-white border border-slate-300 rounded-full transition-transform " + (estado.llevaBranding ? "translate-x-5" : "")} />
          </button>
        </label>
      </div>
      {estado.llevaBranding ? (
        <button
          type="button"
          onClick={() => set("archivoLogo", estado.archivoLogo ? "" : "logo_oficial.svg")}
          className={"border-2 border-dashed rounded-xl p-8 bg-white hover:bg-slate-50 transition-colors cursor-pointer mb-6 shadow-sm flex flex-col items-center justify-center " + (estado.archivoLogo ? "border-green-300 bg-green-50/50" : "border-slate-300")}
        >
          <div className={"w-12 h-12 rounded-full flex items-center justify-center mb-3 " + (estado.archivoLogo ? "bg-green-100" : "bg-slate-100")}>
            {estado.archivoLogo ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600"><path d="M5 13l4 4L19 7"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500"><path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16"/></svg>
            )}
          </div>
          <span className="text-sm font-medium text-slate-900 mb-1">{estado.archivoLogo || "Subir arte o logo oficial"}</span>
          <span className="text-[11px] text-slate-500 text-center max-w-xs leading-relaxed">
            Formatos aceptados: PNG, JPG, PDF, SVG, AI, EPS. <span className="font-semibold text-amber-600">Obligatorio</span> para que el proveedor use la versión correcta.
          </span>
        </button>
      ) : null}
      <div className="mt-auto flex justify-between items-center pt-4">
        <button onClick={anterior} className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors px-2 py-2">Atrás</button>
        <button onClick={siguiente} disabled={!pasoValido} className="bg-slate-900 text-white text-xs px-6 py-3 rounded-full font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2">
          Generar documento
          <svg className="text-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ---------- STEP 5: Documento ---------- */
function PasoDocumento({
  estado,
  enviarSolicitud,
  anterior,
  envio,
}: {
  estado: ReturnType<typeof useSolicitudWizard>["estado"];
  enviarSolicitud: () => void;
  anterior: () => void;
  envio: ReturnType<typeof useSolicitudWizard>["envio"];
}) {
  return (
    <div className="flex flex-col h-full w-full step-enter">
      <div className="mb-8">
        <h2 className="text-2xl font-medium tracking-tight mb-1">Tu solicitud está lista</h2>
        <p className="text-xs text-slate-500">Revisá el resumen antes de enviar a Compras.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative mx-auto w-full max-w-md overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-200 to-sky-500" />
        <div className="flex justify-between items-start mb-6 mt-2 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tighter">BIA</span>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Referencia Única</span>
              <span className="block text-sm font-mono font-semibold text-slate-900">RFQ-2026-014</span>
            </div>
          </div>
          <span className={tipoBadgeClases(estado.clasificacion)}>
            {estado.clasificacion}
          </span>
        </div>
        <div className="space-y-5">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Título de la Solicitud</span>
            <span className="text-sm font-medium text-slate-900 leading-snug">{estado.titulo || "—"}</span>
          </div>
          {estado.descripcion ? (
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Descripción</span>
              <span className="text-xs font-medium text-slate-700 leading-relaxed">{estado.descripcion}</span>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Solicitante</span>
              <span className="text-xs font-medium text-slate-900">{estado.nombre || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Área</span>
              <span className="text-xs font-medium text-slate-900">{estado.area || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Tipo de necesidad</span>
              <span className="text-xs font-medium text-slate-900">{estado.tipoNecesidad || "—"}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Fecha requerida</span>
              <span className="text-xs font-medium text-slate-900">{estado.fechaRequerida || "—"}</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-0.5 font-semibold">Clasificación Asignada</span>
              <span className="text-xs font-medium text-slate-900">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <span className={tipoDotClases(estado.clasificacion)} />
                  {estado.clasificacion}
                </span>{" "}
                — {tipoNombreCompleto(estado.clasificacion)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {envio.estado === "error" ? (
        <p role="alert" className="mb-4 text-[11px] text-rose-600">{envio.mensaje}</p>
      ) : null}
      <div className="mt-auto flex justify-between items-center">
        <button onClick={anterior} className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors px-2 py-2">Atrás</button>
        <button onClick={enviarSolicitud} disabled={envio.estado === "enviando"} className="bg-sky-500 text-white text-xs px-8 py-3 rounded-full font-medium hover:bg-sky-600 disabled:opacity-60 transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20">
          {envio.estado === "enviando" ? "Enviando..." : "Enviar solicitud"}
          <svg className="text-sm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ---------- STEP 6: Confirmación ---------- */
function PasoConfirmacion({ estado }: { estado: ReturnType<typeof useSolicitudWizard>["estado"] }) {
  const docUrl = estado.solicitudId ? `/api/solicitudes/${estado.solicitudId}/documento` : null;
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center py-10 step-enter">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-green-400 blur-xl opacity-20 rounded-full" />
        <div className="relative w-20 h-20 bg-green-50 border border-green-100 text-green-500 rounded-full flex items-center justify-center shadow-sm">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12l5 5L20 6"/></svg>
        </div>
      </div>
      <h2 className="text-3xl font-medium tracking-tight mb-3 text-slate-900">Tu solicitud fue enviada</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-sm leading-relaxed">
        Todo listo. Te avisaremos a <span className="font-semibold text-slate-800">{estado.email || "tu correo"}</span> en cuanto haya una comparativa lista para que decidas.
      </p>

      {docUrl ? (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm p-6 w-full max-w-md mx-auto text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Documento generado</span>
            <span className={tipoBadgeClases(estado.clasificacion)}>{estado.clasificacion}</span>
          </div>
          <div className="text-sm font-semibold text-slate-900 mb-1">{estado.titulo || "Solicitud"}</div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-5">
            <span className="inline-flex items-center gap-1.5">
              <span className={tipoDotClases(estado.clasificacion)} />{tipoNombreCompleto(estado.clasificacion)}
            </span>
            <span className="text-slate-300">•</span>
            <span>{estado.email || "—"}</span>
          </div>
          <div className="flex gap-2">
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-full font-medium hover:bg-slate-800 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"/></svg>
              Ver PDF
            </a>
            <a
              href={docUrl}
              download={`${estado.solicitudId}.pdf`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-slate-700 text-xs px-4 py-2.5 rounded-full font-medium hover:bg-slate-50 transition-all border border-slate-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Descargar
            </a>
          </div>
        </div>
      ) : null}

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-4 w-full max-w-xs text-left mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-700"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div>
          <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Coordinador asignado</span>
          <span className="text-sm font-medium text-slate-900">Equipo Compras BIA</span>
        </div>
      </div>
      <Link href={estado.email ? `/mis-solicitudes?email=${encodeURIComponent(estado.email)}` : "/mis-solicitudes"} className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M10 5 5 12l5 7"/></svg>
        Ver mis solicitudes
      </Link>
    </div>
  );
}

function diasHasta(fecha: string): number {
  const val = new Date(fecha);
  const hoy = new Date();
  return Math.ceil(Math.abs(val.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

// Badge de tipo de solicitud: RFQ = celeste, RFI = naranja, RFP = amarillo.
function tipoBadgeClases(tipo: string): string {
  if (tipo === "RFI") return "px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200";
  if (tipo === "RFP") return "px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200";
  return "px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200";
}

function tipoDotClases(tipo: string): string {
  if (tipo === "RFI") return "w-2 h-2 rounded-full bg-orange-400 inline-block";
  if (tipo === "RFP") return "w-2 h-2 rounded-full bg-amber-400 inline-block";
  return "w-2 h-2 rounded-full bg-sky-400 inline-block";
}

function tipoNombreCompleto(tipo: string): string {
  if (tipo === "RFQ") return "Solicitud de Cotización";
  if (tipo === "RFI") return "Solicitud de Información";
  return "Solicitud de Propuesta";
}