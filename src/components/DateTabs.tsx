type DateTab = {
  id: string;
  startedAt: string;
};

type Props = {
  tabs: DateTab[];
  selectedId: string | null | undefined;
  onSelect: (id: string) => void;
  loading?: boolean;
  emptyLabel?: string;
};

function fmt(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function DateTabs({ tabs, selectedId, onSelect, loading, emptyLabel }: Props) {
  if (loading) {
    return (
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 w-16 rounded-xl bg-muted animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  if (tabs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyLabel ?? "Nenhum item."}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
      {tabs.map((tab) => {
        const isSelected = tab.id === selectedId;
        const { date, time } = fmt(tab.startedAt);
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="shrink-0 flex flex-col items-center justify-center rounded-xl px-4 py-2.5 min-w-[64px] transition-colors"
            style={
              isSelected
                ? { background: "#000", border: "1.5px solid #000", color: "#fff" }
                : { background: "transparent", border: "1.5px solid var(--color-border)", color: "var(--color-foreground)" }
            }
          >
            <span className="text-sm font-bold leading-none">{date}</span>
            <span className="text-[10px] mt-1 opacity-60">{time}</span>
          </button>
        );
      })}
    </div>
  );
}
