import React, { useState, useEffect, useRef } from 'react';
import { BRAND, TOP, BOT } from '../../constants';
import { Icon } from '../icons';
import { PrimaryBtn, GhostBtn } from '../shared';
import { formatTs } from '../../utils';
import type { Session } from '../../types';

function _rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

interface CameraProps {
  label: string;     // movement type display name, shown in center hint
  stage: string;     // short label baked into the photo stamp
  session: Session;
  onClose: () => void;
  onShoot: (dataUrl: string) => void;
  userName?: string;
  tempValue?: string;
}

export function Camera({ label, stage, session, onClose, onShoot, userName = '', tempValue = '' }: CameraProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready,    setReady]    = useState(false);
  const [shooting, setShooting] = useState(false);
  const [flash,    setFlash]    = useState(false);
  const [err,      setErr]      = useState<string | null>(null);
  const [now,      setNow]      = useState(formatTs(new Date()));

  useEffect(() => {
    const t = setInterval(() => setNow(formatTs(new Date())), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let active = true;
    if (!navigator.mediaDevices?.getUserMedia) { setErr('unavailable'); return; }
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    }).then(stream => {
      if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      videoRef.current!.srcObject = stream;
    }).catch(e => {
      if (!active) return;
      setErr((e as Error).name === 'NotAllowedError' ? 'permission' : 'unavailable');
    });
    return () => { active = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const shoot = () => {
    if (shooting || !ready) return;
    setShooting(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 120);
    setTimeout(() => {
      const video  = videoRef.current!;
      const canvas = canvasRef.current!;
      const W = video.videoWidth  || 1280;
      const H = video.videoHeight || 720;
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);

      const [nowDate, nowTime] = now.split(' ');
      const hasExtra = !!(userName || tempValue);
      const pad    = Math.round(H * 0.012);
      const fs     = Math.min(Math.round(H * 0.018), 48);
      const lineH  = Math.round(fs * 2.0);
      const lines  = hasExtra ? 3 : 2;
      const stampH = lineH * lines + pad * 2;
      const ry     = H - stampH - pad;
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      _rrect(ctx, pad, ry, W - pad * 2, stampH, Math.round(H * 0.013));
      ctx.fill();

      const lx = pad * 2.5;
      const rx = W - pad * 2.5;
      const y1 = ry + pad + lineH * 0.78;
      const y2 = y1 + lineH;
      const y3 = y2 + lineH;

      ctx.font = `600 ${fs}px "JetBrains Mono",monospace`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText('VESTRA · TermoLab Track', lx, y1);
      ctx.textAlign = 'right';
      ctx.fillText(nowDate, rx, y1);

      ctx.font = `${Math.round(fs * 0.88)}px "JetBrains Mono",monospace`;
      ctx.fillStyle = '#FFE9B8';
      ctx.textAlign = 'left';
      ctx.fillText(`${session.boxId} · ${stage}`, lx, y2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.fillText(nowTime, rx, y2);

      if (hasExtra) {
        ctx.font = `${Math.round(fs * 0.88)}px "JetBrains Mono",monospace`;
        ctx.fillStyle = '#FFE9B8';
        ctx.textAlign = 'left';
        ctx.fillText(userName || '', lx, y3);
        if (tempValue) {
          ctx.textAlign = 'right';
          ctx.fillStyle = '#fff';
          ctx.fillText(`${tempValue}°C`, rx, y3);
        }
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      streamRef.current?.getTracks().forEach(t => t.stop());
      setShooting(false);
      onShoot(dataUrl);
    }, 180);
  };

  if (err) return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg,
      padding: `${TOP} 24px ${BOT}`, alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', gap: 16,
    }}>
      <div style={{ width: 68, height: 68, borderRadius: 99, background: BRAND.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Icon.camera(28, BRAND.ink3)}
      </div>
      <div style={{ fontWeight: 600, fontSize: 18 }}>
        {err === 'permission' ? 'Câmera bloqueada' : 'Câmera indisponível'}
      </div>
      <div style={{ fontSize: 13, color: BRAND.ink3, lineHeight: 1.5, maxWidth: 280 }}>
        {err === 'permission'
          ? 'Permita o acesso à câmera nas configurações do navegador para continuar.'
          : 'Não foi possível acessar a câmera neste dispositivo.'}
      </div>
      <PrimaryBtn onClick={() => {
        const W = 1280, H = 720;
        const cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        const cx = cv.getContext('2d')!;
        cx.fillStyle = '#1a2a1a';
        cx.fillRect(0, 0, W, H);
        cx.strokeStyle = 'rgba(255,255,255,0.07)';
        cx.lineWidth = 1;
        for (let i = 0; i < W; i += 80) { cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i, H); cx.stroke(); }
        for (let i = 0; i < H; i += 80) { cx.beginPath(); cx.moveTo(0, i); cx.lineTo(W, i); cx.stroke(); }
        const ts = new Date(); const pfn = (n: number) => String(n).padStart(2, '0');
        const d = `${pfn(ts.getDate())}/${pfn(ts.getMonth() + 1)}/${ts.getFullYear()}`;
        const t = `${pfn(ts.getHours())}:${pfn(ts.getMinutes())}:${pfn(ts.getSeconds())}`;
        const spad = Math.round(H * 0.012);
        const sfs = Math.min(Math.round(H * 0.018), 48);
        const slh = Math.round(sfs * 2.0);
        const ssh = slh * 2 + spad * 2;
        const sry = H - ssh - spad;
        cx.fillStyle = 'rgba(0,0,0,0.72)';
        cx.beginPath(); cx.roundRect(spad, sry, W - spad * 2, ssh, Math.round(H * 0.010)); cx.fill();
        const slx = spad * 2.5, srx = W - spad * 2.5;
        const sy1 = sry + spad + Math.round(slh * 0.72);
        const sy2 = sy1 + slh;
        cx.font = `600 ${sfs}px "JetBrains Mono",monospace`; cx.fillStyle = '#fff';
        cx.textAlign = 'left'; cx.fillText('VESTRA · TermoLab Track', slx, sy1);
        cx.textAlign = 'right'; cx.fillText(d, srx, sy1);
        cx.font = `${Math.round(sfs * 0.88)}px "JetBrains Mono",monospace`;
        cx.fillStyle = '#FFE9B8'; cx.textAlign = 'left';
        cx.fillText(`${session?.boxId || 'CX'} · ${stage || 'ETAPA'}`, slx, sy2);
        cx.fillStyle = '#fff'; cx.textAlign = 'right'; cx.fillText(t, srx, sy2);
        onShoot(cv.toDataURL('image/jpeg', 0.88));
      }} style={{ maxWidth: 260 }}>
        {Icon.camera(16, '#fff')} Simular foto (demo)
      </PrimaryBtn>
      <GhostBtn onClick={onClose} style={{ maxWidth: 260 }}>Voltar</GhostBtn>
    </div>
  );

  const [nowDate, nowTime] = now.split(' ');
  const hasExtra = !!(userName || tempValue);

  return (
    <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <video ref={videoRef} autoPlay playsInline muted
        onLoadedMetadata={() => setReady(true)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {flash && <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 20, opacity: 0.75, pointerEvents: 'none' }} />}

      {/* top bar */}
      <div style={{ position: 'relative', zIndex: 5, padding: `${TOP} 20px 0`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, border: 'none', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.close(18, '#fff')}
        </button>
        <div style={{ padding: '8px 14px', borderRadius: 99, background: 'rgba(0,0,0,0.5)', fontFamily: 'JetBrains Mono,monospace', color: '#fff', fontSize: 11, letterSpacing: 0.5 }}>
          {session.boxId} · {stage}
        </div>
        <div style={{ width: 38 }} />
      </div>

      {/* center hint */}
      <div style={{ position: 'relative', flex: 1, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!ready && (
          <div style={{ padding: '10px 18px', borderRadius: 12, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 13 }}>Iniciando câmera…</div>
        )}
        {ready && (
          <div style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 13, fontWeight: 500, textAlign: 'center', maxWidth: 260, lineHeight: 1.4 }}>
            {label} — enquadre antes de capturar
          </div>
        )}
      </div>

      {/* live stamp preview */}
      <div style={{ position: 'relative', zIndex: 5, margin: '0 16px', background: 'rgba(0,0,0,0.72)', color: '#FFE9B8', padding: '8px 12px', borderRadius: 10, fontFamily: 'JetBrains Mono,monospace', fontSize: 10.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 600 }}>VESTRA · TermoLab Track</div>
          <div style={{ color: '#fff' }}>{nowDate}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
          <div>{session.boxId} · {stage}</div>
          <div style={{ color: '#fff' }}>{nowTime}</div>
        </div>
        {hasExtra && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <div>{userName}</div>
            {tempValue ? <div style={{ color: '#fff' }}>{tempValue}°C</div> : null}
          </div>
        )}
      </div>

      {/* shutter */}
      <div style={{ position: 'relative', zIndex: 5, padding: `20px 20px ${BOT}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={shoot} disabled={!ready || shooting}
          style={{
            width: 80, height: 80, borderRadius: 99,
            border: `4px solid ${ready ? '#fff' : 'rgba(255,255,255,0.35)'}`,
            background: 'transparent', position: 'relative',
            transition: 'opacity 0.2s', opacity: ready ? 1 : 0.5,
          }}>
          <div style={{
            position: 'absolute', inset: 6, borderRadius: 99,
            background: shooting ? BRAND.danger : 'rgba(255,255,255,0.9)',
            transition: 'transform 80ms',
            transform: shooting ? 'scale(0.82)' : 'scale(1)',
          }} />
        </button>
      </div>
    </div>
  );
}
