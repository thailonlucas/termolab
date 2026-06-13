import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type React from "react";
import { CameraCapture } from "@/components/CameraCapture";
import { WizardHeader } from "@/components/WizardHeader";
import { EmptyState } from "@/components/EmptyState";
import { IconBox } from "@/components/IconBox";
import { BottomBar } from "@/components/BottomBar";
import { BottomSheet } from "@/components/BottomSheet";
import { OptionTile } from "@/components/OptionTile";
import {
  wizardStore,
  useWizardState,
  type DraftMovement,
} from "@/lib/session-store";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { saveHandling } from "@/lib/handling-api";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import {
  Thermometer as ThermoIcon,
  Plus,
  Trash2,
  ChevronLeft,
  RouteIcon,
  HelpCircle,
  CheckCircle2,
  CalendarClock,
} from "lucide-react";

type NextMaintenanceOption = "6" | "24" | "48" | "none" | "custom";

const PRESET_OPTIONS: {
  value: Exclude<NextMaintenanceOption, "custom" | "none">;
  label: string;
  sub: string;
}[] = [
  { value: "24", label: "24h", sub: "Daqui 24 horas" },
  { value: "48", label: "48h", sub: "Daqui 48 horas" },
];

function DynamicIcon({ name, size = 20 }: { name?: string | null; size?: number }) {
  if (name) {
    const Icon = (LucideIcons as Record<string, unknown>)[name] as
      | React.ElementType
      | undefined;
    if (Icon) return <Icon size={size} />;
  }
  return <HelpCircle size={size} />;
}

export const Route = createFileRoute("/_authenticated/wizard")({
  component: Wizard,
});

type MovementType = {
  id: string;
  name: string;
  label: string;
  description: string | null;
  requires_photo: boolean;
  requires_temperature: boolean;
  icon: string | null;
};

type FlowStep =
  | { kind: "list" }
  | { kind: "picker" }
  | { kind: "camera"; type: MovementType };

function Wizard() {
  const { box, movements } = useWizardState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<FlowStep>({ kind: "list" });
  const [saving, setSaving] = useState(false);
  const [tempValue, setTempValue] = useState(2);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [nextOption, setNextOption] = useState<NextMaintenanceOption>("24");
  const [customHours, setCustomHours] = useState("");

  if (!box) {
    throw redirect({ to: "/new-box" });
  }
  const boxData = box;

  const { data: types = [] } = useQuery({
    queryKey: ["movement-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movement_types")
        .select("id, name, label, description, requires_photo, requires_temperature, icon")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as MovementType[];
    },
  });

  function pickType(t: MovementType) {
    if (t.requires_photo) {
      setFlow({ kind: "camera", type: t });
    } else {
      commit(t);
    }
  }

  function commit(t: MovementType, opts?: { photoDataUrl?: string }) {
    const m: DraftMovement = {
      localId: crypto.randomUUID(),
      movementTypeId: t.id,
      movementTypeName: t.name,
      movementTypeLabel: t.label,
      occurredAt: new Date().toISOString(),
      photoDataUrl: opts?.photoDataUrl,
      temperature: t.requires_temperature ? tempValue : null,
    };
    wizardStore.addMovement(m);
    setFlow({ kind: "list" });
  }

  function computeNextMaintenanceAt(): string | null {
    if (nextOption === "none") return null;
    const hours = nextOption === "custom" ? Number(customHours) : Number(nextOption);
    if (!hours || isNaN(hours)) return null;
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }

  async function finalize() {
    if (!user) return;
    setSaving(true);
    setShowFinalizeModal(false);
    try {
      const nextMaintenanceAt = computeNextMaintenanceAt();
      const result = await saveHandling(boxData, movements, user.id, nextMaintenanceAt);
      wizardStore.setSummary({
        handlingId: result.handlingId,
        sessionId: result.sessionId,
        boxId: boxData.box_id,
        movementCount: result.movementCount,
        photoCount: result.photoCount,
        finalTemp: result.finalTemp,
      });
      navigate({ to: "/done" });
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Falha ao salvar sessão");
      setSaving(false);
    }
  }

  // ===== Sub-flows =====
  if (flow.kind === "camera") {
    return (
      <CameraCapture
        mode="photo"
        boxId={boxData.box_id}
        stageLabel={flow.type.label.toUpperCase()}
        onClose={() => setFlow({ kind: "list" })}
        onCapture={({ dataUrl }) => {
          commit(flow.type, { photoDataUrl: dataUrl });
        }}
        thermoValue={tempValue}
        onThermoChange={setTempValue}
      />
    );
  }

  if (flow.kind === "picker") {
    return (
      <div className="min-h-screen bg-background">
        <header className="safe-top page-pad pb-3 flex items-center">
          <button onClick={() => setFlow({ kind: "list" })} className="p-2 -ml-2">
            <ChevronLeft size={22} />
          </button>
          <h2 className="ml-1 font-semibold text-lg">Tipo de movimentação</h2>
        </header>

        <div className="page-pad pb-10 grid grid-cols-2 gap-3">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => pickType(t)}
              className="card-soft aspect-square flex flex-col items-center justify-center gap-3 p-4 active:scale-[0.97] transition"
            >
              <DynamicIcon name={t.icon} size={26} />
              <p className="font-semibold text-sm text-center leading-tight">{t.label}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // List mode
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WizardHeader
        boxId={boxData.box_id}
        nfKey={boxData.nf_key}
        sender={boxData.sender}
        movementCount={movements.length}
        onCancel={() => {
          if (confirm("Cancelar sessão? As movimentações em rascunho serão perdidas.")) {
            wizardStore.reset();
            navigate({ to: "/" });
          }
        }}
      />

      <div className="page-pad flex-1 flex flex-col h-full pb-30">
        {movements.length === 0 ? (
          <EmptyState
            fill
            icon={RouteIcon}
            title="Nenhuma movimentação ainda."
            subtitle='Toque em "Adicionar movimentação".'
          />
        ) : (
          <ul className="space-y-2 mt-2">
            {movements.map((m) => (
              <li key={m.localId} className="card-soft p-3 flex items-center gap-3">
                {m.photoDataUrl ? (
                  <img
                    src={m.photoDataUrl}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <IconBox size="lg">
                    <ThermoIcon size={18} />
                  </IconBox>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{m.movementTypeLabel}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(m.occurredAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {m.temperature != null && ` · ${m.temperature.toFixed(1)}°C`}
                  </p>
                </div>
                <button
                  aria-label="Remover"
                  onClick={() => wizardStore.removeMovement(m.localId)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomBar>
        <button
          disabled={movements.length === 0 || saving}
          onClick={() => setShowFinalizeModal(true)}
          className={`border rounded-lg border-primary flex-1 ${
            movements.length === 0 || saving ? "btn-primary-disabled" : ""
          }`}
        >
          {saving ? "Salvando..." : "Finalizar sessão"}
        </button>
        <button
          onClick={() => setFlow({ kind: "picker" })}
          className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 active:scale-95 transition"
        >
          <Plus size={22} />
        </button>
      </BottomBar>

      <BottomSheet
        open={showFinalizeModal}
        onClose={() => setShowFinalizeModal(false)}
        title="Finalizar sessão"
        description="Tudo certo? Podemos finalizar esta sessão de manuseio."
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Próxima manutenção
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {PRESET_OPTIONS.map((opt) => (
            <OptionTile
              key={opt.value}
              label={opt.label}
              sub={opt.sub}
              active={nextOption === opt.value}
              onClick={() => setNextOption(opt.value)}
            />
          ))}
          <OptionTile
            label="0h"
            sub="Não há"
            active={nextOption === "none"}
            onClick={() => setNextOption("none")}
          />
          <OptionTile
            label={customHours ? `${customHours}h` : "?h"}
            sub="Personalizado"
            active={nextOption === "custom"}
            onClick={() => setNextOption("custom")}
          />
        </div>

        {nextOption === "custom" && (
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1 block">
              Quantidade de horas
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Ex: 12"
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
              className="w-full h-16 rounded-2xl bg-muted border border-border text-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {nextOption !== "none" && (
          <div className="rounded-xl bg-muted px-4 py-3 flex items-center gap-2 mt-2">
            <CalendarClock size={14} className="text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Próxima sessão:{" "}
              <span className="font-semibold text-foreground">
                {(() => {
                  const iso = computeNextMaintenanceAt();
                  if (!iso) return "—";
                  return new Date(iso).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                })()}
              </span>
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setShowFinalizeModal(false)}
            className="flex-1 h-14 rounded-2xl border border-border text-sm font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={finalize}
            disabled={saving || (nextOption === "custom" && !customHours)}
            className="flex-1 h-14 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.97] transition"
          >
            <CheckCircle2 size={18} />
            Confirmar
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
