import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerSoft' | 'twint' | 'accent';
type Size = 'sm' | 'md' | 'lg';
type IconName = keyof typeof MaterialIcons.glyphMap;

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  /** Nimmt die volle verfügbare Breite ein. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const PALETTE: Record<Variant, { bg: string; fg: string; border?: string; pressedBg: string }> = {
  primary: { bg: colors.primary, fg: colors.textOnPrimary, pressedBg: colors.primaryDark },
  accent: { bg: colors.accent, fg: colors.textOnPrimary, pressedBg: '#B86F00' },
  twint: { bg: colors.twint, fg: colors.textOnPrimary, pressedBg: '#009C7D' },
  danger: { bg: colors.danger, fg: colors.textOnPrimary, pressedBg: '#B52F2F' },
  dangerSoft: { bg: colors.dangerSoft, fg: colors.danger, pressedBg: '#F8D5D5' },
  secondary: {
    bg: colors.surface,
    fg: colors.textPrimary,
    border: colors.borderStrong,
    pressedBg: colors.surfaceMuted,
  },
  ghost: { bg: 'transparent', fg: colors.primary, pressedBg: colors.primarySoft },
};

const SIZES: Record<Size, { height: number; paddingH: number; font: number; icon: number }> = {
  sm: { height: 36, paddingH: spacing.md, font: 13, icon: 16 },
  md: { height: 46, paddingH: spacing.lg, font: 15, icon: 18 },
  lg: { height: 52, paddingH: spacing.xl, font: 16, icon: 20 },
};

/**
 * Einheitlicher Button mit Varianten, Icon, Ladezustand und Pressed-Feedback.
 * Mindesthöhe 44pt (iOS HIG) ab Größe `md`.
 */
export const Button: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  accessibilityLabel,
}) => {
  const palette = PALETTE[variant];
  const dims = SIZES[size];
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed && !isInactive ? palette.pressedBg : palette.bg,
          minHeight: dims.height,
          paddingHorizontal: dims.paddingH,
          borderWidth: palette.border ? 1 : 0,
          borderColor: palette.border,
          opacity: isInactive ? 0.55 : 1,
          alignSelf: fullWidth ? 'stretch' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.content}>
          {icon && <MaterialIcons name={icon} size={dims.icon} color={palette.fg} />}
          <Text
            numberOfLines={1}
            style={[styles.label, { color: palette.fg, fontSize: dims.font, lineHeight: dims.font + 6 }]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.bodyStrong,
    textAlign: 'center',
  },
});
