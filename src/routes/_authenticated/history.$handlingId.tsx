import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { DateTabs } from "@/components/DateTabs";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/handling-api";
import { wizardStore } from "@/lib/session-store";
import { plusActionStore } from "@/lib/plus-action-store";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Thermometer as ThermoIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ImageOff,
  Clock,
  Timer,
  Image as ImageIcon,
  QrCode,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/history/$handlingId")({
  component: HandlingDetail,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type MovementFile = { id: string; storage_path: string };
type MovementType = { label: string; name: string };
type Movement = {
  id: string;
  occurred_at: string;
  temperature_val: number | null;
  notes: string | null;
  movement_types: MovementType | null;
  movement_files: MovementFile[];
};
type Session = {
  id: string;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  status: string | null;
  approved_by: string | null;
  movements: Movement[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmtDateFull(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}


function durationMin(start: string, end: string | null) {
  if (!end) return null;
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (diff < 1) return "< 1 min";
  if (diff < 60) return `${diff} min`;
  return `${Math.floor(diff / 60)}h ${diff % 60}min`;
}

function movementTypeLabel(movement_types: MovementType | null): string {
  return movement_types?.label ?? "";
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

type LightboxState = { movements: any[]; index: number };

function Lightbox({
  state,
  onClose,
  onChange,
}: {
  state: LightboxState;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const movement = state.movements[state.index];
  const file = movement?.movement_files?.[0];
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) { setUrl(null); return; }
    setLoading(true);
    let cancelled = false;
    getSignedUrl(file.storage_path)
      .then((u) => { if (!cancelled) { setUrl(u); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [file?.storage_path]);

  const hasPrev = state.index > 0;
  const hasNext = state.index < state.movements.length - 1;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onChange(state.index - 1);
      if (e.key === "ArrowRight" && hasNext) onChange(state.index + 1);
    },
    [onClose, onChange, hasPrev, hasNext, state.index],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!movement) return null;
  const label = movementTypeLabel(movement.movement_types);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black" onClick={onClose}>
      <div
        className="flex items-center justify-between px-4 pt-10 pb-3"
        style={{ background: "linear-gradient(to bottom,rgba(0,0,0,.75),transparent)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="font-semibold text-white text-sm">{label || "Movimentação"}</p>
          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "rgba(255,255,255,.6)" }}>
            <Clock size={11} />
            {fmtTime(movement.occurred_at)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,.1)" }}
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center" onClick={onClose}>
        {loading && (
          <div className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(255,255,255,.3)", borderTopColor: "white" }} />
        )}
        {!loading && url && (
          <img src={url} alt={label} className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()} />
        )}
        {!loading && !url && (
          <div className="flex flex-col items-center gap-3" style={{ color: "rgba(255,255,255,.4)" }}>
            <ImageOff size={40} />
            <p className="text-sm">Sem foto</p>
          </div>
        )}
        {hasPrev && (
          <button onClick={(e) => { e.stopPropagation(); onChange(state.index - 1); }}
            className="absolute left-3 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,.5)" }}>
            <ChevronLeft size={22} className="text-white" />
          </button>
        )}
        {hasNext && (
          <button onClick={(e) => { e.stopPropagation(); onChange(state.index + 1); }}
            className="absolute right-3 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,.5)" }}>
            <ChevronRight size={22} className="text-white" />
          </button>
        )}
      </div>

      <div className="px-4 pb-10 pt-3"
        style={{ background: "linear-gradient(to top,rgba(0,0,0,.75),transparent)" }}
        onClick={(e) => e.stopPropagation()}>
        {movement.temperature_val != null && (
          <div className="flex items-center gap-1.5 mb-3">
            <ThermoIcon size={14} style={{ color: "rgba(255,255,255,.6)" }} />
            <span className="text-white font-semibold">
              {Number(movement.temperature_val).toFixed(1)}°C
            </span>
          </div>
        )}
        {state.movements.length > 1 && (
          <div className="flex justify-center gap-1.5">
            {state.movements.map((_: any, i: number) => (
              <button key={i} onClick={() => onChange(i)} style={{
                width: i === state.index ? 16 : 6,
                height: 6, borderRadius: 3,
                background: i === state.index ? "white" : "rgba(255,255,255,.3)",
                transition: "width .15s",
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Movement Card ────────────────────────────────────────────────────────────

function MovementCard({
  movement,
  onTapPhoto,
}: {
  movement: any;
  onTapPhoto: () => void;
}) {
  const file = movement.movement_files?.[0];
  const [url, setUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    if (!file) return;
    setLoadingUrl(true);
    let cancelled = false;
    getSignedUrl(file.storage_path)
      .then((u) => { if (!cancelled) { setUrl(u); setLoadingUrl(false); } })
      .catch(() => { if (!cancelled) setLoadingUrl(false); });
    return () => { cancelled = true; };
  }, [file?.storage_path]);

  const label = movementTypeLabel(movement.movement_types);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-muted)" }}>
      {file ? (
        <button
          onClick={onTapPhoto}
          className="w-full relative active:opacity-90 transition-opacity"
          style={{ aspectRatio: "16/9", display: "block" }}
        >
          {loadingUrl ? (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: "var(--color-muted)" }}>
              <div className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-foreground)" }} />
            </div>
          ) : url ? (
            <img src={url} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: "var(--color-muted)" }}>
              <ImageOff size={28} className="text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-[10px] font-medium text-white flex items-center gap-1"
            style={{ background: "rgba(0,0,0,.5)" }}>
            <ImageIcon size={10} /> Ver foto
          </div>
        </button>
      ) : (
        <div className="flex items-center justify-center"
          style={{ aspectRatio: "16/9", background: "var(--color-muted)" }}>
          <ThermoIcon size={32} className="text-muted-foreground" />
        </div>
      )}

      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{label || "Movimentação"}</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            {fmtTime(movement.occurred_at)}
          </p>
        </div>
        {movement.temperature_val != null && (
          <span className="text-sm font-semibold flex items-center gap-1 shrink-0">
            <ThermoIcon size={14} className="text-muted-foreground" />
            {Number(movement.temperature_val).toFixed(1)}°C
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function HandlingDetail() {
  const { handlingId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data: handling } = useQuery<any>({
    queryKey: ["handling", handlingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handlings")
        .select("*, owners(name)")
        .eq("id", handlingId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: movementSessions, isLoading } = useQuery<Session[]>({
    queryKey: ["movement-sessions", handlingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handling_sessions")
        .select(
          `id, started_at, completed_at, notes, status, approved_by,
           movements(id, occurred_at, temperature_val, notes,
             movement_types(label, name),
             movement_files(id, storage_path)
           )`,
        )
        .eq("handling_id", handlingId)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Session[];
    },
  });

  const approverIds = [
    ...new Set(
      (movementSessions ?? [])
        .map((s) => s.approved_by)
        .filter((id): id is string => !!id),
    ),
  ];

  const { data: approverProfiles } = useQuery({
    queryKey: ["approver-profiles", approverIds],
    enabled: approverIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", approverIds);
      if (error) throw error;
      return Object.fromEntries(
        ((data ?? []) as Array<{ id: string; full_name: string | null }>).map(
          (p) => [p.id, p.full_name],
        ),
      ) as Record<string, string | null>;
    },
  });

  async function approveSession(sessionId: string) {
    if (!user) return;
    setApprovingId(sessionId);
    const { error } = await supabase
      .from("handling_sessions")
      .update({ status: "approved", approved_by: user.id } as any)
      .eq("id", sessionId);
    setApprovingId(null);
    if (error) {
      toast.error("Erro ao aprovar sessão");
    } else {
      queryClient.invalidateQueries({ queryKey: ["movement-sessions", handlingId] });
    }
  }

  const selectedSession =
    movementSessions?.find((s) => s.id === selectedSessionId) ??
    movementSessions?.[0] ??
    null;
  const movements: Movement[] = selectedSession?.movements ?? [];
  const duration = selectedSession ? durationMin(selectedSession.started_at, selectedSession.completed_at) : null;

  const allMovementDates = movementSessions
    ?.flatMap((s) => s.movements.map((m) => m.occurred_at))
    .filter(Boolean)
    .sort() ?? [];
  const firstMovement = allMovementDates[0] ?? null;

  useEffect(() => {
    if (!handling) return;
    plusActionStore.set(() => {
      wizardStore.setBox({
        box_id: handling.box_id,
        destination: handling.destination ?? "",
        sender: handling.sender ?? "",
        nf_key: handling.nf_key ?? "",
        draft_doc: handling.draft_doc ?? "",
        location: handling.location_id ?? "",
      });
      wizardStore.get().movements.forEach((m) => wizardStore.removeMovement(m.localId));
      navigate({ to: "/briefing" });
    });
    return () => plusActionStore.clear();
  }, [handling, navigate]);

  return (
    <div>
      <PageHeader title="Detalhe do manuseio" />

      <div className="page-pad pb-32 space-y-5">
        {/* Handling info — same layout as briefing card */}
        {handling && (
          <>
            <div className="card-dark p-5">
              <p className="text-xs opacity-70 uppercase tracking-wider">Caixa</p>
              <p className="text-2xl font-semibold mt-1">NF {handling.nf_key ?? handling.box_id}</p>
              {handling.sender && <p className="opacity-80 mt-1">{handling.sender}</p>}
              <div className="flex flex-wrap gap-2 mt-4">
                {handling.box_id && (
                  <span className="chip bg-white/10 text-white text-sm">
                    <QrCode size={14} />
                    {handling.box_id}
                  </span>
                )}
              </div>
            </div>

            {/* Secondary details */}
            <div className="rounded-2xl border border-border divide-y divide-border">
              {/* <div className="flex items-start justify-between gap-4 px-4 py-3">
                <span className="text-xs text-muted-foreground shrink-0">Cliente</span>
                <span className="text-sm font-medium text-right">
                  {handling.sender || "Não informado"}
                </span>
              </div> */}
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <span className="text-xs text-muted-foreground shrink-0">Destino</span>
                <span className="text-sm font-medium text-right">
                  {handling.destination || "Não informado"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <span className="text-xs text-muted-foreground shrink-0">Entrada</span>
                <span className="text-sm font-medium text-right">
                  {fmtDateFull(firstMovement) || "Não informado"}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Date tabs */}
        <DateTabs
          tabs={(movementSessions ?? []).map((s) => ({ id: s.id, startedAt: s.started_at }))}
          selectedId={selectedSession?.id}
          onSelect={setSelectedSessionId}
          loading={isLoading}
          emptyLabel="Nenhuma sessão registrada."
        />

        {/* Session meta + movements */}
        {selectedSession && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={11} />
                {fmtTime(selectedSession.started_at)}
                {selectedSession.completed_at && ` → ${fmtTime(selectedSession.completed_at)}`}
                {duration && (
                  <>
                    {" · "}
                    <Timer size={11} className="ml-1" />
                    {duration}
                  </>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {movements.length} movimentações
              </span>
            </div>

            {movements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma movimentação nesta sessão.</p>
              </div>
            ) : (
              movements.map((m: any, i: number) => (
                <MovementCard
                  key={m.id}
                  movement={m}
                  onTapPhoto={() => setLightbox({ movements, index: i })}
                />
              ))
            )}

            {/* Approval row */}
            {selectedSession.status === "approved" ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span className="text-sm text-emerald-700 font-medium">
                  Aprovado por{" "}
                  {approverProfiles?.[selectedSession.approved_by ?? ""] ?? "—"}
                </span>
              </div>
            ) : (
              <button
                onClick={() => approveSession(selectedSession.id)}
                disabled={approvingId === selectedSession.id}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-emerald-500 text-emerald-600 font-semibold text-sm active:scale-[0.98] transition disabled:opacity-50"
              >
                <ShieldCheck size={16} />
                {approvingId === selectedSession.id ? "Aprovando..." : "Aprovar sessão"}
              </button>
            )}
          </div>
        )}
      </div>

      {lightbox && (
        <Lightbox
          state={lightbox}
          onClose={() => setLightbox(null)}
          onChange={(i) => setLightbox((prev) => (prev ? { ...prev, index: i } : null))}
        />
      )}
    </div>
  );
}
