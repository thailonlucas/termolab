import type { Step } from './types';

export const BRAND = {
  ink:    '#282828',
  ink2:   '#4A4A4A',
  ink3:   '#8A8A8A',
  ink4:   '#C9C6C0',
  bg:     '#F5F1EA',
  bg2:    '#FBF8F2',
  card:   '#FFFFFF',
  line:   'rgba(40,40,40,0.08)',
  cold:   'oklch(0.62 0.13 165)',
  warm:   'oklch(0.72 0.13 75)',
  danger: 'oklch(0.62 0.18 25)',
};

export const TOP = 'calc(env(safe-area-inset-top, 0px) + 16px)';
export const BOT = 'calc(env(safe-area-inset-bottom, 0px) + 16px)';

export const STEPS: Step[] = [
  { id: 'open',   title: 'Abrir a caixa',              sub: 'Quebre o lacre e abra a caixa térmica com cuidado.',              label: 'Caixa aberta',          needsTemp: false, stage: 'ABERTURA',            hue: 30  },
  { id: 'temp1',  title: 'Medir temperatura inicial',  sub: 'Posicione o termômetro no centro da carga, aguarde 10s.',         label: 'Termômetro · interno',  needsTemp: true,  stage: 'TEMP. INICIAL',       hue: 200 },
  { id: 'remove', title: 'Remover gelo antigo',         sub: 'Retire todo o gelo e separe para descarte/recongelamento.',       label: 'Gelo removido',         needsTemp: false, stage: 'REMOÇÃO DE GELO',     hue: 200 },
  { id: 'temp2',  title: 'Medir temperatura sem gelo', sub: 'Confirme a temperatura da carga sem refrigeração.',               label: 'Termômetro · sem gelo', needsTemp: true,  stage: 'TEMP. INTERMEDIÁRIA', hue: 25  },
  { id: 'place',  title: 'Posicionar novo gelo',        sub: 'Encaixe o novo gelo nas mesmas posições indicadas no mapa.',     label: 'Mapa de posições',      needsTemp: false, stage: 'NOVO GELO',           hue: 200 },
  { id: 'temp3',  title: 'Medir temperatura final',    sub: 'Confirme a temperatura após reposição do gelo.',                  label: 'Termômetro · final',    needsTemp: true,  stage: 'TEMP. FINAL',         hue: 165 },
  { id: 'seal',   title: 'Lacrar a caixa',             sub: 'Aplique o lacre numerado e fotografe o número visível.',          label: 'Lacre nº',              needsTemp: false, stage: 'LACRE',               hue: 50  },
  { id: 'sign',   title: 'Canhoto e assinatura',       sub: 'Confirme o manuseio e assine o canhoto digital.',                 label: 'CANHOTO',               needsTemp: false, stage: 'CANHOTO',             hue: 60, isSign: true },
];

export const QR_MOCK = {
  boxId:      'CX-8841',
  medication: 'Insulina Glargina 100UI/mL',
  lot:        'L-2026-M19',
  origem:     '100 - Rio Claro',
  destino:    '500 - Jacareí',
  remetente:  'IBEROQUIMICA FARMACEUTICA LTDA',
  chaveNF:    '35260511136050000117550010001946481865014112',
  docMinuta:  '2208275',
};

export const VESTRA_LOGO = 'https://vestralogistica.com.br/wp-content/webp-express/webp-images/uploads/2022/03/logo-vestra.png.webp';
