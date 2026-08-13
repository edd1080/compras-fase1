import { AdminShell } from "@/components/ui-ext/AdminShell";

export default function AdminAjustesPage() {
  return (
    <AdminShell title="Ajustes de Perfil" subtitle="Configura tus preferencias y datos personales.">
      <div className="max-w-3xl bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-6 md:p-8">
        <form className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nombre Completo</label>
            <input type="text" defaultValue="Lady" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
            <input type="email" defaultValue="admin@bia.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contraseña</label>
            <input type="password" defaultValue="********" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rol</label>
            <input type="text" defaultValue="Administración" disabled className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed" />
          </div>
          <div className="pt-4 flex justify-end">
            <button type="button" className="bg-sky-600 text-white text-sm px-6 py-2.5 rounded-xl font-medium hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}