import React, { useMemo, useState } from 'react';
import { BRAND, BOT } from '../../constants';
import { Icon } from '../icons';
import { Header } from '../shared';
import { HistoryCard } from './HistoryCard';
import type { HistoryEntry } from '../../types';

interface HistoryProps {
  history: HistoryEntry[];
  loading?: boolean;
  onBack: () => void;
  onOpen: (id: string) => void;
}

type FilterKey = 'all' | 'today' | 'week' | 'alerts';

const FILTER_LABELS: [FilterKey, string][] = [
  ['all',    'Todos'],
  ['today',  'Hoje'],
  ['week',   'Semana'],
  ['alerts', 'Pendentes'],
];

export function History({ history, loading, onBack, onOpen }: HistoryProps) {
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    const now     = new Date();
    const today   = new Date(now); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);

    return history.filter(h => {
      const matchQuery  = query === '' ||
        h.boxId.toLowerCase().includes(query.toLowerCase()) ||
        h.medication.toLowerCase().includes(query.toLowerCase());

      const date = new Date(h.completedAt);
      const matchFilter =
        filter === 'all'    ? true :
        filter === 'today'  ? date >= today :
        filter === 'week'   ? date >= weekAgo :
        filter === 'alerts' ? (h.latestSessionStatus === 'submitted' || h.latestSessionStatus === 'rejected') :
        true;

      return matchQuery && matchFilter;
    });
  }, [history, query, filter]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg }}>
      <Header onBack={onBack} title="Histórico de manuseios" />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* search */}
        <div style={{ padding: '4px 20px 0' }}>
          <div style={{
            background: BRAND.card, border: `1px solid ${BRAND.line}`,
            borderRadius: 14, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {Icon.search(16, BRAND.ink3)}
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por caixa ou medicamento"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: BRAND.ink }} />
            {query !== '' && (
              <button onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}>
                {Icon.close(14, BRAND.ink3)}
              </button>
            )}
          </div>
        </div>

        {/* filter chips */}
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTER_LABELS.map(([k, l]) => {
            const active = filter === k;
            return (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding: '8px 14px', borderRadius: 99, border: active ? 'none' : `1px solid ${BRAND.line}`,
                background: active ? BRAND.ink : 'transparent',
                color: active ? '#fff' : BRAND.ink2,
                fontWeight: 500, fontSize: 12,
              }}>{l}</button>
            );
          })}
          {history.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: BRAND.ink3, alignSelf: 'center' }}>
              {filtered.length} de {history.length}
            </span>
          )}
        </div>

        {/* list */}
        <div style={{ padding: `18px 20px ${BOT}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: 74, borderRadius: 16,
                background: BRAND.card, border: `1px solid ${BRAND.line}`,
                opacity: 0.4 + i * 0.1,
              }} />
            ))
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              color: BRAND.ink3, fontSize: 13,
            }}>
              {history.length === 0
                ? 'Nenhum manuseio registrado ainda.'
                : 'Nenhum resultado para os filtros aplicados.'}
            </div>
          ) : (
            filtered.map(h => (
              <HistoryCard key={h.id} entry={h} onClick={() => onOpen(h.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
