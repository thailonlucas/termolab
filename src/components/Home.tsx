import React, { useState } from 'react';
import { BRAND, TOP, BOT } from '../constants';
import { Icon } from './icons';
import { Stat, IconBtn, Pill } from './shared';
import { VestraLogo } from './VestraLogo';
import { HistoryCard } from './History/HistoryCard';
import { formatShort } from '../utils';
import type { HistoryEntry, User } from '../types';

interface HomeProps {
  user: User;
  history: HistoryEntry[];
  onStart: () => void;
  onHistory: () => void;
  onProfile: () => void;
  onOpen: (id: string) => void;
}

export function Home({ user, history, onStart, onHistory, onProfile, onOpen }: HomeProps) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);
  const realToday = history.filter(h => new Date(h.completedAt) >= today).length;
  const realWeek  = history.filter(h => new Date(h.completedAt) >= weekAgo).length;
  const [sim] = useState(() => ({
    today: realToday || Math.floor(Math.random() * 5) + 2,
    week:  realWeek  || Math.floor(Math.random() * 18) + 14,
  }));
  const countToday = realToday > 0 ? realToday : sim.today;
  const countWeek  = realWeek  > 0 ? realWeek  : sim.week;

  // suppress unused warning — formatShort used in HistoryCard
  void formatShort;
  void Pill;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, overflow: 'auto' }}>
      {/* top bar */}
      <div style={{ padding: `${TOP} 20px 0`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <VestraLogo size={36} />
        <div style={{ display: 'flex', gap: 8 }}>
          <IconBtn>
            {Icon.bell(18)}
            <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 99, background: BRAND.warm }} />
          </IconBtn>
          <IconBtn onClick={onProfile}>{Icon.user(18)}</IconBtn>
        </div>
      </div>
      {/* greeting */}
      <div style={{ padding: '28px 20px 0' }}>
        <div style={{ fontSize: 13, color: BRAND.ink3 }}>Olá, {user.name.split(' ')[0]}</div>
        <h1 style={{ margin: '4px 0 0', fontWeight: 600, fontSize: 26, letterSpacing: -0.6, lineHeight: 1.15 }}>
          Pronta para o<br/>próximo manuseio?
        </h1>
      </div>
      {/* CTA card */}
      <div style={{ padding: '24px 20px 0' }}>
        <button onClick={onStart} style={{
          width: '100%', background: BRAND.ink, color: '#fff',
          border: 'none', borderRadius: 22, padding: 22, textAlign: 'left',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: -20, top: -20, width: 140, height: 140, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, oklch(0.62 0.13 165 / .35), transparent 60%)',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.55, textTransform: 'uppercase', fontWeight: 500 }}>Novo manuseio</div>
              <div style={{ fontWeight: 600, fontSize: 22, lineHeight: 1.15, marginTop: 6, letterSpacing: -0.4 }}>
                Iniciar troca<br/>de gelo
              </div>
              <div style={{ marginTop: 14, fontSize: 12, opacity: 0.65 }}>Guia em 8 etapas · com fotos carimbadas</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 99, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {Icon.arrow(18, BRAND.ink)}
            </div>
          </div>
        </button>
      </div>
      {/* stats */}
      <div style={{ padding: '16px 20px 0', display: 'flex', gap: 10 }}>
        <Stat label="Hoje"        value={countToday} sub="manuseios" />
        <Stat label="Esta semana" value={countWeek}  sub="manuseios" />
        <Stat label="Alertas"     value="0"          sub="ativos" tone="cold" />
      </div>
      {/* recent */}
      <div style={{ padding: '28px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>Manuseios recentes</div>
        <button onClick={onHistory} style={{ background: 'none', border: 'none', fontSize: 12, color: BRAND.ink3, fontWeight: 500 }}>Ver tudo →</button>
      </div>
      <div style={{ padding: `0 20px ${BOT}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {history.length === 0 ? (
          <div style={{
            border: `1.5px dashed ${BRAND.ink4}`, borderRadius: 16, padding: '32px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 10, color: BRAND.ink3, textAlign: 'center',
          }}>
            {Icon.box(28, BRAND.ink4)}
            <div style={{ fontWeight: 500, fontSize: 14, color: BRAND.ink2 }}>Nenhum manuseio ainda</div>
            <div style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 220 }}>Inicie o primeiro manuseio tocando no card acima</div>
          </div>
        ) : (
          history.slice(0, 3).map(h => <HistoryCard key={h.id} entry={h} onClick={() => onOpen(h.id)} />)
        )}
      </div>
    </div>
  );
}
