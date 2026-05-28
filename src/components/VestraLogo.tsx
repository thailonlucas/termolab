import React from 'react';
import { BRAND, VESTRA_LOGO } from '../constants';

interface VestraLogoProps {
  size?: number;
  onDark?: boolean;
  withText?: boolean;
}

export function VestraLogo({ size = 44, onDark = false, withText = true }: VestraLogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <img src={VESTRA_LOGO} alt="Vestra"
        style={{
          height: size * 0.62, width: 'auto', display: 'block',
          filter: onDark ? 'invert(1) brightness(2)' : 'none',
        }} />
      {withText && (
        <div style={{
          paddingLeft: 10, marginLeft: 2,
          borderLeft: `1px solid ${onDark ? 'rgba(255,255,255,0.2)' : BRAND.line}`,
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{
            fontSize: 10, fontWeight: 500, letterSpacing: 2.4,
            color: onDark ? 'rgba(255,255,255,0.7)' : BRAND.ink3,
            textTransform: 'uppercase',
          }}>
            TermoLab Track
          </span>
        </div>
      )}
    </div>
  );
}
