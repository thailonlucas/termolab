import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
}

export function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <div className="card-soft p-3">
      <Icon size={16} className="text-muted-foreground" />
      <p className="text-[11px] text-muted-foreground mt-2">{label}</p>
      <p className="text-lg font-semibold leading-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
