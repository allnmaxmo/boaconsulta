import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { cores, raios } from '@/src/constantes/tema';

export function EstadoCarregamento() {
  return (
    <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)} style={styles.lista}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.cartao}>
          <View style={styles.linhaCurta} />
          <View style={styles.linhaLonga} />
          <View style={styles.linhaMedia} />
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: 12,
  },
  cartao: {
    borderRadius: raios.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 18,
    gap: 12,
  },
  linhaCurta: {
    width: 82,
    height: 14,
    borderRadius: 8,
    backgroundColor: cores.cinzaSuave,
  },
  linhaLonga: {
    width: '74%',
    height: 18,
    borderRadius: 8,
    backgroundColor: cores.cinzaSuave,
  },
  linhaMedia: {
    width: '48%',
    height: 14,
    borderRadius: 8,
    backgroundColor: cores.cinzaSuave,
  },
});

