import React from 'react';
import { BRAND, BOT, STEPS } from '../constants';
import { Icon } from './icons';
import { Header, PrimaryBtn } from './shared';
import { Timeline } from './Timeline';
import type { Session } from '../types';

interface BriefingProps {
  session: Session;
  onBack: () => void;
  onStart: () => void;
}

export function Briefing({ session, onBack, onStart }: BriefingProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, position: 'relative', minHeight: 0 }}>
      <Header onBack={onBack} title="Briefing do manuseio" />
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 90 }}>
        <div style={{ padding: '6px 20px 0' }}>
          <div style={{ background: BRAND.ink, color: '#fff', borderRadius: 20, padding: 18, overflow: 'hidden' }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.55, textTransform: 'uppercase', fontWeight: 500 }}>Caixa</div>
            <div style={{ fontWeight: 600, fontSize: 26, letterSpacing: -0.4, marginTop: 4, lineHeight: 1 }}>{session.boxId}</div>
            <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85, lineHeight: 1.35 }}>{session.medication}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 11, opacity: 0.6, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>Lote</div>
                <div style={{ marginTop: 2, fontWeight: 500, fontSize: 12 }}>{session.lot}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>Origem</div>
                <div style={{ marginTop: 2, fontWeight: 500, fontSize: 12 }}>{session.origem}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>Destino</div>
                <div style={{ marginTop: 2, fontWeight: 500, fontSize: 12 }}>{session.destino}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, opacity: 0.6 }}>
              <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>Remetente</div>
              <div style={{ marginTop: 2, fontWeight: 500, fontSize: 12 }}>{session.remetente}</div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 11, opacity: 0.6 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>Doc / Minuta</div>
                <div style={{ marginTop: 2, fontWeight: 500, fontSize: 12 }}>{session.docMinuta}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '22px 20px 4px' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>O que você vai fazer</div>
          <div style={{ fontSize: 12, color: BRAND.ink3, marginTop: 2 }}>8 etapas · fotos automáticas com carimbo</div>
        </div>
        <Timeline steps={STEPS} />
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5,
        padding: `14px 20px ${BOT}`,
        background: `linear-gradient(to top, ${BRAND.bg} 70%, ${BRAND.bg}00)`,
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <PrimaryBtn onClick={onStart}>Iniciar manuseio {Icon.arrow(16, '#fff')}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
