import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

/** Gemeinsame Styles der Admin-Sektionen (Listen-Karten, Formulare). */
export const adminStyles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  addForm: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addFormTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  formButton: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardMetric: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  cardMetricLabel: {
    ...typography.small,
    fontWeight: '400',
    color: colors.textMuted,
    marginBottom: 2,
  },
  cardMetricValue: {
    ...typography.heading,
    fontSize: 18,
    lineHeight: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flexShrink: 1,
    minWidth: 0,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 1,
  },
});
