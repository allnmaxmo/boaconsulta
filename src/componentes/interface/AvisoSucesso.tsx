import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { cores, raios } from '@/src/constantes/tema';

type AvisoSucessoProps = {
  mensagem?: string;
};

export function AvisoSucesso({ mensagem = 'Alterações salvas com sucesso.' }: AvisoSucessoProps) {
  return (
    <Animated.View entering={FadeInDown.duration(240)} exiting={FadeOutUp.duration(180)} style={styles.container}>
      <View style={styles.icone}>
        <MaterialIcons name="check" size={16} color={cores.verde} />
      </View>
      <Text style={styles.texto}>{mensagem}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: raios.md,
    backgroundColor: cores.verdeSuave,
    borderWidth: 1,
    borderColor: '#BFEBDD',
    padding: 12,
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

