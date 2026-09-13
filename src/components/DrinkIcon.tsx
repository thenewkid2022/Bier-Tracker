import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';

interface DrinkIconProps {
  iconKey: string;
  size?: number;
  color?: string;
  /** Icon in einem farbigen, abgerundeten Quadrat darstellen. */
  boxed?: boolean;
}

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

type IconSpec = { name: MaterialIconName; tint: string; bg: string };

/** Icon + Farbe je Getränkeart; Farben harmonieren mit der App-Palette. */
const ICON_SPECS: Record<string, IconSpec> = {
  beer: { name: 'sports-bar', tint: '#C77700', bg: '#FFF1D6' },
  wine: { name: 'wine-bar', tint: '#A3324A', bg: '#FBE4EA' },
  soda: { name: 'local-drink', tint: '#2563EB', bg: '#E6EEFF' },
  coffee: { name: 'coffee', tint: '#6B4423', bg: '#F3EAE3' },
  water: { name: 'water-drop', tint: '#0284C7', bg: '#E0F2FE' },
  juice: { name: 'local-drink', tint: '#D97706', bg: '#FEF3C7' },
  cocktail: { name: 'local-bar', tint: '#7C3AED', bg: '#EFE7FE' },
  shot: { name: 'local-bar', tint: '#B45309', bg: '#FEF3C7' },
  default: { name: 'local-drink', tint: colors.primary, bg: colors.primarySoft },
};

export function getDrinkIconSpec(iconKey: string): IconSpec {
  return ICON_SPECS[iconKey] ?? ICON_SPECS.default;
}

export const DrinkIcon: React.FC<DrinkIconProps> = ({ iconKey, size = 24, color, boxed = false }) => {
  const spec = getDrinkIconSpec(iconKey);
  const tint = color ?? spec.tint;

  if (!boxed) {
    return (
      <View style={styles.container}>
        <MaterialIcons name={spec.name} size={size} color={tint} />
      </View>
    );
  }

  const box = Math.round(size * 1.9);
  return (
    <View
      style={[styles.box, { width: box, height: box, borderRadius: Math.round(box * 0.3), backgroundColor: spec.bg }]}
    >
      <MaterialIcons name={spec.name} size={size} color={tint} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
