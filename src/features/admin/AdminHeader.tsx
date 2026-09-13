import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, SectionHeader } from '../../components/ui';
import { spacing } from '../../theme';

type Props = {
  isRefreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
};

export const AdminHeader: React.FC<Props> = ({ isRefreshing, onRefresh, onLogout }) => (
  <SectionHeader
    title="Verwaltung"
    subtitle="Benutzer, Getränke und TWINT"
    action={
      <View style={styles.actions}>
        <IconButton
          icon="refresh"
          tone="primary"
          onPress={onRefresh}
          disabled={isRefreshing}
          accessibilityLabel="Daten aktualisieren"
        />
        <IconButton icon="logout" tone="danger" onPress={onLogout} accessibilityLabel="Abmelden" />
      </View>
    }
  />
);

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
