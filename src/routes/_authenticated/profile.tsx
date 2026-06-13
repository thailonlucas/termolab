import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "—";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div>
      <PageHeader title="Perfil" variant="plain" />

      <div className="page-pad pb-10">
        <div className="card-soft p-6 flex flex-col items-center text-center">
          <span className="w-20 h-20 rounded-full bg-ink text-primary-foreground flex items-center justify-center text-2xl font-semibold">
            {initial}
          </span>
          <p className="mt-4 text-lg font-semibold">{fullName}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="chip mt-3">Operador</span>
        </div>

        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/auth" });
          }}
          className="btn-ghost w-full mt-6"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </div>
  );
}
