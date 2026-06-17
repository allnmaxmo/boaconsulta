import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { cores, raios } from '@/src/constantes/tema';

type EstadoVazioProps = {
  titulo: string;
  descricao: string;
  icone?: keyof typeof MaterialIcons.glyphMap;
};

export function EstadoVazio({ titulo, descricao, icone = 'event-available' }: EstadoVazioProps) {
  return (
    <Animated.View entering={FadeInUp.duration(360).springify()} style={styles.container}>
      <View style={styles.icone}>
        <MaterialIcons name={icone} size={28} color={cores.azul} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descricao}>{descricao}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 210,
    borderRadius: raios.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 24,
    gap: 10,
  },
  icone: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.azulSuave,
  },
  titulo: {
    color: cores.texto,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  descricao: {
    color: cores.textoSuave,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

