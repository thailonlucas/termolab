import React from 'react';
import { BRAND } from '../../constants';
import { Icon } from '../icons';
import { Pill } from '../shared';
import { formatShort } from '../../utils';
import type { HistoryEntry } from '../../types';

const STATUS_LABELS: Record<string, { label: string; tone: 'cold' | 'warm' | undefined }> = {
  approved:    { label: 'Aprovado',     tone: 'cold' },
  submitted:   { label: 'Aguardando',   tone: 'warm' },
  rejected:    { label: 'Rejeitado',    tone: undefined },
  in_progress: { label: 'Em andamento', tone: undefined },
  cancelled:   { label: 'Cancelado',    tone: undefined },
};

interface HistoryCardProps {
  entry: HistoryEntry;
  onClick: () => void;
}

export function HistoryCard({ entry, onClick }: HistoryCardProps) {
  const statusInfo = STATUS_LABELS[entry.latestSessionStatus];

  return (
    <button onClick={onClick} style={{
      width: '100%', background: BRAND.card, borderRadius: 16, padding: 14,
      border: `1px solid ${BRAND.line}`, textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {Icon.box(20, BRAND.ink)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{entry.boxId}</span>
          {statusInfo && (
            <Pill tone={statusInfo.tone}>{statusInfo.label}</Pill>
          )}
        </div>
        <div style={{ fontSize: 12, color: BRAND.ink2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.medication}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {entry.sessionCount > 1 && (
            <span style={{ fontSize: 11, color: BRAND.ink3 }}>{entry.sessionCount} sessões</span>
          )}
          <span style={{ fontSize: 11, color: BRAND.ink3, marginLeft: 'auto' }}>
            {formatShort(entry.completedAt)}
          </span>
        </div>
      </div>
    </button>
  );
}
