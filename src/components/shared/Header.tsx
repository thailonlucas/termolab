import React from 'react';
import { BRAND, TOP } from '../../constants';
import { Icon } from '../icons';

interface HeaderProps {
  onBack?: () => void;
  title: string;
  right?: React.ReactNode;
}

export function Header({ onBack, title, right }: HeaderProps) {
  return (
    <div style={{
      padding: `${TOP} 20px 12px`, display: 'flex', alignItems: 'center', gap: 12,
      background: BRAND.bg, flexShrink: 0,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 12, border: `1px solid ${BRAND.line}`,
          background: BRAND.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{Icon.chevron(14, BRAND.ink, 'left')}</button>
      )}
      <div style={{ flex: 1, fontSize: 17, fontWeight: 600, color: BRAND.ink }}>{title}</div>
      {right}
    </div>
  );
}
