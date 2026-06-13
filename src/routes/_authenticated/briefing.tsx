import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { wizardStore, useWizardState } from "@/lib/session-store";
import { Camera, Thermometer, ListPlus, ArrowRight, ScanBarcode, QrCode } from "lucide-react";

export const Route = createFileRoute("/_authenticated/briefing")({
  component: Briefing,
});

function Briefing() {
  const { box } = useWizardState();
  const navigate = useNavigate();

  if (!box) {
    throw redirect({ to: "/new-box" });
  }

  return (
    <div>
      <PageHeader title="Nova manutenção" />

      <div className="page-pad pb-32">
        <div className="card-dark p-5">
          <p className="text-xs opacity-70 uppercase tracking-wider">Caixa</p>
          <p className="text-2xl font-semibold mt-1">NF {box.nf_key}</p>
          {box.sender && <p className="opacity-80 mt-1">{box.sender}</p>}

          <div className="flex flex-wrap gap-2 mt-4">
            {box.nf_key && (
              <span className="chip bg-white/10 text-white text-sm"><QrCode size={18}/>{box.box_id}</span>
            )}
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          <Bullet icon={Camera}>Documente cada etapa com foto.</Bullet>
          <Bullet icon={Thermometer}>Registre a temperatura quando solicitado.</Bullet>
          <Bullet icon={ListPlus}>Adicione quantas movimentações forem necessárias.</Bullet>
        </ul>

        <div className="mt-4 rounded-xl border border-border p-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Protocolos do cliente:</span> os documentos
          e regras serão exibidos quando o medicamento estiver vinculado a um protocolo cadastrado.
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 safe-bottom px-5 pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          <button
            className="btn-primary w-full"
            onClick={() => {
              // Clear any leftover movements from a previous draft
              const cur = wizardStore.get();
              if (cur.movements.length) {
                cur.movements.forEach((m) => wizardStore.removeMovement(m.localId));
              }
              navigate({ to: "/wizard" });
            }}
          >
            Iniciar <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Bullet({ icon: Icon, children }: { icon: typeof Camera; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mt-0.5">
        <Icon size={18} />
      </span>
      <p className="text-sm leading-snug pt-1.5">{children}</p>
    </li>
  );
}
