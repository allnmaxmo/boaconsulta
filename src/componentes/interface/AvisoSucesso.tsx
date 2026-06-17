import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { GlassSurface } from '@/src/componentes/interface/GlassSurface';
import { movimento } from '@/src/constantes/movimento';
import { cores, raios, sombraSuave } from '@/src/constantes/tema';

type AvisoSucessoProps = {
  mensagem?: string;
};

export function AvisoSucesso({ mensagem = 'Alterações salvas com sucesso.' }: AvisoSucessoProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(movimento.duracoes.entradaRapida)}
      exiting={FadeOutUp.duration(movimento.duracoes.saida)}>
      <GlassSurface style={styles.container} contentStyle={styles.conteudo} intensity={84}>
        <View style={styles.icone}>
          <MaterialIcons name="check" size={16} color={cores.verde} />
        </View>
        <Text style={styles.texto}>{mensagem}</Text>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: raios.lg,
    ...sombraSuave,
  },
  conteudo: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    flex: 1,
    color: cores.verde,
    fontSize: 14,
    fontWeight: '700',
  },
});
