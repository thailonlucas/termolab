import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CameraCapture } from "@/components/CameraCapture";
import { wizardStore } from "@/lib/session-store";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/new-box")({
  component: NewBox,
});

type LookupStatus = "idle" | "loading" | "found" | "not-found";

function NewBox() {
  const navigate = useNavigate();
  const [form, setForm] = useState(wizardStore.emptyBox);
  const [scanning, setScanning] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canContinue = !!form.box_id;

  // Debounced lookup when box_id changes
  useEffect(() => {
    const label = form.box_id.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!label) {
      setLookupStatus("idle");
      return;
    }

    setLookupStatus("loading");
    debounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from("handlings")
        .select("nf_key, sender, destination, locations(name)")
        .eq("box_id", label)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setLookupStatus("not-found");
        return;
      }

      const locationName = Array.isArray(data.locations)
        ? data.locations[0]?.name
        : (data.locations as { name: string } | null)?.name;

      setForm((f) => ({
        ...f,
        nf_key: data.nf_key ?? f.nf_key,
        sender: data.sender ?? f.sender,
        destination: data.destination && data.destination !== "—" ? data.destination : f.destination,
        location: locationName ?? f.location,
      }));
      setLookupStatus("found");
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.box_id]);

  function applyQR(text: string) {
    setScanning(false);
    set("box_id", text.trim());
  }

  function next() {
    if (!canContinue) return;
    wizardStore.setBox(form);
    navigate({ to: "/briefing" });
  }

  return (
    <div>
      <PageHeader
        title="Identificar caixa"
        subtitle="Escaneie a etiqueta da caixa ou preencha os dados manualmente."
      />

      <div className="page-pad pb-32 space-y-3">
        {/* Etiqueta field with lookup indicator */}
        <label className="block">
          <div className="flex items-center justify-between ml-1 mb-1">
            <span className="text-xs text-muted-foreground">Etiqueta *</span>
            {lookupStatus === "loading" && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Loader2 size={11} className="animate-spin" /> Buscando...
              </span>
            )}
            {lookupStatus === "found" && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 size={11} /> Dados pré-preenchidos
              </span>
            )}
          </div>
          <input
            className={`field focus:field-focus ${lookupStatus === "found" ? "border-emerald-500/60" : ""}`}
            value={form.box_id}
            onChange={(e) => set("box_id", e.target.value)}
          />
        </label>

        <Field label="Número da NF / Volume" value={form.nf_key} onChange={(v) => set("nf_key", v)} />
        <Field label="Cliente" value={form.sender} onChange={(v) => set("sender", v)} />
        <Field label="Destino" value={form.destination} onChange={(v) => set("destination", v)} />
        <Field label="Sede" value={form.location} onChange={(v) => set("location", v)} />
      </div>

      <div className="fixed inset-x-0 bottom-0 safe-bottom px-5 pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={next}
            className={`btn-primary flex-1 ${canContinue ? "" : "btn-primary-disabled"}`}
          >
            Continuar
          </button>
          <button
            onClick={() => setScanning(true)}
            className="w-14 h-14 rounded-2xl bg-ink text-primary-foreground flex items-center justify-center shrink-0 active:scale-95 transition"
          >
            <QrCode size={22} />
          </button>
        </div>
      </div>

      {scanning && (
        <CameraCapture mode="qr" onClose={() => setScanning(false)} onDecoded={applyQR} />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground ml-1">{label}</span>
      <input
        className="field focus:field-focus mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
