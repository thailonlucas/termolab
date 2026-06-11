import React from 'react';
import { BRAND } from '../../constants';
import { formatTs } from '../../utils';
import type { Session } from '../../types';

interface ReceiptProps {
  session: Session;
}

export function Receipt({ session }: ReceiptProps) {
  const tempMovs = session.movements.filter(m => m.requiresTemperature && m.temperature);
  const t1 = tempMovs[0]?.temperature || '—';
  const t2 = tempMovs[1]?.temperature || '—';
  const t3 = tempMovs[2]?.temperature || '—';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px dashed ${BRAND.line}`, paddingBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: BRAND.ink3, fontWeight: 500 }}>Canhoto de manuseio</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginTop: 2, letterSpacing: -0.3 }}>{session.boxId}</div>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: BRAND.ink3 }}>{formatTs(new Date())}</div>
      </div>
      <RRow label="Medicamento" value={session.medication} />
      <RRow label="Lote"        value={session.lot} />
      <RRow label="Origem"      value={session.origem} />
      <RRow label="Destino"     value={session.destino} />
      <RRow label="Remetente"   value={session.remetente} />
      <RRow label="Chave NF"    value={session.chaveNF} mono />
      <RRow label="Doc / Minuta" value={session.docMinuta} />
      {tempMovs.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <TempCell label="Inicial"  value={t1} />
          {tempMovs.length > 1 && <TempCell label="Interm."  value={t2} />}
          {tempMovs.length > 2 && <TempCell label="Final"    value={t3} ok />}
        </div>
      )}
    </div>
  );
}

interface RRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

export function RRow({ label, value, mono }: RRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: `1px dashed ${BRAND.line}` }}>
      <span style={{ fontSize: 11, color: BRAND.ink3, fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: mono ? 9.5 : 12, color: BRAND.ink, fontWeight: 500,
        textAlign: 'right', maxWidth: '65%',
        wordBreak: mono ? 'break-all' : 'normal',
        fontFamily: mono ? 'JetBrains Mono,ui-monospace,monospace' : 'inherit',
        lineHeight: mono ? 1.4 : 'inherit',
      }}>{value}</span>
    </div>
  );
}

interface TempCellProps {
  label: string;
  value: string;
  ok?: boolean;
}

export function TempCell({ label, value, ok }: TempCellProps) {
  return (
    <div style={{
      flex: 1, background: BRAND.bg2, borderRadius: 10, padding: '10px 8px', textAlign: 'center',
      border: ok ? '1px solid oklch(0.75 0.10 165)' : `1px solid ${BRAND.line}`,
    }}>
      <div style={{ fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', color: BRAND.ink3, fontWeight: 500 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 16, color: ok ? BRAND.cold : BRAND.ink, marginTop: 2 }}>{value}°C</div>
    </div>
  );
}
