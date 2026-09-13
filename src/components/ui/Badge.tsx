import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary' | 'accent';

type Props = {
  label: string;
  tone?: Tone;
};

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceMuted, fg: colors.textSecondary },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  primary: { bg: colors.primarySoft, fg: colors.primaryDark },
  accent: { bg: colors.accentSoft, fg: colors.accent },
};

/** Kleine Status-Pille (z. B. Bestand, Schulden, DB-Status). */
export const Badge: React.FC<Props> = ({ label, tone = 'neutral' }) => {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    // In Spalten-Layouts den Badge in eine Row packen, damit er nicht auf volle Breite gestreckt wird.
    flexShrink: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  text: {
    ...typography.small,
  },
});
