import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type Props = {
  title: string;
  subtitle?: string;
  /** Rechts ausgerichtete Aktion (z. B. IconButton). */
  action?: React.ReactNode;
};

/** Abschnittsüberschrift mit optionalem Untertitel und Aktion; Text umbricht sauber neben der Aktion. */
export const SectionHeader: React.FC<Props> = ({ title, subtitle, action }) => (
  <View style={styles.row}>
    <View style={styles.texts}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {action ? <View style={styles.action}>{action}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  action: {
    flexShrink: 0,
  },
});
