import React from 'react';
import { BRAND } from '../constants';
import { Icon } from './icons';
import type { Step } from '../types';

interface TimelineProps {
  steps: Step[];
  doneUntil?: number;
}

export function Timeline({ steps, doneUntil = -1 }: TimelineProps) {
  return (
    <div style={{ padding: '14px 20px 20px', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 33, top: 28, bottom: 28, width: 2, background: BRAND.line }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {steps.map((s, i) => {
          const done = i <= doneUntil;
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 99, flexShrink: 0,
                background: done ? BRAND.ink : BRAND.card,
                border: `1.5px solid ${done ? BRAND.ink : BRAND.ink4}`,
                color: done ? '#fff' : BRAND.ink,
                fontWeight: 600, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: 6, marginTop: 2,
                boxShadow: `0 0 0 4px ${BRAND.bg}`,
                position: 'relative', zIndex: 1,
              }}>
                {done ? Icon.check(14, '#fff') : i + 1}
              </div>
              <div style={{ flex: 1, background: BRAND.card, borderRadius: 14, border: `1px solid ${BRAND.line}`, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{s.title}</div>
                  {s.needsTemp && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 500, color: BRAND.cold }}>
                      {Icon.thermo(11, BRAND.cold)} temp.
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: BRAND.ink3, marginTop: 3, lineHeight: 1.45 }}>{s.sub}</div>
                {s.needsTemp && (
                  <div style={{
                    marginTop: 8, padding: '8px 10px', borderRadius: 10,
                    background: 'oklch(0.96 0.03 165)', border: '1px solid oklch(0.88 0.06 165)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    {Icon.thermo(14, BRAND.cold)}
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'oklch(0.38 0.10 165)', lineHeight: 1.3 }}>
                      Você precisará do termômetro para concluir essa etapa
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
