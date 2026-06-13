import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  fill?: boolean;
  className?: string;
}

export function EmptyState({ icon: Icon, title, subtitle, fill, className }: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-border text-center ${
        fill
          ? "flex-1 flex flex-col items-center justify-center p-10 min-h-full mt-8"
          : "p-6"
      } ${className ?? ""}`}
    >
      <Icon className="mx-auto text-muted-foreground" size={26} />
      <p className="mt-2 text-sm text-muted-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
