import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  /** Rechts unter dem Feld, z. B. Zeichenzähler. */
  trailingHint?: string;
};

/** Eingabefeld mit Label, Hinweis und einheitlicher Optik (46pt hoch, klare Kontur). */
export const TextField: React.FC<Props> = ({ label, hint, trailingHint, style, multiline, ...rest }) => (
  <View style={styles.wrap}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      placeholderTextColor={colors.textMuted}
      multiline={multiline}
      style={[styles.input, multiline && styles.inputMultiline, style]}
      {...rest}
    />
    {hint || trailingHint ? (
      <View style={styles.hintRow}>
        <Text style={[styles.hint, styles.hintGrow]}>{hint ?? ''}</Text>
        {trailingHint ? <Text style={styles.hint}>{trailingHint}</Text> : null}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.captionStrong,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  inputMultiline: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xs + 2,
  },
  hint: {
    ...typography.small,
    fontWeight: '400',
    color: colors.textMuted,
  },
  hintGrow: {
    flex: 1,
  },
});
