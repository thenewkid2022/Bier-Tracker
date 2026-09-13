import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';

type IconName = keyof typeof MaterialIcons.glyphMap;

type Props = {
  label: string;
  value: string;
  icon?: IconName;
  tone?: 'default' | 'primary' | 'accent' | 'danger' | 'success';
  style?: StyleProp<ViewStyle>;
};

const TONES = {
  default: { fg: colors.textPrimary, iconBg: colors.surfaceMuted, icon: colors.textSecondary },
  primary: { fg: colors.primary, iconBg: colors.primarySoft, icon: colors.primary },
  accent: { fg: colors.accent, iconBg: colors.accentSoft, icon: colors.accent },
  danger: { fg: colors.danger, iconBg: colors.dangerSoft, icon: colors.danger },
  success: { fg: colors.success, iconBg: colors.successSoft, icon: colors.success },
} as const;

/**
 * Kennzahl-Kachel. Label steht über dem Wert und darf zweizeilig umbrechen –
 * so kollidieren lange Bezeichnungen wie „Getränke diesen Monat" nicht.
 */
export const StatTile: React.FC<Props> = ({ label, value, icon, tone = 'default', style }) => {
  const t = TONES[tone];
  return (
    <View style={[styles.tile, style]}>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: t.iconBg }]}>
          <MaterialIcons name={icon} size={18} color={t.icon} />
        </View>
      )}
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[styles.value, { color: t.fg }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.title,
  },
});
