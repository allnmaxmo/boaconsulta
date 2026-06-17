import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cores, raios } from '@/src/constantes/tema';

const PressableAnimado = Animated.createAnimatedComponent(Pressable);

type VarianteBotao = 'primario' | 'secundario' | 'perigo' | 'fantasma';

type BotaoProps = {
  titulo: string;
  onPress?: () => void;
  variante?: VarianteBotao;
  icone?: keyof typeof MaterialIcons.glyphMap;
  carregando?: boolean;
  desabilitado?: boolean;
  style?: ViewStyle;
};

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando = false,
  desabilitado = false,
  style,
}: BotaoProps) {
  const escala = useSharedValue(1);
  const inativo = desabilitado || carregando;

  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(escala.value, { damping: 16, stiffness: 220 }) }],
    opacity: withTiming(inativo ? 0.58 : 1),
  }));

  return (
    <PressableAnimado
      disabled={inativo}
      onPress={onPress}
      onPressIn={() => {
        escala.value = 0.97;
      }}
      onPressOut={() => {
        escala.value = 1;
      }}
      style={[styles.base, styles[variante], estiloAnimado, style]}>
      {carregando ? (
        <ActivityIndicator color={variante === 'primario' || variante === 'perigo' ? '#fff' : cores.azul} />
      ) : (
        <>
          {icone ? (
            <MaterialIcons
              name={icone}
              size={18}
              color={variante === 'primario' || variante === 'perigo' ? '#fff' : cores.azul}
            />
          ) : null}
          <Text
            style={[
              styles.texto,
              variante === 'primario' || variante === 'perigo' ? styles.textoClaro : styles.textoAzul,
              variante === 'fantasma' ? styles.textoFantasma : null,
            ]}>
            {titulo}
          </Text>
        </>
      )}
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  primario: {
    backgroundColor: cores.azul,
  },
  secundario: {
    backgroundColor: cores.azulSuave,
  },
  perigo: {
    backgroundColor: cores.vermelho,
  },
  fantasma: {
    backgroundColor: 'transparent',
  },
  texto: {
    fontSize: 16,
    fontWeight: '700',
  },
  textoClaro: {
    color: '#fff',
  },
  textoAzul: {
    color: cores.azul,
  },
  textoFantasma: {
    color: cores.textoSuave,
  },
});

