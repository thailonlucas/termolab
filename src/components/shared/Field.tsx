import React from 'react';
import { BRAND } from '../../constants';

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  secure?: boolean;
  placeholder?: string;
}

export function Field({ label, value, onChange, secure, placeholder }: FieldProps) {
  return (
    <label style={{
      background: BRAND.card, borderRadius: 14, padding: '12px 16px',
      border: `1px solid ${BRAND.line}`, display: 'block',
    }}>
      <div style={{
        fontSize: 11, letterSpacing: 0.5, color: BRAND.ink3,
        textTransform: 'uppercase', fontWeight: 500,
      }}>{label}</div>
      <input type={secure ? 'password' : 'text'} value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', border: 'none', outline: 'none', background: 'transparent',
          fontWeight: 500, fontSize: 15, color: BRAND.ink, padding: '4px 0 2px',
        }} />
    </label>
  );
}
