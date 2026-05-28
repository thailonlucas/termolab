import React from 'react';
import { BRAND } from '../../constants';

interface GhostBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function GhostBtn({ children, onClick, style }: GhostBtnProps) {
  return (
    <button onClick={onClick} style={{
      width: '100%', height: 54, borderRadius: 14,
      background: 'transparent', color: BRAND.ink,
      border: `1.5px solid ${BRAND.line}`,
      fontWeight: 500, fontSize: 15,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...style,
    }}>{children}</button>
  );
}
