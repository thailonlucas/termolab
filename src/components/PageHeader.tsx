import { ChevronLeft, X } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  variant = "back",
  right,
  onBack,
  onClose,
}: {
  title: string;
  subtitle?: string;
  variant?: "back" | "close" | "plain";
  right?: ReactNode;
  onBack?: () => void;
  onClose?: () => void;
}) {
  const router = useRouter();
  return (
    <header className="safe-top page-pad pb-4">
      <div className="flex items-center justify-between min-h-[40px]">
        {variant === "back" && (
          <button
            aria-label="Voltar"
            onClick={onBack ?? (() => router.history.back())}
            className="-ml-2 p-2 rounded-full hover:bg-muted"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {variant === "close" && (
          <button
            aria-label="Fechar"
            onClick={onClose ?? (() => router.history.back())}
            className="-ml-2 p-2 rounded-full hover:bg-muted"
          >
            <X size={22} />
          </button>
        )}
        {variant === "plain" && <span />}
        <div className="flex-1" />
        {right}
      </div>
      <h1 className="mt-2 text-[22px] font-semibold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground leading-snug">{subtitle}</p>
      )}
    </header>
  );
}
