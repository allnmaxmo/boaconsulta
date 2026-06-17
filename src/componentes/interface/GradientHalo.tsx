import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

import { halos } from '@/src/constantes/tema';

type TomHalo = keyof typeof halos;

type GradientHaloProps = {
  tom?: TomHalo;
  style?: ViewStyle | ViewStyle[];
};

export function GradientHalo({ tom = 'azul', style }: GradientHaloProps) {
  return (
    <LinearGradient
      colors={[halos[tom], 'rgba(255,255,255,0)']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.halo, style]}
    />
  );
}

const styles = StyleSheet.create({
  halo: {
    position: 'absolute',
    borderRadius: 999,
  },
});

