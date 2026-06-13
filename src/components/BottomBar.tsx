import type { ReactNode } from "react";

interface BottomBarProps {
  children: ReactNode;
}

export function BottomBar({ children }: BottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 safe-bottom px-5 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent">
      <div className="max-w-md mx-auto flex gap-3">{children}</div>
    </div>
  );
}
