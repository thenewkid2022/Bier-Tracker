/**
 * Design-Tokens der App. Die Werte entsprechen den bisher hart kodierten
 * Farben/Abständen, damit das Refactoring optisch neutral bleibt.
 */
export const colors = {
  primary: '#007AFF',
  twint: '#00D4AA',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',

  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F8F9FA',
  surfaceInfo: '#F0F8FF',
  surfaceDanger: '#FFE5E5',
  surfaceActive: '#E5F3FF',

  border: '#E5E5EA',
  avatarBackground: '#E0E0E0',

  textPrimary: '#000000',
  textStrong: '#1C1C1E',
  textSecondary: '#8E8E93',
  textOnPrimary: '#FFFFFF',

  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 20,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;
