import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme';

type Props = ViewProps & {
  /** Ohne Innenabstand, z. B. für Listen mit eigenen Zeilen-Paddings. */
  flush?: boolean;
  tone?: 'default' | 'muted' | 'primary' | 'accent';
  style?: StyleProp<ViewStyle>;
};

const TONE_BG = {
  default: colors.surface,
  muted: colors.surfaceMuted,
  primary: colors.primary,
  accent: colors.accentSoft,
} as const;

/** Weiße Karte mit weichem Schatten – Grundbaustein aller Screens. */
export const Card: React.FC<Props> = ({ flush = false, tone = 'default', style, children, ...rest }) => (
  <View {...rest} style={[styles.card, { backgroundColor: TONE_BG[tone] }, !flush && styles.padded, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    ...shadow.card,
  },
  padded: {
    padding: spacing.lg,
  },
});
