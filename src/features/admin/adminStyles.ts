import { StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing } from '../../theme';

/** Gemeinsame Styles der Admin-Sektionen (Karten, Formulare, Buttons). */
export const adminStyles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  iconButton: {
    padding: spacing.sm,
  },
  addForm: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.textSecondary,
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.avatarBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardMetric: {
    alignItems: 'flex-end',
  },
  cardMetricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cardMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceDanger,
  },
  deleteButtonText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: spacing.xs,
  },
});
