import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { cores, raios, sombraCartao } from '@/src/constantes/tema';

type GlassSurfaceProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
  variant?: 'default' | 'strong' | 'subtle';
}>;

function podeUsarGlassNativo() {
  try {
    return Platform.OS === 'ios' && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

export function GlassSurface({
  children,
  style,
  contentStyle,
  intensity = 84,
  variant = 'default',
}: GlassSurfaceProps) {
  const conteudo = (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={
          variant === 'strong'
            ? ['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.68)']
            : ['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.46)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </>
  );

  if (podeUsarGlassNativo()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme="light"
        tintColor="rgba(255,255,255,0.56)"
        style={[styles.surface, style]}>
        {conteudo}
      </GlassView>
    );
  }

  return (
    <BlurView
      blurReductionFactor={1}
      intensity={intensity}
      tint="extraLight"
      experimentalBlurMethod="dimezisBlurView"
      style={[styles.surface, style]}>
      {conteudo}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  surface: {
    overflow: 'hidden',
    borderRadius: raios.xl,
    borderWidth: 1,
    borderColor: cores.bordaClara,
    backgroundColor: cores.vidro,
    ...sombraCartao,
  },
  content: {
    flex: 1,
  },
});
