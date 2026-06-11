import React, { useState, useEffect } from 'react';
import { BRAND, TOP, BOT } from '../../constants';
import { Icon } from '../icons';
import { PrimaryBtn, GhostBtn } from '../shared';
import { Camera } from './Camera';
import { getMovementTypes } from '../../lib/services/movement-types';
import { formatTs } from '../../utils';
import type { DbMovementType } from '../../lib/database.types';
import type { Session, LocalMovement, PhotoEntry } from '../../types';

type WizardMode = 'list' | 'pick-type' | 'camera' | 'preview' | 'add-temp';

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

interface WizardProps {
  session: Session;
  onCancel: () => void;
  onFinish: (movements: LocalMovement[]) => void;
  userName?: string;
}

export function Wizard({ session, onCancel, onFinish, userName = 'Operador' }: WizardProps) {
  const [movements, setMovements]       = useState<LocalMovement[]>([]);
  const [mode, setMode]                 = useState<WizardMode>('list');
  const [movTypes, setMovTypes]         = useState<DbMovementType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [selectedType, setSelectedType] = useState<DbMovementType | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [tempInput, setTempInput]       = useState('');

  useEffect(() => {
    getMovementTypes(true)
      .then(setMovTypes)
      .catch(() => {})
      .finally(() => setLoadingTypes(false));
  }, []);

  const pickType = (type: DbMovementType) => {
    setSelectedType(type);
    setTempInput('');
    setPendingPhoto(null);
    if (type.requires_photo) {
      setMode('camera');
    } else if (type.requires_temperature) {
      setMode('add-temp');
    } else {
      commitMovement(type, null, '');
    }
  };

  const handleShoot = (dataUrl: string) => {
    setPendingPhoto(dataUrl);
    setMode('preview');
  };

  const confirmPhoto = () => {
    if (!selectedType) return;
    if (selectedType.requires_temperature) {
      setMode('add-temp');
    } else {
      commitMovement(selectedType, pendingPhoto, '');
    }
  };

  const confirmTemp = () => {
    if (!selectedType) return;
    commitMovement(selectedType, pendingPhoto, tempInput);
  };

  const commitMovement = (type: DbMovementType, photoDataUrl: string | null, temp: string) => {
    const now = new Date();
    const photo: PhotoEntry | null = photoDataUrl
      ? { taken: true, ts: formatTs(now), dataUrl: photoDataUrl }
      : null;
    const newMov: LocalMovement = {
      localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      movementTypeId: type.id,
      movementTypeName: type.name,
      movementTypeLabel: type.label,
      requiresPhoto: type.requires_photo,
      requiresTemperature: type.requires_temperature,
      photo,
      temperature: temp,
      occurredAt: now,
    };
    setMovements(m => [...m, newMov]);
    setSelectedType(null);
    setPendingPhoto(null);
    setTempInput('');
    setMode('list');
  };

  const removeMovement = (localId: string) => {
    setMovements(m => m.filter(x => x.localId !== localId));
  };

  const redoMovement = (localId: string) => {
    const mov = movements.find(m => m.localId === localId);
    if (!mov) return;
    removeMovement(localId);
    const type = movTypes.find(t => t.id === mov.movementTypeId);
    if (type) pickType(type);
    else setMode('pick-type');
  };

  // ── Camera ──────────────────────────────────────────────────────────────────
  if (mode === 'camera' && selectedType) {
    return (
      <Camera
        label={selectedType.label}
        stage={selectedType.name.replace(/_/g, ' ').toUpperCase()}
        session={session}
        userName={userName}
        onClose={() => setMode('pick-type')}
        onShoot={handleShoot}
      />
    );
  }

  // ── Preview ─────────────────────────────────────────────────────────────────
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
          <PrimaryBtn style={{ flex: 2, background: '#fff', color: BRAND.ink }} onClick={confirmPhoto}>
            Usar foto {Icon.check(16, BRAND.ink)}
          </PrimaryBtn>
        </div>
      </div>
    );
  }

  // ── Temperature input ───────────────────────────────────────────────────────
  if (mode === 'add-temp' && selectedType) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, overflow: 'hidden' }}>
        <div style={{ padding: `${TOP} 20px 0`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => pendingPhoto ? setMode('preview') : setMode('pick-type')}
            style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${BRAND.line}`, background: BRAND.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.chevron(14, BRAND.ink, 'left')}
          </button>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 16, letterSpacing: -0.2 }}>{selectedType.label}</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 0' }}>
          {pendingPhoto && (
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 200, marginBottom: 20 }}>
              <img src={pendingPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div style={{ background: BRAND.card, borderRadius: 18, padding: 18, border: `1px solid ${BRAND.line}`, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icon.thermo(22, BRAND.cold)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: BRAND.ink3, fontWeight: 500 }}>Temperatura medida</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <input type="number" step="0.1" value={tempInput} autoFocus
                  onChange={e => setTempInput(e.target.value)}
                  placeholder="—"
                  style={{ width: 80, border: 'none', outline: 'none', background: 'transparent', fontWeight: 600, fontSize: 26, color: BRAND.ink, padding: 0 }} />
                <span style={{ fontWeight: 500, fontSize: 16, color: BRAND.ink2 }}>°C</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: BRAND.ink3 }}>Alvo: 2–8 °C</span>
              </div>
            </div>
          </div>
          <div style={{ height: 100 }} />
        </div>
        <div style={{ flexShrink: 0, padding: `12px 20px ${BOT}` }}>
          <PrimaryBtn disabled={!tempInput} onClick={confirmTemp}>
            Confirmar {Icon.check(16, '#fff')}
          </PrimaryBtn>
        </div>
      </div>
    );
  }

  // ── Movement type picker ────────────────────────────────────────────────────
  if (mode === 'pick-type') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, overflow: 'hidden' }}>
        <div style={{ padding: `${TOP} 20px 0`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => setMode('list')}
            style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${BRAND.line}`, background: BRAND.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.chevron(14, BRAND.ink, 'left')}
          </button>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 16, letterSpacing: -0.2 }}>Tipo de movimentação</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px' }}>
          {loadingTypes && (
            <div style={{ color: BRAND.ink3, fontSize: 13, textAlign: 'center', marginTop: 40 }}>Carregando tipos…</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {movTypes.map(t => (
              <button key={t.id} onClick={() => pickType(t)} style={{
                width: '100%', padding: '14px 16px', borderRadius: 14,
                background: BRAND.card, border: `1px solid ${BRAND.line}`,
                display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                cursor: 'pointer',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {t.requires_temperature ? Icon.thermo(20, BRAND.cold) : Icon.camera(18, BRAND.ink2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: BRAND.ink }}>{t.label}</div>
                  {t.description && (
                    <div style={{ fontSize: 11.5, color: BRAND.ink3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {t.requires_photo && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: BRAND.bg }}>
                      {Icon.camera(13, BRAND.ink3)}
                    </span>
                  )}
                  {t.requires_temperature && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, background: BRAND.bg }}>
                      {Icon.thermo(13, BRAND.cold)}
                    </span>
                  )}
                  {Icon.chevron(12, BRAND.ink3)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Session list (main screen) ───────────────────────────────────────────────
  const photoCount = movements.filter(m => m.photo).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, overflow: 'hidden' }}>
      {/* header */}
      <div style={{ padding: `${TOP} 20px 0`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1, fontSize: 11, color: BRAND.ink3, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 500 }}>
          {session.boxId}
          {movements.length > 0 && ` · ${movements.length} movimentaç${movements.length === 1 ? 'ão' : 'ões'}`}
        </div>
        <button onClick={onCancel}
          style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${BRAND.line}`, background: BRAND.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.close(16)}
        </button>
      </div>

      {/* movement list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px 0' }}>
        {movements.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: BRAND.ink3 }}>
            <div style={{ width: 64, height: 64, borderRadius: 99, background: BRAND.card, border: `1px solid ${BRAND.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {Icon.camera(24, BRAND.ink3)}
            </div>
            <div style={{ fontWeight: 500, fontSize: 14, color: BRAND.ink }}>Nenhuma movimentação</div>
            <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.45 }}>
              Adicione as movimentações realizadas na caixa para continuar
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {movements.map(mov => {
              const hue = MOVEMENT_HUES[mov.movementTypeName] ?? 200;
              return (
                <div key={mov.localId} style={{
                  background: BRAND.card, borderRadius: 14, border: `1px solid ${BRAND.line}`,
                  overflow: 'hidden', display: 'flex', minHeight: 72,
                }}>
                  {/* thumbnail or icon */}
                  <div style={{ width: 72, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    {mov.photo?.dataUrl ? (
                      <img src={mov.photo.dataUrl} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        background: `oklch(0.88 0.04 ${hue})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {mov.requiresTemperature ? Icon.thermo(24, BRAND.cold) : Icon.camera(20, BRAND.ink3)}
                      </div>
                    )}
                  </div>

                  {/* info */}
                  <div style={{ flex: 1, padding: '10px 12px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontWeight: 500, fontSize: 13, color: BRAND.ink }}>{mov.movementTypeLabel}</div>
                    <div style={{ fontSize: 11, color: BRAND.ink3, marginTop: 2 }}>
                      {mov.photo?.ts || formatTs(mov.occurredAt)}
                      {mov.temperature && (
                        <span style={{ color: BRAND.cold, fontWeight: 500 }}> · {mov.temperature}°C</span>
                      )}
                    </div>
                  </div>

                  {/* actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 10px', gap: 6, flexShrink: 0, justifyContent: 'center' }}>
                    <button onClick={() => redoMovement(mov.localId)} style={{
                      padding: '5px 10px', borderRadius: 8, border: `1px solid ${BRAND.line}`,
                      background: BRAND.bg, fontSize: 10.5, fontWeight: 500, color: BRAND.ink2,
                      whiteSpace: 'nowrap', cursor: 'pointer',
                    }}>Refazer</button>
                    <button onClick={() => removeMovement(mov.localId)} style={{
                      padding: '5px 10px', borderRadius: 8, border: `1px solid ${BRAND.danger}20`,
                      background: `${BRAND.danger}08`, fontSize: 10.5, fontWeight: 500, color: BRAND.danger,
                      whiteSpace: 'nowrap', cursor: 'pointer',
                    }}>Remover</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ height: 120 }} />
      </div>

      {/* bottom actions */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5,
        padding: `10px 20px ${BOT}`,
        background: `linear-gradient(to top, ${BRAND.bg} 70%, ${BRAND.bg}00)`,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        <GhostBtn onClick={() => setMode('pick-type')} style={{ pointerEvents: 'auto' }}>
          {Icon.plus(16, BRAND.ink)} Adicionar movimentação
        </GhostBtn>
        <PrimaryBtn
          disabled={movements.length === 0}
          onClick={() => onFinish(movements)}
          style={{ pointerEvents: 'auto' }}
        >
          Finalizar sessão {Icon.check(16, '#fff')}
        </PrimaryBtn>
      </div>
    </div>
  );
}
