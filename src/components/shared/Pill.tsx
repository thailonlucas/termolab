import React from 'react';
import { BRAND } from '../../constants';

type Tone = 'cold' | 'warm' | 'neutral';

interface PillProps {
  children: React.ReactNode;
  tone?: Tone;
}

export function Pill({ children, tone = 'neutral' }: PillProps) {
  const tones: Record<Tone, { bg: string; fg: string }> = {
    cold:    { bg: 'oklch(0.94 0.04 165)', fg: 'oklch(0.42 0.10 165)' },
    warm:    { bg: 'oklch(0.95 0.04 75)',  fg: 'oklch(0.45 0.10 75)'  },
    neutral: { bg: BRAND.bg2, fg: BRAND.ink2 },
  };
  const t = tones[tone];
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 500, letterSpacing: 0.2,
      background: t.bg, color: t.fg, padding: '4px 8px', borderRadius: 99,
    }}>{children}</span>
  );
}
