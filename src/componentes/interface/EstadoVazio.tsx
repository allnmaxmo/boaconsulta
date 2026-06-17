import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { GlassSurface } from '@/src/componentes/interface/GlassSurface';
import { movimento } from '@/src/constantes/movimento';
import { cores, raios, sombraCartao } from '@/src/constantes/tema';

type EstadoVazioProps = {
  titulo: string;
  descricao: string;
  icone?: keyof typeof MaterialIcons.glyphMap;
};

export function EstadoVazio({ titulo, descricao, icone = 'event-available' }: EstadoVazioProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(movimento.duracoes.entradaCalma)
        .springify()
        .damping(movimento.molas.entradaDamping)
        .stiffness(movimento.molas.entradaStiffness)}>
      <GlassSurface style={styles.container} contentStyle={styles.conteudo} intensity={84} variant="strong">
        <Svg width={150} height={72} viewBox="0 0 150 72" style={styles.ornamento}>
          <Circle cx="38" cy="36" r="28" stroke="rgba(139,92,246,0.24)" strokeWidth="1.5" fill="none" />
          <Circle cx="84" cy="32" r="22" stroke="rgba(59,130,246,0.22)" strokeWidth="1.5" fill="none" />
          <Circle cx="112" cy="42" r="17" stroke="rgba(6,182,212,0.18)" strokeWidth="1.5" fill="none" />
        </Svg>
        <View style={styles.icone}>
          <MaterialIcons name={icone} size={28} color={cores.azulProfundo} />
        </View>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descricao}>{descricao}</Text>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 210,
    borderRadius: raios.xl,
    ...sombraCartao,
  },
  conteudo: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 12,
  },
  ornamento: {
    position: 'absolute',
    top: 14,
    opacity: 0.9,
  },
  icone: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.cianoSuave,
    borderWidth: 1,
    borderColor: cores.bordaClara,
  },
  titulo: {
    color: cores.texto,
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  descricao: {
    color: cores.textoSuave,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
