"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/design/cn";
import type { RolUsuario } from "@/lib/domain/types";

export type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

type SidebarProps = {
  items: NavItem[];
  activeHref?: string;
  activeHrefMatcher?: (pathname: string, href: string) => boolean;
  footer?: React.ReactNode;
};

function NavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-card px-3 py-2.5 text-[13.5px] font-medium transition-colors",
        active
          ? "bg-azul-claro text-azul-marino"
          : "text-texto-secundario hover:bg-azul-tenue hover:text-azul-marino"
      )}
    >
      {item.icon ? <span className="shrink-0 text-[15px]">{item.icon}</span> : null}
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar({
  items,
  activeHref,
  activeHrefMatcher,
  footer,
}: SidebarProps) {
  const pathname = usePathname();
  const match = activeHrefMatcher ?? ((p, h) => p === h || p.startsWith(h + "/"));
  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-borde bg-superficie md:flex">
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Navegación principal">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={match(pathname, activeHref ?? item.href) && pathname.startsWith(item.href === "/" ? "/" : item.href)}
          />
        ))}
      </nav>
      {footer ? <div className="border-t border-borde px-4 py-3">{footer}</div> : null}
    </aside>
  );
}

type AppShellProps = {
  titulo: string;
  subtitulo?: string;
  eyebrow?: string;
  navItems: NavItem[];
  activeHref: string;
  activeHrefMatcher?: (pathname: string, href: string) => boolean;
  rol: RolUsuario;
  usuarioNombre: string;
  children: React.ReactNode;
};

export function AppShell({
  titulo,
  subtitulo,
  eyebrow,
  navItems,
  activeHref,
  activeHrefMatcher,
  rol,
  usuarioNombre,
  children,
}: AppShellProps) {
  const router = useRouter();
  const salir = () => router.push("/");
  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={navItems}
        activeHref={activeHref}
        activeHrefMatcher={activeHrefMatcher}
        footer={<AppUser name={usuarioNombre} onSalir={salir} />}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-borde bg-fondo/90 px-8 py-5 backdrop-blur">
          <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-azul-claro px-2.5 py-1 font-mono text-[11px] text-azul-medio">
            {eyebrow ?? rol}
          </span>
          <h1 className="display-lg">{titulo}</h1>
          {subtitulo ? <p className="mt-1 text-[13.5px] text-texto-secundario">{subtitulo}</p> : null}
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}

function AppUser({ name, onSalir }: { name: string; onSalir: () => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-azul-marino font-display text-[11px] font-semibold text-white">
        {name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("")}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold">{name}</div>
        <button
          type="button"
          onClick={onSalir}
          className="text-[11.5px] text-texto-terciario hover:text-azul-medio"
        >
          Salir al portal
        </button>
      </div>
    </div>
  );
}