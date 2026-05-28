import React, { useState, useEffect } from 'react';
import { BRAND, TOP, BOT, STEPS } from '../../constants';
import { Icon } from '../icons';
import { PrimaryBtn, GhostBtn } from '../shared';
import { Camera } from './Camera';
import { SignStep } from './SignStep';
import type { Session } from '../../types';

interface WizardProps {
  session: Session;
  stepIdx: number;
  setStepIdx: (i: number) => void;
  onCancel: () => void;
  onCapture: (stepId: string, value?: string, dataUrl?: string) => void;
  onFinish: () => void;
  userName?: string;
}

export function Wizard({ session, stepIdx, setStepIdx, onCancel, onCapture, onFinish, userName = 'Operador' }: WizardProps) {
  const step  = STEPS[stepIdx];
  const photo = session.photos[step.id];
  const [mode, setMode]               = useState<'camera' | 'guide' | 'preview'>(photo?.taken ? 'guide' : 'camera');
  const [tempInput, setTempInput]     = useState<string>(session.temps[step.id] || (step.needsTemp ? '5.0' : ''));
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);

  useEffect(() => {
    const prevTemp = session.temps[STEPS[stepIdx]?.id];
    setTempInput(prevTemp || (STEPS[stepIdx]?.needsTemp ? '5.0' : ''));
    setMode(session.photos[STEPS[stepIdx]?.id]?.taken ? 'guide' : 'camera');
    setPendingPhoto(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  const isLast     = stepIdx === STEPS.length - 1;
  const canAdvance = photo?.taken && (!step.needsTemp || (tempInput?.length ?? 0) > 0);

  if (mode === 'camera') {
    return <Camera step={step} session={session} userName={userName} tempValue={tempInput}
      onClose={() => setMode('guide')}
      onShoot={dataUrl => { setPendingPhoto(dataUrl); setMode('preview'); }} />;
  }

  if (mode === 'preview' && pendingPhoto) {
    return (
      <div style={{ flex: 1, position: 'relative', background: '#000', overflow: 'hidden' }}>
        <img src={pendingPhoto} alt="Foto capturada"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5,
          padding: `16px 20px ${BOT}`,
          background: 'linear-gradient(to top, rgba(0,0,0,0.82) 60%, transparent)',
          display: 'flex', gap: 12,
        }}>
          <GhostBtn onClick={() => { setPendingPhoto(null); setMode('camera'); }}
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.30)', flex: 1 }}>
            Refazer
          </GhostBtn>
          <PrimaryBtn
            style={{ flex: 2, background: '#fff', color: BRAND.ink }}
            onClick={() => {
              onCapture(step.id, step.needsTemp ? tempInput : undefined, pendingPhoto);
              setPendingPhoto(null);
              setMode('guide');
            }}>
            Usar foto {Icon.check(16, BRAND.ink)}
          </PrimaryBtn>
        </div>
      </div>
    );
  }

  if (step.isSign) {
    return <SignStep session={session} stepIdx={stepIdx} setStepIdx={setStepIdx}
      onCancel={onCancel} onCapture={onCapture} onFinish={onFinish} />;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, overflow: 'hidden' }}>
      {/* slim header */}
      <div style={{ padding: `${TOP} 20px 0`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => stepIdx > 0 ? setStepIdx(stepIdx - 1) : onCancel()}
          style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${BRAND.line}`, background: BRAND.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {Icon.chevron(14, BRAND.ink, 'left')}
        </button>
        <div style={{ flex: 1, fontSize: 11, color: BRAND.ink3, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 500 }}>
          {session.boxId} · Etapa {stepIdx + 1} de {STEPS.length}
        </div>
        <button onClick={onCancel}
          style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${BRAND.line}`, background: BRAND.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.close(16)}
        </button>
      </div>
      {/* progress */}
      <div style={{ padding: '10px 20px 0', display: 'flex', gap: 4, flexShrink: 0 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= stepIdx ? BRAND.ink : BRAND.ink4 }} />
        ))}
      </div>

      {photo?.taken ? (
        <>
          <div style={{ padding: '12px 20px 6px', flexShrink: 0 }}>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: 20, letterSpacing: -0.3, lineHeight: 1.2 }}>{step.title}</h2>
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: '0 20px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 20, right: 20, bottom: 0, borderRadius: 18, overflow: 'hidden' }}>
              <img src={photo.dataUrl!} alt={step.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => setMode('camera')} style={{
                position: 'absolute', top: 10, right: 10,
                padding: '8px 14px', borderRadius: 99,
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)',
                border: 'none', fontSize: 11, fontWeight: 500, color: BRAND.ink,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>{Icon.camera(13)} Refazer</button>
            </div>
          </div>
          {step.needsTemp && (
            <div style={{ padding: '10px 20px 0', flexShrink: 0 }}>
              <div style={{
                background: BRAND.card, borderRadius: 16, padding: '14px 16px',
                border: `1px solid ${BRAND.line}`, display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {Icon.thermo(20, BRAND.cold)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', color: BRAND.ink3, fontWeight: 500 }}>Temperatura medida</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                    <input type="number" step="0.1" value={tempInput}
                      onChange={e => { setTempInput(e.target.value); onCapture(step.id, e.target.value); }}
                      placeholder="—"
                      style={{ width: 76, border: 'none', outline: 'none', background: 'transparent', fontWeight: 600, fontSize: 24, color: BRAND.ink, padding: 0 }} />
                    <span style={{ fontWeight: 500, fontSize: 15, color: BRAND.ink2 }}>°C</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: BRAND.ink3 }}>Alvo: 2–8 °C</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={{ flexShrink: 0, padding: `12px 20px ${BOT}` }}>
            <PrimaryBtn disabled={!canAdvance} onClick={() => setStepIdx(stepIdx + 1)}>
              {isLast ? 'Finalizar' : 'Próxima etapa'} {Icon.arrow(16, '#fff')}
            </PrimaryBtn>
          </div>
        </>
      ) : (
        <>
          <div style={{ flex: 1, overflow: 'auto', padding: '22px 20px 0' }}>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: 24, letterSpacing: -0.4, lineHeight: 1.15 }}>{step.title}</h2>
            <p style={{ marginTop: 6, fontSize: 13, color: BRAND.ink3, lineHeight: 1.45 }}>{step.sub}</p>
            <div style={{ marginTop: 18 }}>
              <button onClick={() => setMode('camera')} style={{
                width: '100%', height: 240, borderRadius: 14,
                background: BRAND.card, border: `1.5px dashed ${BRAND.ink4}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: BRAND.ink2,
              }}>
                <div style={{ width: 56, height: 56, borderRadius: 99, background: BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {Icon.camera(22)}
                </div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>Tocar para tirar foto</div>
                <div style={{ fontSize: 11, color: BRAND.ink3 }}>Carimbo de data, hora e caixa será adicionado</div>
              </button>
            </div>
            {step.needsTemp && (
              <div style={{ marginTop: 14 }}>
                <div style={{
                  background: BRAND.card, borderRadius: 18, padding: 18,
                  border: `1px solid ${BRAND.line}`, display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {Icon.thermo(22, BRAND.cold)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: BRAND.ink3, fontWeight: 500 }}>Temperatura medida</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                      <input type="number" step="0.1" value={tempInput}
                        onChange={e => { setTempInput(e.target.value); onCapture(step.id, e.target.value); }}
                        placeholder="—"
                        style={{ width: 80, border: 'none', outline: 'none', background: 'transparent', fontWeight: 600, fontSize: 26, color: BRAND.ink, padding: 0 }} />
                      <span style={{ fontWeight: 500, fontSize: 16, color: BRAND.ink2 }}>°C</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: BRAND.ink3 }}>Alvo: 2–8 °C</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div style={{ height: 100 }} />
          </div>
          <div style={{ flexShrink: 0, padding: `12px 20px ${BOT}`, background: `linear-gradient(to top, ${BRAND.bg} 70%, ${BRAND.bg}00)` }}>
            <PrimaryBtn disabled={!canAdvance} onClick={() => setStepIdx(stepIdx + 1)}>
              {isLast ? 'Finalizar' : 'Próxima etapa'} {Icon.arrow(16, '#fff')}
            </PrimaryBtn>
          </div>
        </>
      )}
    </div>
  );
}
