import { useEffect, useRef, useState } from "react";

export function ThermometerInput({
  value,
  onChange,
  min = -50,
  max = 50,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function commit() {
    const n = parseFloat(draft.replace(",", "."));
    if (!isNaN(n)) {
      onChange(Math.min(max, Math.max(min, parseFloat(n.toFixed(1)))));
    } else {
      setDraft(String(value));
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 w-28 h-28 rounded-2xl border border-border bg-background shadow-md">
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
            inputRef.current?.blur();
          }
        }}
        className="w-4/5 text-center text-3xl font-bold tabular-nums outline-none bg-transparent text-foreground border-b-2 border-primary"
      />
      <span className="text-[11px] text-muted-foreground tracking-wide">Celsius</span>
    </div>
  );
}
