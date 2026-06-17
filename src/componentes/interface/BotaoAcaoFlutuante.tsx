import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { movimento } from '@/src/constantes/movimento';
import { cores, raios, sombraCartao } from '@/src/constantes/tema';

const PressableAnimado = Animated.createAnimatedComponent(Pressable);

type BotaoAcaoFlutuanteProps = {
  onPress: () => void;
  acessibilidade: string;
};

export function BotaoAcaoFlutuante({ onPress, acessibilidade }: BotaoAcaoFlutuanteProps) {
  const escala = useSharedValue(1);
  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(escala.value, {
          damping: movimento.molas.fabDamping,
          stiffness: movimento.molas.fabStiffness,
        }),
      },
    ],
  }));

  return (
    <PressableAnimado
      accessibilityLabel={acessibilidade}
      onPress={onPress}
      onPressIn={() => {
        escala.value = movimento.escala.fab;
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
    bottom: 108,
    width: 66,
    height: 66,
    borderRadius: raios.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.azulProfundo,
    borderWidth: 1,
    borderColor: cores.bordaClara,
    ...sombraCartao,
  },
});
