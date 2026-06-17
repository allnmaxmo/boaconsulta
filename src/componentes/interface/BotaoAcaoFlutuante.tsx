import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { cores, raios, sombraCartao } from '@/src/constantes/tema';

const PressableAnimado = Animated.createAnimatedComponent(Pressable);

type BotaoAcaoFlutuanteProps = {
  onPress: () => void;
  acessibilidade: string;
};

export function BotaoAcaoFlutuante({ onPress, acessibilidade }: BotaoAcaoFlutuanteProps) {
  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(escala.value, { damping: 14, stiffness: 220 }) }],
  }));

  return (
    <PressableAnimado
      accessibilityLabel={acessibilidade}
      onPress={onPress}
      onPressIn={() => {
        escala.value = 0.94;
      }}
      onPressOut={() => {
        escala.value = 1;
      }}
      style={[styles.botao, estiloAnimado]}>
      <MaterialIcons name="add" size={30} color="#fff" />
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  botao: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    width: 62,
    height: 62,
    borderRadius: raios.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.azul,
    ...sombraCartao,
  },
});

