import { Link, useLocation } from "@tanstack/react-router";
import { Home, History, Plus } from "lucide-react";
import { usePlusAction } from "@/lib/plus-action-store";

const items = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/history", icon: History, label: "Histórico" },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const plusAction = usePlusAction();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 safe-bottom bg-background/95 backdrop-blur border-t border-border">
      <div className="mx-auto max-w-md flex items-stretch justify-around px-2 pt-2">
        {items.slice(0, 1).map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="flex-1 flex flex-col items-center gap-1 py-2 text-xs"
              style={{ color: active ? "var(--color-ink)" : "var(--color-muted-foreground)" }}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
              <span style={{ fontWeight: active ? 600 : 500 }}>{it.label}</span>
            </Link>
          );
        })}
        {plusAction ? (
          <button
            onClick={plusAction}
            className="flex flex-col items-center gap-1 py-1"
            aria-label="Nova manutenção"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-ink text-primary-foreground shadow-lg">
              <Plus size={26} strokeWidth={2.4} />
            </span>
          </button>
        ) : (
          <Link
            to="/new-box"
            className="flex flex-col items-center gap-1 py-1"
            aria-label="Novo manuseio"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-ink text-primary-foreground shadow-lg">
              <Plus size={26} strokeWidth={2.4} />
            </span>
          </Link>
        )}
        {items.slice(1).map((it) => {
          const active = pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="flex-1 flex flex-col items-center gap-1 py-2 text-xs"
              style={{ color: active ? "var(--color-ink)" : "var(--color-muted-foreground)" }}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
              <span style={{ fontWeight: active ? 600 : 500 }}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
