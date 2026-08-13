"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/design/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "M4 20V10M10 20V4M16 20v-6M22 20H2" },
  { href: "/admin/procesos", label: "Procesos", icon: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5" },
  { href: "/admin/coordinadores", label: "Coordinadores", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { href: "/admin/configuracion", label: "Configuración", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.12-1.45l2.1-1.64-2-3.46-2.48 1a7.4 7.4 0 0 0-2.5-1.45L14.2 2h-4l-.2 2.5a7.4 7.4 0 0 0-2.5 1.45l-2.48-1-2 3.46 2.1 1.64A7.4 7.4 0 0 0 4.6 12a7.4 7.4 0 0 0 .12 1.45l-2.1 1.64 2 3.46 2.48-1a7.4 7.4 0 0 0 2.5 1.45L10.2 22h4l.2-2.5a7.4 7.4 0 0 0 2.5-1.45l2.48 1 2-3.46-2.1-1.64A7.4 7.4 0 0 0 19.4 12z" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d={d} />
    </svg>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex shrink-0 w-64 border-r border-white/60 bg-white/40 relative z-20 flex-col py-8 px-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center shadow-sm shadow-sky-600/20">
          <span className="text-white text-[13px] font-semibold tracking-tight">BIA</span>
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-slate-900">Admin Panel</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Trazabilidad</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs transition-colors",
                active ? "bg-slate-900 text-white shadow-sm font-semibold" : "text-slate-600 hover:bg-white/60 hover:text-slate-900 font-medium"
              )}
            >
              <span className="text-lg"><Icon d={item.icon} /></span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 border-t border-white/60">
        <div className="flex items-center gap-3 hover:bg-white/50 p-2 -ml-2 rounded-xl transition-colors">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-900">Lady (Admin)</div>
            <div className="text-[10px] text-slate-500">Administración</div>
          </div>
        </div>
      </div>
    </aside>
  );
}