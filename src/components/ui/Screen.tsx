import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAX_CONTENT_WIDTH, colors, spacing } from '../../theme';

type Props = ScrollViewProps & {
  children: React.ReactNode;
};

/**
 * Scrollbarer Screen-Container mit einheitlichem Seitenabstand, Safe-Area unten
 * und zentrierter Maximalbreite auf Tablets.
 */
export const Screen: React.FC<Props> = ({ children, contentContainerStyle, ...rest }) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const horizontal = width >= 600 ? spacing.xxl : spacing.lg;

  return (
    <ScrollView
      style={styles.scroll}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: horizontal, paddingBottom: insets.bottom + spacing.xxl },
        contentContainerStyle,
      ]}
      {...rest}
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
  },
});
