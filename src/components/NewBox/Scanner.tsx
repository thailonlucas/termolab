import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { BRAND, TOP, BOT } from '../../constants';
import { Icon } from '../icons';
import { PrimaryBtn, GhostBtn } from '../shared';

interface ScannerProps {
  onClose: () => void;
  onResult: (value: string) => void;
}

export function Scanner({ onClose, onResult }: ScannerProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number>(0);
  const [detected, setDetected] = useState(false);
  const [err, setErr]           = useState<string | null>(null);
  const [ready, setReady]       = useState(false);

  const stopAll = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const handleDetected = (value: string) => {
    stopAll();
    setDetected(true);
    setTimeout(() => onResult(value || 'CX-8841'), 600);
  };

  const scanLoop = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(video, 0, 0);
    const img  = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
    if (code?.data) { handleDetected(code.data); return; }
    rafRef.current = requestAnimationFrame(scanLoop);
  };

  useEffect(() => {
    let active = true;
    if (!navigator.mediaDevices?.getUserMedia) { setErr('unavailable'); return; }
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    }).then(stream => {
      if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      videoRef.current!.srcObject = stream;
      videoRef.current!.onloadedmetadata = () => { setReady(true); scanLoop(); };
    }).catch(e => {
      if (!active) return;
      setErr((e as Error).name === 'NotAllowedError' ? 'permission' : 'unavailable');
    });
    return () => { active = false; stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (err) return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg,
      padding: `${TOP} 24px ${BOT}`, alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', gap: 16,
    }}>
      <div style={{ fontWeight: 600, fontSize: 18 }}>
        {err === 'permission' ? 'Câmera bloqueada' : 'Câmera indisponível'}
      </div>
      <div style={{ fontSize: 13, color: BRAND.ink3, lineHeight: 1.5, maxWidth: 280 }}>
        {err === 'permission'
          ? 'Permita o acesso à câmera nas configurações do navegador.'
          : 'Não foi possível acessar a câmera neste dispositivo.'}
      </div>
      <PrimaryBtn onClick={() => handleDetected('DEMO')} style={{ maxWidth: 260 }}>
        {Icon.qr(16, '#fff')} Simular leitura (demo)
      </PrimaryBtn>
      <GhostBtn onClick={onClose} style={{ maxWidth: 260 }}>Voltar</GhostBtn>
    </div>
  );

  const color = detected ? BRAND.cold : '#fff';

  return (
    <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <video ref={videoRef} autoPlay playsInline muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* top */}
      <div style={{ position: 'relative', zIndex: 5, padding: `${TOP} 20px 0`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => { stopAll(); onClose(); }}
          style={{ width: 38, height: 38, borderRadius: 12, border: 'none', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.close(18, '#fff')}
        </button>
        <div style={{ fontWeight: 500, color: '#fff', fontSize: 14 }}>
          {detected ? '✓ QR detectado!' : ready ? 'Escaneando…' : 'Iniciando câmera…'}
        </div>
        <div style={{ width: 38 }} />
      </div>

      {/* aim frame */}
      <div style={{ position: 'relative', flex: 1, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 240, height: 240, position: 'relative', transition: 'all 0.2s' }}>
          {(['TL','TR','BL','BR'] as const).map(c => (
            <div key={c} style={{
              position: 'absolute', width: 44, height: 44, borderRadius: 4,
              borderTop:    c[0] === 'T' ? `3px solid ${color}` : 'none',
              borderBottom: c[0] === 'B' ? `3px solid ${color}` : 'none',
              borderLeft:   c[1] === 'L' ? `3px solid ${color}` : 'none',
              borderRight:  c[1] === 'R' ? `3px solid ${color}` : 'none',
              top:    c[0] === 'T' ? 0 : 'auto', bottom: c[0] === 'B' ? 0 : 'auto',
              left:   c[1] === 'L' ? 0 : 'auto', right:  c[1] === 'R' ? 0 : 'auto',
              transition: 'border-color 0.25s',
            }} />
          ))}
          {!detected && (
            <div style={{
              position: 'absolute', left: 0, right: 0, top: '50%', height: 2,
              background: BRAND.cold, boxShadow: `0 0 12px ${BRAND.cold}`,
              animation: 'scanline 1.8s ease-in-out infinite',
            }} />
          )}
          {detected && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icon.check(52, BRAND.cold)}
            </div>
          )}
        </div>
      </div>

      {/* bottom */}
      <div style={{ position: 'relative', zIndex: 5, padding: `0 20px ${BOT}` }}>
        <p style={{ color: '#fff', textAlign: 'center', fontSize: 13, opacity: 0.75, margin: '0 0 16px', lineHeight: 1.4 }}>
          {detected ? 'Preenchendo dados automaticamente…' : 'Posicione o QR Code da caixa dentro da moldura'}
        </p>
        {!detected && (
          <PrimaryBtn onClick={() => handleDetected('CX-8841')}
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}>
            Simular leitura (demo)
          </PrimaryBtn>
        )}
      </div>
    </div>
  );
}
