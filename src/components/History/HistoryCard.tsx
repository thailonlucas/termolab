import React from 'react';
import { BRAND } from '../../constants';
import { Icon } from '../icons';
import { Pill } from '../shared';
import { formatShort } from '../../utils';
import type { HistoryEntry } from '../../types';

interface HistoryCardProps {
  entry: HistoryEntry;
  onClick: () => void;
}

export function HistoryCard({ entry, onClick }: HistoryCardProps) {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{entry.boxId}</span>
          {Object.keys(entry.photos).length > 0 && (
            <span style={{ fontSize: 11, color: BRAND.ink3 }}>{formatShort(entry.completedAt)}</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: BRAND.ink2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.medication}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <Pill tone="cold">{entry.temps.temp3}°C final</Pill>
          <span style={{ fontSize: 11, color: BRAND.ink3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {Icon.camera(11, BRAND.ink3)} {Object.keys(entry.photos).length}
          </span>
        </div>
      </div>
    </button>
  );
}
