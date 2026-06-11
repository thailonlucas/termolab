// ── Wizard / UI types (used by components) ──────────────────────────────────

export interface Step {
  id: string;
  title: string;
  sub: string;
  label: string;
  needsTemp: boolean;
  stage: string;
  hue: number;
  isSign?: boolean;
}

export interface PhotoEntry {
  taken: boolean;
  ts: string;
  dataUrl: string | null;
}

// A single movement added during a handling session.
export interface LocalMovement {
  localId: string;
  movementTypeId: string;
  movementTypeName: string;
  movementTypeLabel: string;
  requiresPhoto: boolean;
  requiresTemperature: boolean;
  photo: PhotoEntry | null;
  temperature: string;
  occurredAt: Date;
}

// In-progress wizard state — lives only in memory until submitted.
export interface Session {
  boxId: string;
  medication: string;
  lot: string;
  origem: string;
  destino: string;
  remetente: string;
  chaveNF: string;
  docMinuta: string;
  movements: LocalMovement[];
  startedAt: Date;
  operator?: string;
}

// Completed handling record — id maps to handlings.id in the DB.
// Lightweight: no embedded sessions. Detail view loads sessions from Supabase directly.
export interface HistoryEntry {
  id: string;
  boxId: string;
  medication: string;
  lot: string;
  origem: string;
  destino: string;
  remetente: string;
  chaveNF: string;
  docMinuta: string;
  startedAt: Date;
  completedAt: Date;
  operator?: string;
  handlingStatus: string;
  sessionCount: number;
  latestSessionStatus: string;
}

// App-level user (derived from auth + profiles table)
export interface User {
  name: string;
  role: string;
}

export type Route =
  | 'login'
  | 'home'
  | 'newBox'
  | 'briefing'
  | 'wizard'
  | 'handlingDone'
  | 'history'
  | 'historyDetail'
  | 'profile';
