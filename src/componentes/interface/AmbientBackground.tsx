import { MeshGradientView } from 'expo-mesh-gradient';
import { StyleSheet, View } from 'react-native';
import { Canvas, Circle, Group, Blur } from '@shopify/react-native-skia';

import { cores } from '@/src/constantes/tema';
import { GradientHalo } from '@/src/componentes/interface/GradientHalo';

export function AmbientBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <MeshGradientView
        columns={3}
        rows={3}
        points={[
          [0, 0],
          [0.5, 0.04],
          [1, 0],
          [0.05, 0.5],
          [0.5, 0.48],
          [0.95, 0.5],
          [0, 1],
          [0.48, 0.96],
          [1, 1],
        ]}
        colors={[
          '#FFFFFF',
          '#F2F7FF',
          '#F7F1FF',
          '#F4FBFF',
          '#FFFFFF',
          '#FFF7ED',
          '#F8FAFC',
          '#F5F3FF',
          '#FFFFFF',
        ]}
        style={StyleSheet.absoluteFill}
      />
      <Canvas style={StyleSheet.absoluteFill}>
        <Group opacity={0.42}>
          <Blur blur={42} />
          <Circle cx={60} cy={110} r={90} color="rgba(59,130,246,0.20)" />
          <Circle cx={320} cy={210} r={112} color="rgba(139,92,246,0.16)" />
          <Circle cx={220} cy={620} r={130} color="rgba(6,182,212,0.12)" />
        </Group>
      </Canvas>
      <GradientHalo tom="azul" style={styles.haloAzul} />
      <GradientHalo tom="lilas" style={styles.haloLilas} />
      <GradientHalo tom="rosa" style={styles.haloRosa} />
      <View style={styles.filtroClaro} />
    </View>
  );
}

const styles = StyleSheet.create({
  haloAzul: {
    width: 260,
    height: 260,
    top: -88,
    right: -100,
  },
  haloLilas: {
    width: 220,
    height: 220,
    top: 190,
    left: -112,
  },
  haloRosa: {
    width: 260,
    height: 260,
    bottom: 112,
    right: -150,
  },
  filtroClaro: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: cores.fundo,
    opacity: 0.18,
  },
});

