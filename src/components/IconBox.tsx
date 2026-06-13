import type { ReactNode } from "react";

interface IconBoxProps {
  children: ReactNode;
  size?: "md" | "lg";
  className?: string;
}

export function IconBox({ children, size = "md", className }: IconBoxProps) {
  const dim = size === "lg" ? "w-12 h-12" : "w-10 h-10";
  return (
    <span
      className={`${dim} rounded-lg bg-muted flex items-center justify-center shrink-0 ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
