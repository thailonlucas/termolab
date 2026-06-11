import React, { useEffect, useState } from 'react';
import { BRAND, BOT } from '../../constants';
import { Icon } from '../icons';
import { Header, Photo, Pill } from '../shared';
import { formatTs } from '../../utils';
import type { HistoryEntry } from '../../types';
import { getHandlingSessions } from '../../lib/services/handlings';
import { getSignedUrl } from '../../lib/services/storage';

const MOVEMENT_HUES: Record<string, number> = {
  open_box: 30,
  temperature_reading: 200,
  remove_ice_layer: 195,
  add_ice: 165,
  place_in_cold_chamber: 210,
  remove_from_cold_chamber: 25,
  seal_box: 50,
  approval: 60,
};

const MO = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

const SESSION_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  approved:    { label: 'Aprovado',      bg: 'oklch(0.94 0.06 165)', color: 'oklch(0.38 0.10 165)' },
  submitted:   { label: 'Aguardando',    bg: 'oklch(0.96 0.06 75)',  color: 'oklch(0.48 0.12 75)'  },
  rejected:    { label: 'Rejeitado',     bg: 'oklch(0.95 0.05 25)',  color: 'oklch(0.50 0.14 25)'  },
  in_progress: { label: 'Em andamento',  bg: BRAND.bg,               color: BRAND.ink3              },
  cancelled:   { label: 'Cancelado',     bg: BRAND.bg,               color: BRAND.ink3              },
};

// Local types for session data fetched from Supabase.
type MovementData = {
  id: string;
  temperature_val: number | null;
  occurred_at: string;
  metadata: Record<string, unknown>;
  movement_types: { name: string; label: string; requires_photo: boolean; requires_temperature: boolean } | null;
  photoUrl: string | null;
};

type SessionData = {
  id: string;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  status: string;
  movements: MovementData[];
};

interface HistoryDetailProps {
  entry: HistoryEntry | undefined;
  onBack: () => void;
}

function SessionCard({ session, boxId }: { session: SessionData; boxId: string }) {
  const photoMovs = session.movements.filter(m => m.photoUrl);
  const tempMovs  = session.movements.filter(m => m.movement_types?.requires_temperature && m.temperature_val != null);
  const statusCfg = SESSION_STATUS[session.status] ?? SESSION_STATUS.submitted;
  const completedAt = session.completed_at ? new Date(session.completed_at) : null;

  const compartilharSession = async () => {
    const W = 1080;
    const photoH  = Math.round(W * 9 / 16);
    const headerH = 200;
    const gap     = 24;
    const H       = headerH + photoMovs.length * (photoH + gap) + gap;
    const canvas  = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = Math.max(H, headerH + gap);
    const ctx     = canvas.getContext('2d')!;

    ctx.fillStyle = '#F5F1EA'; ctx.fillRect(0, 0, W, canvas.height);
    ctx.fillStyle = '#282828'; ctx.fillRect(0, 0, W, headerH);
    ctx.fillStyle = '#fff';
    ctx.font = '700 48px system-ui,sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('VESTRA · TermoLab Track', 52, 70);
    ctx.font = '500 30px system-ui,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(`Caixa ${boxId}`, 52, 118);
    ctx.font = '400 24px system-ui,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.62)';
    const lastTempVal = tempMovs.at(-1)?.temperature_val;
    const lastTemp = lastTempVal != null ? `${lastTempVal}°C` : '—';
    ctx.fillText(`Temp. final: ${lastTemp}  ·  ${completedAt ? formatTs(completedAt) : '—'}`, 52, 164);

    let y = headerH + gap;
    for (const mov of photoMovs) {
      await new Promise<void>(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => { ctx.drawImage(img, 40, y, W - 80, photoH); y += photoH + gap; resolve(); };
        img.onerror = () => resolve();
        img.src = mov.photoUrl!;
      });
    }

    canvas.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], `termolab-${boxId}.jpg`, { type: 'image/jpeg' });
      try {
        const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
        if (navigator.share && nav.canShare?.({ files: [file] })) {
          await navigator.share({ title: `Sessão ${boxId}`, files: [file] });
        } else {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `termolab-${boxId}.jpg`;
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
    <div style={{
      background: BRAND.card, borderRadius: 18, border: `1px solid ${BRAND.line}`,
      overflow: 'hidden',
    }}>
      {/* session header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              {completedAt
                ? `${String(completedAt.getDate()).padStart(2,'0')} ${MO[completedAt.getMonth()]} ${completedAt.getFullYear()}`
                : 'Em andamento'}
            </span>
            <span style={{
              fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
              background: statusCfg.bg, color: statusCfg.color,
            }}>
              {statusCfg.label}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: BRAND.ink3, marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span>{session.movements.length} movimentaç{session.movements.length === 1 ? 'ão' : 'ões'}</span>
            {photoMovs.length > 0 && <span>{photoMovs.length} foto{photoMovs.length !== 1 ? 's' : ''}</span>}
            {completedAt && (
              <span style={{ opacity: 0.7 }}>
                {String(completedAt.getHours()).padStart(2,'0')}:{String(completedAt.getMinutes()).padStart(2,'0')}
              </span>
            )}
          </div>
          {/* temperature summary */}
          {tempMovs.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tempMovs.map((mov, i) => (
                <span key={mov.id} style={{
                  fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6,
                  background: i === tempMovs.length - 1 ? 'oklch(0.94 0.06 165)' : BRAND.bg,
                  color: i === tempMovs.length - 1 ? 'oklch(0.38 0.10 165)' : BRAND.ink2,
                  border: `1px solid ${i === tempMovs.length - 1 ? 'oklch(0.75 0.10 165)' : BRAND.line}`,
                }}>
                  {(mov.movement_types?.label ?? '').replace('Temperature Reading', 'Temp.')} {mov.temperature_val}°C
                </span>
              ))}
            </div>
          )}
          {session.notes && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: BRAND.ink3, fontStyle: 'italic' }}>
              {session.notes}
            </div>
          )}
        </div>
        {photoMovs.length > 0 && (
          <button onClick={compartilharSession} style={{
            padding: '6px 10px', borderRadius: 8,
            border: `1px solid ${BRAND.line}`, background: BRAND.bg,
            fontSize: 10.5, fontWeight: 500, color: BRAND.ink2, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {Icon.share(12, BRAND.ink2)}
          </button>
        )}
      </div>

      {/* movements grid */}
      {session.movements.length > 0 && (
        <div style={{ borderTop: `1px solid ${BRAND.line}` }}>
          <div style={{ padding: '10px 16px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {session.movements.map(mov => {
              const hue = MOVEMENT_HUES[mov.movement_types?.name ?? ''] ?? 200;
              return (
                <div key={mov.id}>
                  <Photo
                    label={mov.movement_types?.label ?? ''}
                    hue={hue}
                    stamped
                    timestamp={mov.occurred_at}
                    boxId={boxId}
                    stage={(mov.movement_types?.name ?? '').replace(/_/g, ' ').toUpperCase()}
                    height_force={90}
                    dataUrl={mov.photoUrl}
                  />
                  <div style={{ fontSize: 9.5, color: BRAND.ink3, marginTop: 4, lineHeight: 1.3 }}>
                    {mov.movement_types?.label ?? ''}
                    {mov.temperature_val != null && (
                      <span style={{ color: BRAND.cold, fontWeight: 500, display: 'block' }}>{mov.temperature_val}°C</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoryDetail({ entry, onBack }: HistoryDetailProps) {
  const [sessions, setSessions]         = useState<SessionData[]>([]);
  const [loadingSessions, setLoading]   = useState(false);

  useEffect(() => {
    if (!entry) return;
    setLoading(true);
    setSessions([]);

    getHandlingSessions(entry.id).then(async rawSessions => {
      const processed = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rawSessions.map(async (sess: any) => {
          const statuses: Array<{ status: string; created_at: string }> = sess.session_statuses ?? [];
          const status = statuses
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.status ?? 'submitted';

          const movements: MovementData[] = await Promise.all(
            (sess.movements ?? []).map(async (mov: any) => {
              const file = (mov.movement_files ?? [])[0] as { storage_path: string } | undefined;
              let photoUrl: string | null = null;
              if (file?.storage_path) {
                photoUrl = await getSignedUrl('handling-photos', file.storage_path).catch(() => null);
              }
              return {
                id: mov.id as string,
                temperature_val: mov.temperature_val as number | null,
                occurred_at: mov.occurred_at as string,
                metadata: (mov.metadata ?? {}) as Record<string, unknown>,
                movement_types: mov.movement_types as MovementData['movement_types'],
                photoUrl,
              };
            })
          );

          return {
            id: sess.id as string,
            started_at: sess.started_at as string,
            completed_at: sess.completed_at as string | null,
            notes: sess.notes as string | null,
            status,
            movements,
          };
        })
      );
      setSessions(processed);
    })
      .catch(err => console.error('[TermoLab] Failed to load sessions:', err))
      .finally(() => setLoading(false));
  }, [entry?.id]);

  if (!entry) return null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, overflow: 'hidden' }}>
      <Header onBack={onBack} title="Manuseio" />

      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* box card */}
        <div style={{ padding: '6px 20px 0' }}>
          <div style={{ background: BRAND.ink, color: '#fff', borderRadius: 20, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.55, textTransform: 'uppercase', fontWeight: 500 }}>Caixa</div>
                <div style={{ fontWeight: 600, fontSize: 24, letterSpacing: -0.4, marginTop: 2 }}>{entry.boxId}</div>
              </div>
              <Pill tone="cold">{entry.sessionCount} sessão{entry.sessionCount !== 1 ? 'ões' : ''}</Pill>
            </div>
            <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85 }}>{entry.medication}</div>
            <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 11, opacity: 0.7, flexWrap: 'wrap' }}>
              {([
                ['Lote',     entry.lot],
                ['Operador', entry.operator],
                ['Origem',   entry.origem],
                ['Destino',  entry.destino],
              ] as [string, string | undefined][]).map(([l, v]) => v && (
                <div key={l}>
                  <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ marginTop: 2, fontWeight: 500, fontSize: 12, color: '#fff' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* sessions */}
        <div style={{ padding: '18px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Sessões de manuseio</div>
          {!loadingSessions && (
            <span style={{ fontSize: 11, color: BRAND.ink3 }}>
              {sessions.length} sessão{sessions.length !== 1 ? 'ões' : ''}
            </span>
          )}
        </div>

        <div style={{ padding: `10px 20px ${BOT}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {loadingSessions ? (
            [1, 2].map(i => (
              <div key={i} style={{
                height: 100, borderRadius: 18,
                background: BRAND.card, border: `1px solid ${BRAND.line}`,
                opacity: 0.4 + i * 0.2,
              }} />
            ))
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: BRAND.ink3, fontSize: 13 }}>
              Nenhuma sessão registrada.
            </div>
          ) : (
            sessions.map(session => (
              <SessionCard key={session.id} session={session} boxId={entry.boxId} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
