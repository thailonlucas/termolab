import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";


export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot" | "reset";

function AuthPage() {
  const { user, loading, isRecovery } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isRecovery) setMode("reset");
  }, [isRecovery]);

  if (!loading && user && !isRecovery) {
    return <Navigate to="/" />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "reset" && password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Conta criada. Você já pode entrar.");
        setMode("signin");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Enviamos um link para seu e-mail.");
        setMode("signin");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Senha atualizada com sucesso.");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background page-pad">
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto py-12">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ink text-primary-foreground font-bold text-xl mb-4">
            T
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">TermoTracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "reset" ? "Criar nova senha" : "Rastreio de manuseio · Vestra Logística"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              className="field focus:field-focus"
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {mode !== "reset" && (
            <input
              className="field focus:field-focus"
              type="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          {mode !== "forgot" && (
            <div className="relative">
              <input
                className="field focus:field-focus pr-12"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "reset" ? "Nova senha" : "Senha"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}
          {mode === "reset" && (
            <div className="relative">
              <input
                className="field focus:field-focus pr-12"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar nova senha"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className={`btn-primary w-full mt-2 ${busy ? "btn-primary-disabled" : ""}`}
          >
            {mode === "signin" && "Entrar"}
            {mode === "signup" && "Criar conta"}
            {mode === "forgot" && "Enviar link"}
            {mode === "reset" && "Salvar nova senha"}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          {mode === "signin" && (
            <>
              <button onClick={() => setMode("forgot")} className="text-muted-foreground hover:underline">
                Esqueci minha senha
              </button>
              <div className="text-muted-foreground">
                Não tem conta?{" "}
                <button onClick={() => setMode("signup")} className="text-foreground font-medium">
                  Cadastrar
                </button>
              </div>
            </>
          )}
          {mode === "signup" && (
            <div className="text-muted-foreground">
              Já tem conta?{" "}
              <button onClick={() => setMode("signin")} className="text-foreground font-medium">
                Entrar
              </button>
            </div>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("signin")} className="text-foreground font-medium">
              Voltar ao login
            </button>
          )}
          {mode === "reset" && (
            <p className="text-xs text-muted-foreground">
              Mínimo de 6 caracteres.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
