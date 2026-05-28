import React, { useState, useRef, useEffect } from 'react';
import { BRAND, TOP, BOT, STEPS } from '../../constants';
import { Icon } from '../icons';
import { PrimaryBtn } from '../shared';
import { Receipt } from './Receipt';
import type { Session } from '../../types';

interface SignStepProps {
  session: Session;
  stepIdx: number;
  setStepIdx: (i: number) => void;
  onCancel: () => void;
  onCapture: (stepId: string, value?: string, dataUrl?: string) => void;
  onFinish: () => void;
}

export function SignStep({ session, stepIdx, setStepIdx, onCancel, onCapture, onFinish }: SignStepProps) {
  const [paths,   setPaths]   = useState<[number, number][][]>([]);
  const [drawing, setDrawing] = useState(false);
  const [current, setCurrent] = useState<[number, number][]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const pt = (e: React.MouseEvent | React.TouchEvent): [number, number] => {
    const r = svgRef.current!.getBoundingClientRect();
    const t = 'touches' in e ? e.touches[0] : e;
    return [t.clientX - r.left, t.clientY - r.top];
  };
  const start = (e: React.MouseEvent | React.TouchEvent) => { setDrawing(true); setCurrent([pt(e)]); };
  const move  = (e: React.MouseEvent | React.TouchEvent) => { if (!drawing) return; setCurrent(c => [...c, pt(e)]); };
  const end   = () => { if (!drawing) return; setDrawing(false); setPaths(p => [...p, current]); setCurrent([]); };
  const clear = () => { setPaths([]); setCurrent([]); };
  const hasSig = paths.length > 0 || current.length > 0;

  useEffect(() => {
    if (hasSig && !session.photos['sign']) onCapture('sign');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSig]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, overflow: 'hidden' }}>
      <div style={{ padding: `${TOP} 20px 0`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => setStepIdx(stepIdx - 1)} style={{
          width: 38, height: 38, borderRadius: 12, border: `1px solid ${BRAND.line}`, background: BRAND.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon.chevron(14, BRAND.ink, 'left')}
        </button>
        <div style={{ flex: 1, fontSize: 11, color: BRAND.ink3, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 500 }}>
          {session.boxId} · Etapa {stepIdx + 1} de {STEPS.length}
        </div>
        <button onClick={onCancel} style={{
          width: 38, height: 38, borderRadius: 12, border: `1px solid ${BRAND.line}`, background: BRAND.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon.close(16)}
        </button>
      </div>
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 4, flexShrink: 0 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= stepIdx ? BRAND.ink : BRAND.ink4 }} />
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '22px 20px 0' }}>
        <h2 style={{ margin: 0, fontWeight: 600, fontSize: 24, letterSpacing: -0.4 }}>Canhoto digital</h2>
        <p style={{ marginTop: 6, fontSize: 13, color: BRAND.ink3 }}>Confira os dados e assine para concluir o manuseio.</p>
        <div style={{ marginTop: 14, background: BRAND.card, border: `1px solid ${BRAND.line}`, borderRadius: 18, padding: 16 }}>
          <Receipt session={session} />
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{
            fontSize: 11, color: BRAND.ink3, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 500,
            marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>Assinatura do operador</span>
            {hasSig && (
              <button onClick={clear} style={{ background: 'none', border: 'none', fontSize: 11, color: BRAND.ink2, fontWeight: 500 }}>Limpar</button>
            )}
          </div>
          <div style={{ background: BRAND.card, border: `1px solid ${BRAND.line}`, borderRadius: 14, height: 140, position: 'relative', overflow: 'hidden', touchAction: 'none' }}>
            <svg ref={svgRef} width="100%" height="100%"
              onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
              onTouchStart={start} onTouchMove={move} onTouchEnd={end}
              style={{ display: 'block', cursor: 'crosshair' }}>
              {paths.map((p, i) => (
                <polyline key={i} points={p.map(([x, y]) => `${x},${y}`).join(' ')}
                  fill="none" stroke={BRAND.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {current.length > 0 && (
                <polyline points={current.map(([x, y]) => `${x},${y}`).join(' ')}
                  fill="none" stroke={BRAND.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
            {!hasSig && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'none', color: BRAND.ink3, fontSize: 13 }}>
                {Icon.signature(16, BRAND.ink3)} Assine aqui
              </div>
            )}
            <div style={{ position: 'absolute', left: 16, right: 16, bottom: 14, height: 1, background: BRAND.line }} />
          </div>
        </div>
        <div style={{ height: 90 }} />
      </div>
      <div style={{ flexShrink: 0, padding: `12px 20px ${BOT}` }}>
        <PrimaryBtn disabled={!hasSig} onClick={onFinish}>
          Concluir manuseio {Icon.check(16, '#fff')}
        </PrimaryBtn>
      </div>
    </div>
  );
}
