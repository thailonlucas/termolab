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

export interface Session {
  boxId: string;
  medication: string;
  lot: string;
  origem: string;
  destino: string;
  remetente: string;
  chaveNF: string;
  docMinuta: string;
  photos: Record<string, PhotoEntry>;
  temps: Record<string, string>;
  startedAt: Date;
  operator?: string;
}

export interface HistoryEntry extends Session {
  id: string;
  completedAt: Date;
  status: string;
}

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
