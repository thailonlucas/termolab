import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { X, Camera as CameraIcon, RefreshCcw, Check, ChevronLeft, Thermometer as ThermoIcon } from "lucide-react";
import { Thermometer } from "@/components/Thermometer";

export type CapturedPhoto = { dataUrl: string };

type Props =
  | {
      mode: "photo";
      boxId: string;
      stageLabel: string;
      onClose: () => void;
      onCapture: (photo: CapturedPhoto) => void;
      thermoValue?: number;
      onThermoChange?: (v: number) => void;
    }
  | {
      mode: "qr";
      onClose: () => void;
      onDecoded: (text: string) => void;
    };

export function CameraCapture(props: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [thermoOpen, setThermoOpen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e) {
        setError((e as Error).message || "Não foi possível acessar a câmera.");
      }
    }
    start();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // QR scan loop
  useEffect(() => {
    if (props.mode !== "qr" || !ready) return;
    const tick = () => {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c || v.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const w = v.videoWidth;
      const h = v.videoHeight;
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, w, h);
      const img = ctx.getImageData(0, 0, w, h);
      const result = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
      if (result?.data) {
        props.onDecoded(result.data);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, props]);

  function capturePhoto() {
    if (props.mode !== "photo") return;
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const w = v.videoWidth;
    const h = v.videoHeight;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);

    // Watermark overlay
    const pad = Math.round(w * 0.025);
    const fs = Math.max(14, Math.round(w * 0.022));
    const lh = Math.round(fs * 1.25);
    ctx.font = `600 ${fs}px Urbanist, system-ui, sans-serif`;
    ctx.textBaseline = "bottom";

    // dark gradient bottom
    const grad = ctx.createLinearGradient(0, h - lh * 3.5, 0, h);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - lh * 3.5, w, lh * 3.5);

    ctx.fillStyle = "#fff";
    // bottom-left
    ctx.textAlign = "left";
    ctx.fillText("VESTRA · TermoLab Track", pad, h - pad - lh);
    ctx.font = `500 ${fs}px Urbanist, system-ui, sans-serif`;
    ctx.fillText(
      `Caixa ${props.boxId} · ${props.stageLabel}`,
      pad,
      h - pad,
    );
    // bottom-right timestamp
    ctx.textAlign = "right";
    const ts = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    ctx.fillText(ts, w - pad, h - pad);

    const dataUrl = c.toDataURL("image/jpeg", 0.85);
    setPreview(dataUrl);
  }

  function confirm() {
    if (props.mode === "photo" && preview) {
      props.onCapture({ dataUrl: preview });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      {!preview && (
        <button
          aria-label="Fechar"
          onClick={props.onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/15 backdrop-blur"
        >
          <X size={22} />
        </button>
      )}

      {error ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <p className="text-sm opacity-80">{error}</p>
          <button onClick={props.onClose} className="mt-6 btn-ghost text-white border-white/30">
            Voltar
          </button>
        </div>
      ) : (
        <>
          {/* Video is always mounted so srcObject is never lost on redo */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${preview ? "hidden" : ""}`}
            muted
            playsInline
          />

          {preview ? (
            <div
              className="absolute inset-0 flex flex-col bg-background"
              style={{
                backgroundImage: "radial-gradient(circle, #e2e8f0 1.5px, transparent 1.5px)",
                backgroundSize: "22px 22px",
              }}
            >
              {/* Header */}
              <div className="safe-top px-4 pb-3 flex items-center justify-between">
                <button
                  onClick={() => setPreview(null)}
                  className="p-2 -ml-1 rounded-full hover:bg-muted transition-colors text-foreground"
                >
                  <ChevronLeft size={22} />
                </button>
                <span className="font-semibold text-sm text-foreground">Pré-visualização</span>
                <span className="w-9" />
              </div>

              {/* Thermometer FAB */}
              {props.mode === "photo" && props.onThermoChange && (
                <>
                  <button
                    aria-label="Termômetro"
                    onClick={() => setThermoOpen((o) => !o)}
                    className={`fixed top-16 right-4 z-50 w-12 h-12 rounded-lg border shadow-md flex items-center justify-center transition-colors ${
                      thermoOpen
                        ? "bg-primary text-white border-primary"
                        : "bg-background text-muted-foreground border-border"
                    }`}
                  >
                    <ThermoIcon size={18} />
                  </button>
                  {thermoOpen && (
                    <div className="fixed top-30 right-4 z-50 bg-background border border-border rounded-2xl shadow-xl p-4 flex items-center gap-4">
                      <div className="h-60 flex">
                        <Thermometer value={props.thermoValue ?? 2} onChange={props.onThermoChange} />
                      </div>
                      <div className="flex flex-col items-center gap-1 w-14">
                        <span className="text-xl font-bold tabular-nums leading-none text-foreground text-center w-full block">
                          {(props.thermoValue ?? 2).toFixed(1)}°
                        </span>
                        <span className="text-[10px] text-muted-foreground text-center w-full block">Celsius</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Photo */}
              <div className="flex-1 flex items-center justify-center px-6 py-2 min-h-0">
                <img
                  src={preview}
                  className="max-h-full max-w-full rounded-3xl shadow-2xl object-contain border border-border/30"
                  alt="Pré-visualização"
                />
              </div>

              {/* Actions */}
              <div className="shrink-0 safe-bottom px-5 pt-3 pb-5 flex gap-3">
                <button
                  onClick={() => setPreview(null)}
                  className="flex-1 h-12 rounded-2xl border border-border bg-background flex items-center justify-center gap-2 font-medium text-sm text-foreground"
                >
                  <RefreshCcw size={16} /> Refazer
                </button>
                <button
                  onClick={confirm}
                  className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center gap-2 font-semibold text-sm"
                >
                  <Check size={18} /> Usar foto
                </button>
              </div>
            </div>
          ) : (
            <>
              {props.mode === "qr" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                  <p className="absolute bottom-32 text-sm opacity-80">Aponte para o QR code da caixa</p>
                </div>
              )}
              {props.mode === "photo" && (
                <div className="absolute inset-x-0 bottom-0 safe-bottom flex items-center justify-center pt-6">
                  <button
                    aria-label="Capturar"
                    onClick={capturePhoto}
                    className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl"
                  >
                    <CameraIcon size={28} className="text-black" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
