import { CalendarClock } from "lucide-react";

export function isWithin2Hours(iso: string | null): boolean {
  if (!iso) return false;
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff <= 2 * 60 * 60 * 1000;
}

type Props = { iso: string | null };

export function NextSession({ iso }: Props) {
  if (!iso) return null;

  const date = new Date(iso);
  const now = new Date();
  const overdue = date < now;
  const urgent = isWithin2Hours(iso);

  const label = date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const color = overdue ? "var(--color-destructive, #ef4444)" : "var(--color-muted-foreground)";

  return (
    <span
      className={`flex items-center gap-1 text-[11px] mt-0.5 ${urgent ? "font-semibold" : ""}`}
      style={{ color }}
    >
      <CalendarClock size={11} />
      {overdue ? `Atrasada · ${label}` : `Próxima · ${label}`}
    </span>
  );
}
