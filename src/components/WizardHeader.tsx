import { X } from "lucide-react";

export function WizardHeader({
  boxId,
  nfKey,
  sender,
  movementCount,
  onCancel,
}: {
  boxId: string;
  nfKey: string;
  sender: string;
  movementCount: number;
  onCancel: () => void;
}) {
  return (
    <header className="safe-top page-pad pb-4 border-b border-border/50">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 mt-[3px]" />
          <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            Sessão ativa
          </span>
        </div>
        <button
          aria-label="Cancelar sessão"
          onClick={onCancel}
          className="-mr-1 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight leading-tight truncate">
            {boxId}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {sender}
            {nfKey ? <span className="text-muted-foreground/60"> · NF {nfKey}</span> : null}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end">
          <span className="text-xl font-bold leading-none">{movementCount}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
            {movementCount === 1 ? "etapa" : "etapas"}
          </span>
        </div>
      </div>
    </header>
  );
}
