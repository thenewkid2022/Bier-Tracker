import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, initialsOf } from '../../theme';

type Props = {
  name: string;
  size?: number;
  /** Invertierte Darstellung auf farbigem Hintergrund. */
  inverted?: boolean;
};

/** Kreis mit Initialen – ersetzt das generische Personen-Icon. */
export const Avatar: React.FC<Props> = ({ name, size = 40, inverted = false }) => (
  <View
    style={[
      styles.circle,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: inverted ? 'rgba(255,255,255,0.22)' : colors.primarySoft,
      },
    ]}
  >
    <Text
      style={[
        styles.text,
        { fontSize: Math.round(size * 0.4), color: inverted ? colors.textOnPrimary : colors.primaryDark },
      ]}
    >
      {initialsOf(name)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
