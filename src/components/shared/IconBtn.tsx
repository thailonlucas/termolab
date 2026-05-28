import React from 'react';
import { BRAND } from '../../constants';

interface IconBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function IconBtn({ children, onClick }: IconBtnProps) {
  return (
    <button onClick={onClick} style={{
      width: 38, height: 38, borderRadius: 12, position: 'relative',
      background: BRAND.card, border: `1px solid ${BRAND.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}
