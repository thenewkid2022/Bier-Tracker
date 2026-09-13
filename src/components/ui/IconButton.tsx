import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius } from '../../theme';

type IconName = keyof typeof MaterialIcons.glyphMap;
type Tone = 'neutral' | 'primary' | 'danger';

type Props = {
  icon: IconName;
  onPress?: () => void;
  tone?: Tone;
  size?: number;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

const TONES: Record<Tone, { bg: string; fg: string; pressed: string }> = {
  neutral: { bg: colors.surfaceMuted, fg: colors.textSecondary, pressed: colors.border },
  primary: { bg: colors.primarySoft, fg: colors.primary, pressed: '#C7ECE6' },
  danger: { bg: colors.dangerSoft, fg: colors.danger, pressed: '#F8D5D5' },
};

/** Quadratischer Icon-Button mit 40pt Touch-Fläche. */
export const IconButton: React.FC<Props> = ({
  icon,
  onPress,
  tone = 'neutral',
  size = 20,
  disabled = false,
  accessibilityLabel,
  style,
}) => {
  const t = TONES[tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? t.pressed : t.bg, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <MaterialIcons name={icon} size={size} color={t.fg} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
