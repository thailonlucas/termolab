import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import { CheckCircle2, X } from "lucide-react";
import { useWizardState, wizardStore } from "@/lib/session-store";

export const Route = createFileRoute("/_authenticated/done")({
  component: Done,
});

function Done() {
  const { lastSavedSummary: s } = useWizardState();
  const navigate = useNavigate();

  if (!s) throw redirect({ to: "/" });

  function goHome() {
    wizardStore.reset();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="safe-top page-pad flex justify-end">
        <button onClick={goHome} className="p-2 rounded-full hover:bg-muted">
          <X size={22} />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center page-pad text-center">
        <span className="w-20 h-20 rounded-full bg-success/15 text-success flex items-center justify-center">
          <CheckCircle2 size={44} />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Sessão concluída</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Caixa <span className="font-medium text-foreground">{s.boxId}</span> — sessão registrada
          com {s.movementCount} movimentações e {s.photoCount} fotos.
        </p>

        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {s.finalTemp != null && (
            <span className="chip" style={{ background: "color-mix(in oklch, var(--color-success) 18%, transparent)" }}>
              Temp. final {s.finalTemp.toFixed(1)}°C
            </span>
          )}
          <span className="chip">Enviado para aprovação</span>
        </div>
      </div>

      <div className="page-pad safe-bottom space-y-2">
        <Link
          to="/history"
          params={{ handlingId: s.handlingId }}
          onClick={() => wizardStore.reset()}
          className="btn-primary w-full"
        >
          Histórico de manuseios
        </Link>
        <button onClick={goHome} className="btn-ghost w-full">
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
