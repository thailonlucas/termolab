interface OptionTileProps {
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}

export function OptionTile({ label, sub, active, onClick }: OptionTileProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl p-4 flex flex-col items-center gap-1 border-2 transition active:scale-[0.97] ${
        active ? "border-primary bg-primary/10" : "border-border bg-muted/40"
      }`}
    >
      <span className={`text-2xl font-bold ${active ? "text-primary" : ""}`}>{label}</span>
      <span className="text-[11px] text-muted-foreground">{sub}</span>
    </button>
  );
}
