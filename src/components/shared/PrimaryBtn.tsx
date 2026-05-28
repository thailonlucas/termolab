import React from 'react';
import { BRAND } from '../../constants';

interface PrimaryBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function PrimaryBtn({ children, onClick, disabled, style }: PrimaryBtnProps) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', height: 54, borderRadius: 14,
      background: disabled ? BRAND.ink4 : BRAND.ink, color: '#fff',
      border: 'none', fontWeight: 600, fontSize: 15, letterSpacing: 0.2,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...style,
    }}>{children}</button>
  );
}
