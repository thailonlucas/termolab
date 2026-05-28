import React, { useState } from 'react';
import { BRAND, BOT } from '../../constants';
import { Icon } from '../icons';
import { Header } from '../shared';
import { HistoryCard } from './HistoryCard';
import type { HistoryEntry } from '../../types';

interface HistoryProps {
  history: HistoryEntry[];
  onBack: () => void;
  onOpen: (id: string) => void;
}

export function History({ history, onBack, onOpen }: HistoryProps) {
  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState('all');
  void filter;
  const filtered = history.filter(h =>
    query === '' ||
    h.boxId.toLowerCase().includes(query.toLowerCase()) ||
    h.medication.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg }}>
      <Header onBack={onBack} title="Histórico de manuseios" />
      <div style={{ flex: 1, overflow: 'auto' }}>
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
          </div>
        </div>
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {([['all', 'Todos'], ['today', 'Hoje'], ['week', 'Semana'], ['alerts', 'Alertas']] as [string, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: '8px 14px', borderRadius: 99, border: 'none',
              background: filter === k ? BRAND.ink : 'transparent',
              color: filter === k ? '#fff' : BRAND.ink2,
              fontWeight: 500, fontSize: 12,
              outline: filter !== k ? `1px solid ${BRAND.line}` : 'none',
            }}>{l}</button>
          ))}
        </div>
        <div style={{ padding: `18px 20px ${BOT}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(h => <HistoryCard key={h.id} entry={h} onClick={() => onOpen(h.id)} />)}
        </div>
      </div>
    </div>
  );
}
