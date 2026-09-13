import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { colors, formatChf, radius, spacing, typography } from '../../theme';

type Props = {
  name: string;
  balance?: number;
  selected: boolean;
  onPress: () => void;
};

/**
 * Auswahl-Chip für Benutzer (horizontale Liste). Feste Maximalbreite + `numberOfLines`,
 * damit lange Namen abgeschnitten statt umgebrochen werden.
 */
export const UserChip: React.FC<Props> = ({ name, balance, selected, onPress }) => {
  const hasDebt = (balance ?? 0) < 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && !selected && styles.chipPressed,
      ]}
    >
      <Avatar name={name} size={32} inverted={selected} />
      <View style={styles.texts}>
        <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
          {name}
        </Text>
        {balance !== undefined && (
          <Text
            style={[styles.balance, selected ? styles.balanceSelected : hasDebt && styles.balanceDebt]}
            numberOfLines={1}
          >
            {hasDebt ? `−${formatChf(Math.abs(balance))}` : formatChf(balance)}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingLeft: spacing.sm + 2,
    paddingRight: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 220,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  texts: {
    flexShrink: 1,
    minWidth: 0,
  },
  name: {
    ...typography.captionStrong,
    color: colors.textPrimary,
  },
  nameSelected: {
    color: colors.textOnPrimary,
  },
  balance: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 1,
  },
  balanceSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  balanceDebt: {
    color: colors.danger,
  },
});
