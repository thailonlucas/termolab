import React from 'react';
import { BRAND, BOT } from '../constants';
import { Icon } from './icons';
import { Header, GhostBtn } from './shared';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

interface ProfileProps {
  user: User;
  onBack: () => void;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function Profile({ user, onBack }: ProfileProps) {
  const { user: authUser, signOut } = useAuth();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg }}>
      <Header onBack={onBack} title="Perfil" />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '12px 20px 0', textAlign: 'center' }}>
          <div style={{
            width: 90, height: 90, borderRadius: 99, background: BRAND.ink, color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 30,
          }}>{initials(user.name)}</div>
          <div style={{ fontWeight: 600, fontSize: 18, marginTop: 14, letterSpacing: -0.3 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: BRAND.ink3, marginTop: 2 }}>{authUser?.email}</div>
          <div style={{ fontSize: 11, color: BRAND.ink4, marginTop: 2 }}>{user.role}</div>
        </div>
        <div style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {([
            ['Meus manuseios',          '128 registros'],
            ['Notificações',            'Ativas'],
            ['Dispositivos vinculados', 'iPhone · Leitor Bluetooth'],
            ['Política de manuseio',    'v3.2 · mai 2026'],
            ['Suporte',                 'suporte@vestra.com'],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{
              background: BRAND.card, border: `1px solid ${BRAND.line}`,
              borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{k}</div>
                <div style={{ fontSize: 11, color: BRAND.ink3, marginTop: 2 }}>{v}</div>
              </div>
              {Icon.chevron(14, BRAND.ink3)}
            </div>
          ))}
        </div>
        <div style={{ padding: `24px 20px ${BOT}`, marginTop: 'auto' }}>
          <GhostBtn onClick={signOut}>Sair</GhostBtn>
        </div>
      </div>
    </div>
  );
}
