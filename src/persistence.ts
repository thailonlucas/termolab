import type { HistoryEntry } from './types';

export const STORAGE_KEY = 'termolab-history-v1';

function reviveDates(entry: HistoryEntry): HistoryEntry {
  return {
    ...entry,
    startedAt:   new Date(entry.startedAt),
    completedAt: new Date(entry.completedAt),
  };
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as HistoryEntry[]).map(reviveDates);
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    try {
      const slim = history.map(entry => ({
        ...entry,
        photos: Object.fromEntries(
          Object.entries(entry.photos).map(([k, v]) => [k, { ...v, dataUrl: null }])
        ),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      console.warn('[TermoLab] Storage cheio — fotos não salvas neste manuseio.');
    } catch {
      console.warn('[TermoLab] Storage cheio — histórico não pôde ser salvo.');
    }
  }
}
