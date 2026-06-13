import { useRef, useState } from "react";

export function Thermometer({
  value,
  onChange,
  min = -10,
  max = 10,
  step = 0.5,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const pct = (value - min) / (max - min);
  const active = dragging || hovered;

  const setFromClientY = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = 1 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const v = min + p * (max - min);
    onChange(Number((Math.round(v / step) * step).toFixed(1)));
  };

  return (
    <div
      className="flex flex-col items-center select-none w-12 py-5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={trackRef}
        className="relative flex-1 w-2 touch-none cursor-ns-resize"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setDragging(true);
          setFromClientY(e.clientY);
        }}
        onPointerMove={(e) => { if (dragging) setFromClientY(e.clientY); }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {/* Gray base */}
        <div className="absolute inset-0 rounded-full bg-muted" />

        {/* Gradient clipped from bottom up to thumb level */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(to bottom, #ef4444, #fbbf24, #34d399, #38bdf8, #2563eb)",
            clipPath: `inset(${(1 - pct) * 100}% 0 0 0 round 9999px)`,
            opacity: active ? 0.9 : 0.6,
            filter: active ? "saturate(1.5)" : "saturate(0.7)",
            transition: "opacity 200ms, filter 200ms",
          }}
        />

        {/* Thumb */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white border flex items-center justify-center pointer-events-none transition-[width,height,box-shadow] duration-150 ${
            active ? "w-11 h-11 shadow-sm" : "w-9 h-9 shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
          }`}
          style={{ top: `${(1 - pct) * 100}%` }}
        >
          <span className="text-[9px] font-semibold tabular-nums text-foreground leading-none">
            {value.toFixed(1)}°
          </span>
        </div>
      </div>
    </div>
  );
}
