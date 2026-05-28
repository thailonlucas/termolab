import React from 'react';
import { BRAND } from '../../constants';

interface StatProps {
  label: string;
  value: string | number;
  sub: string;
  tone?: string;
}

export function Stat({ label, value, sub, tone }: StatProps) {
  return (
    <div style={{
      flex: 1, background: BRAND.card, borderRadius: 16,
      padding: '14px 14px 16px', border: `1px solid ${BRAND.line}`,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 0.5, color: BRAND.ink3, textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>
      <div style={{
        fontWeight: 600, fontSize: 24,
        color: tone === 'cold' ? BRAND.cold : BRAND.ink,
        marginTop: 4, lineHeight: 1, letterSpacing: -0.5,
      }}>{value}</div>
      <div style={{ fontSize: 11, color: BRAND.ink3, marginTop: 4 }}>{sub}</div>
    </div>
  );
}
