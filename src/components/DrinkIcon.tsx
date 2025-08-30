import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DrinkIconProps {
  iconKey: string;
  size?: number;
  color?: string;
}

const getIconName = (iconKey: string): string => {
  const iconMap: Record<string, string> = {
    beer: 'sports-bar',        // 🍺 Bierglas (passender)
    wine: 'wine-bar',          // 🍷 Weinglas (passender)
    soda: 'local-cafe',        // ☕ Limonade/Softdrink
    coffee: 'coffee',          // ☕ Kaffee
    water: 'opacity',          // 💧 Wasser
    juice: 'local-drink',      // 🥤 Saft
    cocktail: 'local-bar',     // 🍸 Cocktail
    shot: 'local-bar',         // 🥃 Shot
    default: 'local-drink',    // 🥤 Standard-Getränk
  };

  return iconMap[iconKey] || iconMap.default;
};

export const DrinkIcon: React.FC<DrinkIconProps> = ({ 
  iconKey, 
  size = 24, 
  color = '#007AFF' 
}) => {
  return (
    <View style={styles.container}>
      <MaterialIcons 
        name={getIconName(iconKey) as any} 
        size={size} 
        color={color} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
