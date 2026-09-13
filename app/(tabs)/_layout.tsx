import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

const ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  index: 'sports-bar',
  profile: 'person',
  admin: 'admin-panel-settings',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', fontSize: 20, color: colors.textPrimary },
        headerTitleAlign: 'left',
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          ...(Platform.OS === 'android' ? { height: 64, paddingBottom: 8, paddingTop: 6 } : null),
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => <MaterialIcons name={ICONS[route.name] ?? 'help'} size={size} color={color} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Getränke', headerTitle: 'Getränke Tracker' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin' }} />
    </Tabs>
  );
}
