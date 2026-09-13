import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';

type IconName = keyof typeof MaterialIcons.glyphMap;

type Props = {
  icon: IconName;
  title: string;
  message?: string;
  action?: React.ReactNode;
};

/** Leerer Zustand (keine Benutzer, keine Getränke, keine Einkäufe). */
export const EmptyState: React.FC<Props> = ({ icon, title, message, action }) => (
  <View style={styles.wrap}>
    <View style={styles.iconWrap}>
      <MaterialIcons name={icon} size={28} color={colors.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {action ? <View style={styles.action}>{action}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 320,
  },
  action: {
    marginTop: spacing.lg,
  },
});
