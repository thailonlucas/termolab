import { createFileRoute, Outlet, useLocation, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, loading, isRecovery } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }
  if (isRecovery) {
    return <Navigate to="/auth" />;
  }
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Hide bottom nav on full-screen flows
  const hideNav = ["/wizard", "/briefing", "/new-box", "/done"].some((p) =>
    pathname.startsWith(p),
  );

  return (
    <div className="min-h-screen mx-auto max-w-md bg-background relative">
      <Outlet />
      {!hideNav && <div className="h-24" />}
      {!hideNav && <BottomNav />}
    </div>
  );
}
