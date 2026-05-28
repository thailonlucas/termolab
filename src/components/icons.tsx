import { BRAND } from '../constants';

type Dir = 'left' | 'right' | 'down';

export const Icon = {
  thermo: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4a2 2 0 1 0-4 0v10.5a4 4 0 1 0 4 0V4Z"/>
      <line x1="12" y1="9" x2="12" y2="15"/>
    </svg>
  ),
  box: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7Z"/>
      <path d="M3 7l9 4 9-4M12 11v10"/>
    </svg>
  ),
  camera: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h3l2-3h8l2 3h3v11H3V8Z"/>
      <circle cx="12" cy="13" r="3.5"/>
    </svg>
  ),
  check: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12 10 18 20 6"/>
    </svg>
  ),
  arrow: (s = 18, c = BRAND.ink, dir: 'left' | 'right' = 'right'): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none' }}>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <polyline points="14 6 20 12 14 18"/>
    </svg>
  ),
  chevron: (s = 14, c = BRAND.ink3, dir: Dir = 'right'): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : dir === 'down' ? 'rotate(90deg)' : 'none' }}>
      <polyline points="9 6 15 12 9 18"/>
    </svg>
  ),
  close: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="6" x2="18" y2="18"/>
      <line x1="18" y1="6" x2="6" y2="18"/>
    </svg>
  ),
  qr: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <path d="M14 14h3v3M14 20h3M20 14v3M20 20v.01" strokeLinecap="round"/>
    </svg>
  ),
  bell: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/>
      <path d="M10 19a2 2 0 0 0 4 0"/>
    </svg>
  ),
  user: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>
    </svg>
  ),
  search: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <line x1="16.5" y1="16.5" x2="21" y2="21"/>
    </svg>
  ),
  flash: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>
    </svg>
  ),
  flip: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15-6.7l3-2v6h-6"/>
      <path d="M21 12a9 9 0 0 1-15 6.7l-3 2v-6h6"/>
    </svg>
  ),
  signature: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18c3-1 6-10 9-10s3 8 6 8c1.5 0 2.5-1 3-2"/>
      <path d="M3 21h18"/>
    </svg>
  ),
  share: (s = 18, c = BRAND.ink): JSX.Element => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  ),
};
