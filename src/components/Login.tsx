import React, { useState } from 'react';
import { BRAND, TOP, BOT, VESTRA_LOGO } from '../constants';
import { Field, PrimaryBtn } from './shared';

interface LoginProps {
  onSubmit: () => void;
}

export function Login({ onSubmit }: LoginProps) {
  const [email, setEmail] = useState('ana.coutinho@vestra.com');
  const [pwd, setPwd] = useState('••••••••');
  return (
    <div style={{
      flex: 1, padding: `${TOP} 24px ${BOT}`,
      display: 'flex', flexDirection: 'column', background: BRAND.bg, overflow: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <img src={VESTRA_LOGO} alt="Vestra" style={{ height: 120, width: 'auto' }} />
      </div>
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <h1 style={{
          margin: 0, fontWeight: 600, fontSize: 40,
          letterSpacing: -1.2, lineHeight: 0.98, color: BRAND.ink,
        }}>
          TermoLab{' '}
          <span style={{ fontWeight: 300, fontStyle: 'italic', color: BRAND.ink2 }}>Track</span>
        </h1>
        <p style={{
          fontSize: 13, color: BRAND.ink3, marginTop: 14, lineHeight: 1.5,
          maxWidth: 280, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Manuseio rastreável de cargas refrigeradas, do primeiro lacre ao canhoto.
        </p>
      </div>
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="E-mail" value={email} onChange={setEmail} />
        <Field label="Senha"  value={pwd}   onChange={setPwd} secure />
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <PrimaryBtn onClick={onSubmit}>Entrar</PrimaryBtn>
        <div style={{ textAlign: 'center', fontSize: 13, color: BRAND.ink3 }}>
          Esqueceu a senha?{' '}
          <span style={{ color: BRAND.ink, fontWeight: 500, borderBottom: `1px solid ${BRAND.ink}` }}>
            Recuperar acesso
          </span>
        </div>
      </div>
    </div>
  );
}
