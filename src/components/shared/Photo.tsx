import React from 'react';

interface PhotoProps {
  label?: string;
  hue?: number;
  height?: number;
  stamped?: boolean;
  timestamp?: string;
  boxId?: string;
  stage?: string;
  height_force?: number;
  dataUrl?: string | null;
}

export function Photo({ label = 'FOTO', hue = 200, height = 280, stamped, timestamp, boxId, stage, height_force, dataUrl }: PhotoProps) {
  const h = height_force || height;
  return (
    <div style={{
      width: '100%', height: h, borderRadius: 14, overflow: 'hidden', position: 'relative',
      background: dataUrl ? '#000'
        : `repeating-linear-gradient(135deg,
            oklch(0.78 0.04 ${hue}), oklch(0.78 0.04 ${hue}) 10px,
            oklch(0.83 0.04 ${hue}) 10px, oklch(0.83 0.04 ${hue}) 20px)`,
    }}>
      {dataUrl ? (
        <img src={dataUrl} alt={label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono,ui-monospace,monospace', fontSize: 11, letterSpacing: 1.5,
          color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase',
        }}>{label}</div>
      )}
      {stamped && !dataUrl && (
        <div style={{
          position: 'absolute', left: 10, bottom: 10, right: 10,
          padding: '8px 10px', borderRadius: 8,
          background: 'rgba(0,0,0,0.72)', color: '#FFE9B8',
          fontFamily: 'JetBrains Mono,ui-monospace,monospace',
          fontSize: 10, lineHeight: 1.45, letterSpacing: 0.2,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: 2 }}>VESTRA · TermoLab Track</div>
            <div>{boxId || 'CX-8841'} · {stage || 'ETAPA'}</div>
          </div>
          <div style={{ textAlign: 'right', color: '#fff' }}>{timestamp || '—'}</div>
        </div>
      )}
    </div>
  );
}
