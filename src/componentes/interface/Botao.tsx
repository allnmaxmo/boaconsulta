import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { movimento } from '@/src/constantes/movimento';
import { cores, raios, sombraSuave } from '@/src/constantes/tema';

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
    transform: [
      {
        scale: withSpring(escala.value, {
          damping: movimento.molas.toqueDamping,
          stiffness: movimento.molas.toqueStiffness,
        }),
      },
    ],
    opacity: withTiming(inativo ? 0.58 : 1, { duration: movimento.duracoes.entradaRapida }),
  }));

  return (
    <PressableAnimado
      disabled={inativo}
      onPress={onPress}
      onPressIn={() => {
        escala.value = movimento.escala.botao;
      }}
      onPressOut={() => {
        escala.value = 1;
      }}
      style={[styles.base, styles[variante], estiloAnimado, style]}>
      {variante === 'primario' ? (
        <LinearGradient
          pointerEvents="none"
          colors={[cores.azulProfundo, cores.lilas]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {variante === 'perigo' ? (
        <LinearGradient
          pointerEvents="none"
          colors={[cores.vermelho, '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {carregando ? (
        <ActivityIndicator color={variante === 'primario' || variante === 'perigo' ? '#fff' : cores.azulProfundo} />
      ) : (
        <>
          {icone ? (
            <MaterialIcons
              name={icone}
              size={18}
              color={variante === 'primario' || variante === 'perigo' ? '#fff' : cores.azulProfundo}
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
    minHeight: 52,
    borderRadius: raios.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: cores.bordaClara,
    overflow: 'hidden',
  },
  primario: {
    backgroundColor: cores.azulProfundo,
    ...sombraSuave,
  },
  secundario: {
    backgroundColor: cores.vidroForte,
    borderColor: cores.borda,
  },
  perigo: {
    backgroundColor: cores.vermelho,
    ...sombraSuave,
  },
  fantasma: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderColor: 'transparent',
  },
  texto: {
    fontSize: 16,
    fontWeight: '800',
  },
  textoClaro: {
    color: '#fff',
  },
  textoAzul: {
    color: cores.azulProfundo,
  },
  textoFantasma: {
    color: cores.textoSuave,
  },
});
