/**
 * Design-Tokens der App.
 *
 * Palette: Petrol/Teal als Primärfarbe (passt zum App-Icon und zu TWINT), warmes Amber als Akzent
 * für Preise und Highlights, neutrale, leicht kühle Grautöne für Flächen und Text.
 */
export const colors = {
  primary: '#0F9B8E',
  primaryDark: '#0B7A70',
  primarySoft: '#DDF4F0',

  accent: '#E08A00',
  accentSoft: '#FFF1D6',

  twint: '#00B894',

  success: '#1F9D63',
  successSoft: '#E3F5EC',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#D93A3A',
  dangerSoft: '#FCE8E8',
  info: '#2563EB',
  infoSoft: '#E6EEFF',

  background: '#F3F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F9FA',
  border: '#E4E8EC',
  borderStrong: '#CBD3DA',

  textPrimary: '#141B22',
  textSecondary: '#5B6875',
  textMuted: '#8B98A5',
  textOnPrimary: '#FFFFFF',

  overlay: 'rgba(15, 23, 32, 0.55)',

  // Kompatibilitäts-Aliase (ältere Stellen im Code)
  textStrong: '#141B22',
  surfaceInfo: '#E6EEFF',
  surfaceDanger: '#FCE8E8',
  surfaceActive: '#DDF4F0',
  avatarBackground: '#DDF4F0',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Typografie-Scale: Größe + Zeilenhöhe, damit Texte nie ineinanderlaufen. */
export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '700' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  captionStrong: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

export const shadow = {
  card: {
    shadowColor: '#0F1720',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#0F1720',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  modal: {
    shadowColor: '#0F1720',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

/** Layout-Breakpoints (Fensterbreite in pt). */
export const breakpoints = {
  /** Großes Handy / kleines Tablet im Portrait */
  md: 600,
  /** Tablet Landscape, Split View */
  lg: 900,
} as const;

/** Maximale Inhaltsbreite auf Tablets, damit Karten nicht endlos breit werden. */
export const MAX_CONTENT_WIDTH = 1040;

/** Anzahl Spalten im Getränke-Grid je Fensterbreite. */
export function gridColumnsForWidth(width: number): number {
  if (width >= breakpoints.lg) return 4;
  if (width >= breakpoints.md) return 3;
  return 2;
}

/** Formatiert CHF-Beträge einheitlich (Schweizer Schreibweise mit Punkt). */
export function formatChf(amount: number): string {
  return `CHF ${amount.toFixed(2)}`;
}

/** Initialen für Avatare (max. 2 Zeichen). */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
