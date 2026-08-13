import { AdminSidebar } from "./AdminSidebar";
import { AmbientBackground } from "./AmbientBackground";

type AdminShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AdminShell({ title, subtitle, children }: AdminShellProps) {
  return (
    <main className="min-h-screen flex p-0 relative overflow-hidden">
      <AmbientBackground />
      <AdminSidebar />
      <section className="flex-1 p-0 relative overflow-hidden bg-white/30 flex flex-col min-h-screen">
        <header className="shrink-0 relative overflow-hidden border-b border-white/60">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-100/80 via-white/50 to-emerald-100/50" />
          <div className="relative px-6 md:px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-700"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
              </div>
              <span className="text-xs font-semibold text-slate-800">Lady Matute</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-8 py-8">{children}</div>
      </section>
    </main>
  );
}