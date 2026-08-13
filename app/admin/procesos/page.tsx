import { AdminShell } from "@/components/ui-ext/AdminShell";

const COLUMNS = [
  {
    tipo: "rfq", titulo: "Cotización (RFQ)", dot: "bg-amber-400", count: 3,
    cards: [
      { ref: "RFQ-2026-014", prioridad: "Alta", prioridadTone: "text-sky-600 bg-sky-50 border-sky-100", titulo: "Sombrillas brandeadas — activación playa", inicial: "CO", inicialBg: "bg-sky-100 text-sky-700", tiempo: "Hace 2 d" },
      { ref: "RFQ-2026-015", prioridad: "Media", prioridadTone: "text-slate-600 bg-slate-50 border-slate-200", titulo: "Equipos de cómputo para nuevo ingreso", inicial: "MG", inicialBg: "bg-emerald-100 text-emerald-700", tiempo: "Hace 4 h" },
    ],
  },
  {
    tipo: "rfi", titulo: "Información (RFI)", dot: "bg-sky-400", count: 2,
    cards: [
      { ref: "RFI-2026-009", prioridad: "Urgente", prioridadTone: "text-rose-600 bg-rose-50 border-rose-100", titulo: "Materia Prima - Empaques biodegradables", inicial: "MG", inicialBg: "bg-emerald-100 text-emerald-700", tiempo: "Hace 1 d" },
    ],
  },
  {
    tipo: "rfp", titulo: "Propuesta (RFP)", dot: "bg-emerald-400", count: 1,
    cards: [
      { ref: "RFP-2026-002", prioridad: "Media", prioridadTone: "text-slate-600 bg-slate-50 border-slate-200", titulo: "Agencia de Marketing Anual 2026", inicial: "LF", inicialBg: "bg-purple-100 text-purple-700", tiempo: "Hace 5 d" },
    ],
  },
];

export default function AdminProcesosPage() {
  return (
    <AdminShell title="Procesos de Compras" subtitle="Gestión y estado de todas las solicitudes activas.">
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <button className="bg-sky-600 text-white text-[11px] font-semibold uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-sky-700 shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo Proceso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <div key={col.tipo} className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className={"w-2 h-2 rounded-full " + col.dot}></span>
                {col.titulo}
              </h3>
              <span className="text-[10px] font-semibold bg-white text-slate-500 px-2 py-1 rounded-lg border border-slate-200/60 shadow-sm">{col.count}</span>
            </div>
            <div className="space-y-3">
              {col.cards.map((card) => (
                <div key={card.ref} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:border-sky-300 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-semibold text-slate-900">{card.ref}</span>
                    <span className={"text-[10px] font-medium px-2 py-0.5 rounded border " + card.prioridadTone}>{card.prioridad}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">{card.titulo}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className={"w-6 h-6 rounded-full flex items-center justify-center border-2 border-white text-[9px] font-semibold " + card.inicialBg}>{card.inicial}</div>
                    <span className="text-[10px] text-slate-400 font-medium">{card.tiempo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}