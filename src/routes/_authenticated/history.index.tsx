import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Package, Search } from "lucide-react";
import { NextSession, isWithin2Hours } from "@/components/NextSession";

export const Route = createFileRoute("/_authenticated/history/")({
  component: HistoryPage,
});

type FilterKey = "all" | "today" | "week" | "pending";

function HistoryPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  type Handling = {
    id: string;
    box_id: string;
    status: string;
    started_at: string;
    next_session_at: string | null;
    handling_sessions: { id: string; started_at: string }[];
  };

  const { data, isLoading } = useQuery<Handling[]>({
    queryKey: ["all-handlings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handlings")
        .select(
          "id, box_id, status, started_at, next_session_at, handling_sessions(id, started_at)",
        )
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Handling[];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    return data.filter((h) => {
      const matchesQ =
        !q ||
        h.box_id.toLowerCase().includes(q.toLowerCase()) || ""
      const d = new Date(h.started_at);
      if (filter === "today" && d < startToday) return false;
      if (filter === "week" && d < weekAgo) return false;
      if (filter === "pending" && h.status !== "in_progress") return false;
      return matchesQ;
    });
  }, [data, q, filter]);

  return (
    <div>
      <PageHeader title="Histórico de manuseios" onBack={() => navigate({ to: "/" })} />

      <div className="page-pad">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por código ou medicamento"
            className="field focus:field-focus pl-10"
          />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {(
            [
              ["all", "Todos"],
              ["today", "Hoje"],
              ["week", "Semana"],
              ["pending", "Pendentes"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="px-4 h-9 rounded-full text-sm font-medium border whitespace-nowrap transition"
              style={
                filter === k
                  ? { background: "var(--color-ink)", color: "var(--color-primary-foreground)", borderColor: "var(--color-ink)" }
                  : { background: "transparent", borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                {q || filter !== "all"
                  ? "Nenhum resultado para os filtros aplicados."
                  : "Nenhum manuseio registrado ainda."}
              </p>
            </div>
          ) : (
            filtered.map((h) => {
              const urgent = isWithin2Hours(h.next_session_at);
              return (
                <div key={h.id} className="relative">
                  {urgent && (
                    <span className="absolute top-3 right-3 z-10 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                    </span>
                  )}
                  <Link
                    to="/history/$handlingId"
                    params={{ handlingId: h.id }}
                    className="card-soft p-3 flex items-center gap-3 active:scale-[0.99] transition"
                  >
                    <span className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center">
                      <Package size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{h.box_id}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {h.handling_sessions?.length ?? 0} sessões ·{" "}
                      </p>
                      <NextSession iso={h.next_session_at ?? null} />
                    </div>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    in_progress: { label: "Aguardando aprovação", cls: "bg-warning/20 text-foreground" },
    completed: { label: "Concluído", cls: "bg-success/20 text-foreground" },
    cancelled: { label: "Cancelado", cls: "bg-destructive/15 text-foreground" },
  };
  const v = map[status] ?? { label: status, cls: "bg-muted text-foreground" };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${v.cls}`}>{v.label}</span>
  );
}
