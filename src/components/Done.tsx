import React from 'react';
import { BRAND, TOP, BOT } from '../constants';
import { Icon } from './icons';
import { Pill, PrimaryBtn, GhostBtn } from './shared';
import type { HistoryEntry } from '../types';

interface DoneProps {
  entry: HistoryEntry;
  onClose: () => void;
  onView: () => void;
}

export function Done({ entry, onClose, onView }: DoneProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, padding: `${TOP} 20px ${BOT}` }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{
          width: 38, height: 38, borderRadius: 12,
          border: `1px solid ${BRAND.line}`, background: BRAND.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon.close(16)}
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{
          width: 96, height: 96, borderRadius: 99,
          background: 'oklch(0.94 0.06 165)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid oklch(0.75 0.10 165)',
        }}>
          {Icon.check(38, BRAND.cold)}
        </div>
        <h2 style={{ fontWeight: 600, fontSize: 26, letterSpacing: -0.4, margin: '24px 0 6px' }}>Manuseio concluído</h2>
        <p style={{ fontSize: 13, color: BRAND.ink3, maxWidth: 280, lineHeight: 1.5, margin: 0 }}>
          Caixa <strong style={{ color: BRAND.ink }}>{entry.boxId}</strong> lacrada e registrada
          com {Object.keys(entry.photos).length} fotos carimbadas.
        </p>
        <div style={{ marginTop: 28, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Pill tone="cold">Temp. final {entry.temps.temp3}°C</Pill>
          <Pill>Lacre #{Math.floor(Math.random() * 90000 + 10000)}</Pill>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PrimaryBtn onClick={onView}>Ver canhoto e fotos</PrimaryBtn>
        <GhostBtn onClick={onClose}>Voltar ao início</GhostBtn>
      </div>
    </div>
  );
}
