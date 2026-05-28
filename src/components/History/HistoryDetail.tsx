import React, { useState } from 'react';
import { BRAND, BOT, STEPS } from '../../constants';
import { Icon } from '../icons';
import { Header, Photo, Pill } from '../shared';
import { TempCell } from '../Wizard/Receipt';
import { formatTs, formatShort } from '../../utils';
import type { HistoryEntry } from '../../types';

interface HistoryDetailProps {
  entry: HistoryEntry | undefined;
  onBack: () => void;
}

export function HistoryDetail({ entry, onBack }: HistoryDetailProps) {
  if (!entry) return null;

  const mkDay = (offset: number) => { const d = new Date(entry.completedAt); d.setDate(d.getDate() - offset); return d; };
  const days = [mkDay(2), mkDay(1), entry.completedAt];
  const [activeIdx, setActiveIdx] = useState(days.length - 1);
  const mo = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const tab = (d: Date, isCur: boolean) => ({
    top: isCur ? 'Atual' : mo[d.getMonth()],
    mid: isCur
      ? `${String(d.getDate()).padStart(2,'0')} ${mo[d.getMonth()]}`
      : String(d.getDate()).padStart(2,'0'),
    bot: d.getFullYear(),
  });

  const compartilhar = async () => {
    const W = 1080;
    const photos = STEPS.map(s => entry.photos[s.id]).filter(p => p?.dataUrl);
    const photoH = Math.round(W * 9 / 16);
    const headerH = 240;
    const gap = 24;
    const H = headerH + photos.length * (photoH + gap) + gap;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = Math.max(H, headerH + gap);
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#F5F1EA';
    ctx.fillRect(0, 0, W, canvas.height);
    ctx.fillStyle = '#282828';
    ctx.fillRect(0, 0, W, headerH);

    ctx.fillStyle = '#fff';
    ctx.font = '700 52px system-ui,sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('VESTRA · TermoLab Track', 52, 76);

    ctx.font = '500 34px system-ui,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(`Caixa ${entry.boxId}`, 52, 128);

    ctx.font = '400 26px system-ui,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.62)';
    const medShort = entry.medication.length > 46 ? entry.medication.slice(0, 44) + '…' : entry.medication;
    ctx.fillText(medShort, 52, 170);
    ctx.fillText(`Temp. final: ${entry.temps.temp3 || '—'}°C  ·  ${formatTs(entry.completedAt)}`, 52, 210);

    let y = headerH + gap;
    for (const p of photos) {
      await new Promise<void>(resolve => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 40, y, W - 80, photoH); y += photoH + gap; resolve(); };
        img.onerror = () => resolve();
        img.src = p.dataUrl!;
      });
    }

    canvas.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], `termolab-${entry.boxId}.jpg`, { type: 'image/jpeg' });
      try {
        const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
        if (navigator.share && nav.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `Manuseio ${entry.boxId}`,
            text: `TermoLab Track · ${entry.boxId} · ${entry.medication}`,
            files: [file],
          });
        } else {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `termolab-${entry.boxId}.jpg`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        }
      } catch (e) {
        const err = e as Error;
        if (err.name !== 'AbortError') console.error('[TermoLab] share error', e);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, overflow: 'hidden' }}>
      <Header onBack={onBack} title="Manuseio" right={
        <button onClick={compartilhar} style={{
          padding: '8px 12px', borderRadius: 99,
          border: `1px solid ${BRAND.line}`, background: BRAND.card,
          fontSize: 11, fontWeight: 500, color: BRAND.ink,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {Icon.share(14, BRAND.ink)} Compartilhar
        </button>
      } />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* box card */}
        <div style={{ padding: '6px 20px 0' }}>
          <div style={{ background: BRAND.ink, color: '#fff', borderRadius: 20, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.55, textTransform: 'uppercase', fontWeight: 500 }}>Caixa</div>
                <div style={{ fontWeight: 600, fontSize: 24, letterSpacing: -0.4, marginTop: 2 }}>{entry.boxId}</div>
              </div>
              <Pill tone="cold">Concluído</Pill>
            </div>
            <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85 }}>{entry.medication}</div>
            <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 11, opacity: 0.7, flexWrap: 'wrap' }}>
              {([['Lote', entry.lot], ['Operador', entry.operator], ['Início', formatShort(entry.startedAt)], ['Fim', formatShort(entry.completedAt)]] as [string, string | undefined][]).map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ marginTop: 2, fontWeight: 500, fontSize: 12, color: '#fff' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* day tabs */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontSize: 11, color: BRAND.ink3, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>
            Manuseios desta caixa
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {days.map((d, i) => {
              const isCur = i === days.length - 1;
              const active = i === activeIdx;
              const t = tab(d, isCur);
              return (
                <button key={i} onClick={() => setActiveIdx(i)} style={{
                  flex: 1, padding: '10px 6px', borderRadius: 14,
                  background: active ? BRAND.ink : BRAND.card,
                  border: active ? `1px solid ${BRAND.ink}` : `1px solid ${BRAND.line}`,
                  color: active ? '#fff' : BRAND.ink,
                  textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  <span style={{ fontSize: 10, letterSpacing: 0.5, fontWeight: 500, opacity: active ? 0.7 : 0.55, textTransform: 'uppercase' }}>{t.top}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1 }}>{t.mid}</span>
                  <span style={{ fontSize: 10, fontWeight: 400, opacity: active ? 0.6 : 0.5 }}>{t.bot}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* temps */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Temperaturas</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <TempCell label="Inicial"  value={entry.temps.temp1} />
            <TempCell label="Sem gelo" value={entry.temps.temp2} />
            <TempCell label="Final"    value={entry.temps.temp3} ok />
          </div>
        </div>
        {/* photo grid */}
        <div style={{ padding: '22px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Fotos do manuseio</div>
          <span style={{ fontSize: 11, color: BRAND.ink3 }}>{Object.keys(entry.photos).length} arquivos</span>
        </div>
        <div style={{ padding: `10px 20px ${BOT}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {STEPS.map(s => {
            const p = entry.photos[s.id];
            return (
              <div key={s.id}>
                <Photo label={s.label} hue={s.hue} stamped
                  timestamp={p?.ts} boxId={entry.boxId} stage={s.stage} height_force={140}
                  dataUrl={p?.dataUrl} />
                <div style={{ fontSize: 11, color: BRAND.ink2, marginTop: 6, fontWeight: 500 }}>{s.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
