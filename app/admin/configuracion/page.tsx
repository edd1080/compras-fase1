import { AdminShell } from "@/components/ui-ext/AdminShell";

export default function AdminConfiguracionPage() {
  return (
    <AdminShell title="Configuración" subtitle="Administra las preferencias y reglas del sistema de compras.">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 shrink-0 space-y-1.5">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-sm font-semibold text-xs transition-colors text-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            General
          </button>
          {[["Notificaciones", "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 0l8 6 8-6"], ["Reglas de Aprobación", "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"], ["Integraciones", "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c3 3 4.5 6.5 4.5 10S15 19 12 22c-3-3-4.5-6.5-4.5-10S9 5 12 2z"]].map(([label, d]) => (
            <button key={label} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-white/60 hover:text-slate-900 font-medium text-xs transition-colors text-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={d}/></svg>
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 lg:p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Ajustes Generales</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-4">Tiempos de Resolución (SLAs)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Límite de días RFQ</label>
                  <input type="number" defaultValue={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Límite de días RFI/RFP</label>
                  <input type="number" defaultValue={10} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
                </div>
              </div>
            </div>
            <hr className="border-slate-100" />
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-4">Opciones del Sistema</h4>
              <div className="space-y-4">
                <Toggle checked label="Asignación automática de solicitudes (Round-Robin)" />
                <Toggle checked label="Requerir 3 cotizaciones mínimo (Monto > $1000)" />
                <Toggle label="Alertar 24h antes del vencimiento del SLA" />
              </div>
            </div>
            <div className="pt-6 flex justify-end">
              <button className="bg-sky-600 text-white text-[11px] font-semibold uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-sky-700 shadow-sm shadow-sky-600/20 transition-all">Guardar Configuración</button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Toggle({ checked, label }: { checked?: boolean; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" defaultChecked={checked} className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600/30" />
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </label>
  );
}