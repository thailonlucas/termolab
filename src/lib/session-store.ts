// Lightweight client store backed by sessionStorage so the box/wizard state
// survives navigation between newBox → briefing → wizard → done.

import { useEffect, useState } from "react";

export type BoxDraft = {
  box_id: string;
  destination: string;
  sender: string;
  nf_key: string;
  draft_doc: string;
  location: string;
};

export type DraftMovement = {
  localId: string;
  movementTypeId: string;
  movementTypeName: string;
  movementTypeLabel: string;
  occurredAt: string; // ISO
  photoDataUrl?: string; // already watermarked
  temperature?: number | null;
  notes?: string;
};

export type WizardState = {
  box: BoxDraft | null;
  movements: DraftMovement[];
  lastSavedSummary?: {
    handlingId: string;
    sessionId: string;
    boxId: string;
    movementCount: number;
    photoCount: number;
    finalTemp?: number | null;
  };
};

const KEY = "TermoTracking:wizard";

const emptyBox: BoxDraft = {
  box_id: "",
  destination: "",
  sender: "",
  nf_key: "",
  draft_doc: "",
  location: "",
};

function read(): WizardState {
  if (typeof window === "undefined") return { box: null, movements: [] };
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return { box: null, movements: [] };
    return JSON.parse(raw) as WizardState;
  } catch {
    return { box: null, movements: [] };
  }
}

const listeners = new Set<() => void>();

function write(state: WizardState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const wizardStore = {
  get: read,
  setBox(box: BoxDraft) {
    const s = read();
    write({ ...s, box });
  },
  addMovement(m: DraftMovement) {
    const s = read();
    write({ ...s, movements: [...s.movements, m] });
  },
  removeMovement(localId: string) {
    const s = read();
    write({ ...s, movements: s.movements.filter((m) => m.localId !== localId) });
  },
  reset() {
    write({ box: null, movements: [] });
  },
  setSummary(summary: WizardState["lastSavedSummary"]) {
    const s = read();
    write({ ...s, lastSavedSummary: summary });
  },
  emptyBox,
};

export function useWizardState(): WizardState {
  const [state, setState] = useState<WizardState>(() => read());
  useEffect(() => {
    const l = () => setState(read());
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return state;
}
