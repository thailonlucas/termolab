import React, { useState } from 'react';
import { BRAND, BOT, QR_MOCK } from '../../constants';
import { Icon } from '../icons';
import { Header, Field, PrimaryBtn } from '../shared';
import { Scanner } from './Scanner';

interface NewBoxData {
  boxId: string;
  medication: string;
  lot: string;
  origem: string;
  destino: string;
  remetente: string;
  chaveNF: string;
  docMinuta: string;
}

interface NewBoxProps {
  onBack: () => void;
  onStart: (data: NewBoxData) => void;
}

export function NewBox({ onBack, onStart }: NewBoxProps) {
  const [boxId,     setBoxId]     = useState('');
  const [med,       setMed]       = useState('');
  const [lot,       setLot]       = useState('');
  const [origem,    setOrigem]    = useState('');
  const [destino,   setDestino]   = useState('');
  const [remetente, setRemetente] = useState('');
  const [chaveNF,   setChaveNF]   = useState('');
  const [docMinuta, setDocMinuta] = useState('');
  const [mode,      setMode]      = useState<'manual' | 'scan'>('manual');

  const fillFromQR = (data: typeof QR_MOCK) => {
    setBoxId(data.boxId || '');
    setMed(data.medication || '');
    setLot(data.lot || '');
    setOrigem(data.origem || '');
    setDestino(data.destino || '');
    setRemetente(data.remetente || '');
    setChaveNF(data.chaveNF || '');
    setDocMinuta(data.docMinuta || '');
    setMode('manual');
  };

  const canContinue = !!(boxId && med && lot);

  if (mode === 'scan') {
    return <Scanner onClose={() => setMode('manual')} onResult={() => fillFromQR(QR_MOCK)} />;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: BRAND.bg, position: 'relative', overflow: 'hidden' }}>
      <Header onBack={onBack} title="Identificar caixa" />
      <div style={{ flex: 1, overflow: 'auto', padding: '6px 20px 0', paddingBottom: 100 }}>
        <p style={{ fontSize: 13, color: BRAND.ink3, margin: '0 0 16px' }}>
          Escaneie a etiqueta da caixa ou preencha os dados manualmente.
        </p>
        <button onClick={() => setMode('scan')} style={{
          width: '100%', padding: 18, background: BRAND.card, borderRadius: 18,
          border: `1.5px dashed ${BRAND.ink4}`,
          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.qr(22)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Escanear QR Code da caixa</div>
            <div style={{ fontSize: 11, color: BRAND.ink3, marginTop: 2 }}>Preenche dados automaticamente</div>
          </div>
          {Icon.chevron(14, BRAND.ink3)}
        </button>
        <div style={{ padding: '18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: BRAND.line }} />
          <span style={{ fontSize: 11, color: BRAND.ink3, letterSpacing: 1, textTransform: 'uppercase' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: BRAND.line }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Código da caixa"      value={boxId}     onChange={setBoxId} />
          <Field label="Medicamento"          value={med}       onChange={setMed} />
          <Field label="Lote"                 value={lot}       onChange={setLot} />
          <Field label="Origem"               value={origem}    onChange={setOrigem} />
          <Field label="Destino"              value={destino}   onChange={setDestino} />
          <Field label="Remetente"            value={remetente} onChange={setRemetente} />
          <Field label="Chave da Nota Fiscal" value={chaveNF}   onChange={setChaveNF} />
          <Field label="Doc / Minuta"         value={docMinuta} onChange={setDocMinuta} />
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5,
        padding: `14px 20px ${BOT}`,
        background: `linear-gradient(to top, ${BRAND.bg} 72%, transparent)`,
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <PrimaryBtn disabled={!canContinue}
            onClick={() => onStart({ boxId, medication: med, lot, origem, destino, remetente, chaveNF, docMinuta })}>
            Continuar {Icon.arrow(16, '#fff')}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
