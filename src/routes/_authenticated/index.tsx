import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Snowflake, Activity, Package, User } from "lucide-react";
import { NextSession, isWithin2Hours } from "@/components/NextSession";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonList } from "@/components/SkeletonList";
import { SectionHeader } from "@/components/SectionHeader";
import { IconBox } from "@/components/IconBox";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
});

function Home() {
  const { user } = useAuth();
  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "operador";

  type RecentHandling = {
    id: string;
    box_id: string;
    status: string;
    started_at: string;
    next_session_at: string | null;
  };

  const { data: recent, isLoading } = useQuery<RecentHandling[]>({
    queryKey: ["recent-handlings", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handlings")
        .select("id, box_id, status, started_at, next_session_at")
        .order("started_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as RecentHandling[];
    },
  });

  const { data: today } = useQuery({
    queryKey: ["today-count", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("handling_sessions")
        .select("id", { count: "exact", head: true })
        .gte("started_at", since.toISOString());
      return count ?? 0;
    },
  });

  const { data: alertCount } = useQuery({
    queryKey: ["alerts-count"],
    queryFn: async () => {
      const now = new Date();
      const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const { count } = await supabase
        .from("handlings")
        .select("id", { count: "exact", head: true })
        .gt("next_session_at", now.toISOString())
        .lte("next_session_at", in2h.toISOString());
      return count ?? 0;
    },
  });

  return (
    <div>
      <header className="safe-top page-pad pb-4 flex items-center justify-between">
        <div className="w-8" />
        <div className="text-sm font-semibold tracking-[0.2em] uppercase">VESTRA</div>
        <Link
          to="/profile"
          aria-label="Perfil"
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition"
        >
          <User size={22} strokeWidth={1.6} />
        </Link>
      </header>

      <div className="page-pad">
        <p className="text-sm text-muted-foreground">
          Manutenção de produtos termolábeis e de temperatura controlada
        </p>
        <h1 className="text-[26px] pt-2 font-semibold leading-tight">Olá, {firstName}</h1>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <StatCard icon={Activity} label="Hoje" value={`${today ?? 0}`} sub="manuseios" />
          <StatCard icon={Snowflake} label="Câmara fria" value="—" sub="caixas" />
          <StatCard icon={AlertTriangle} label="Alertas" value={`${alertCount ?? 0}`} sub="ativos" />
        </div>

        <div className="mt-7">
          <SectionHeader
            title="Manutenções recentes"
            action={
              <Link to="/history" className="text-sm text-muted-foreground">
                Ver tudo →
              </Link>
            }
          />
        </div>

        <div className="mt-3 space-y-2">
          {isLoading ? (
            <SkeletonList count={3} />
          ) : recent && recent.length > 0 ? (
            recent.map((h) => {
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
                    className="card-soft p-3 flex items-center gap-3"
                  >
                    <IconBox>
                      <Package size={18} />
                    </IconBox>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{h.box_id}</p>
                      <NextSession iso={h.next_session_at} />
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <EmptyState icon={Package} title="Nenhum manuseio ainda." />
          )}
        </div>
      </div>
    </div>
  );
}
