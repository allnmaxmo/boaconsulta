import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { GlassSurface } from '@/src/componentes/interface/GlassSurface';
import { movimento } from '@/src/constantes/movimento';
import { raios, sombraSuave } from '@/src/constantes/tema';

export function EstadoCarregamento() {
  return (
    <Animated.View
      entering={FadeIn.duration(movimento.duracoes.entradaRapida)}
      exiting={FadeOut.duration(movimento.duracoes.saida)}
      style={styles.lista}>
      {[0, 1, 2].map((item) => (
        <GlassSurface key={item} style={styles.cartao} contentStyle={styles.cartaoConteudo} intensity={84}>
          <View style={styles.linhaCurta} />
          <View style={styles.linhaLonga} />
          <View style={styles.linhaMedia} />
        </GlassSurface>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: 12,
  },
  cartao: {
    borderRadius: raios.xl,
    ...sombraSuave,
  },
  cartaoConteudo: {
    padding: 20,
    gap: 14,
  },
  linhaCurta: {
    width: 82,
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(148,163,184,0.22)',
  },
  linhaLonga: {
    width: '74%',
    height: 18,
    borderRadius: 8,
    backgroundColor: 'rgba(148,163,184,0.18)',
  },
  linhaMedia: {
    width: '48%',
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(148,163,184,0.16)',
  },
});
