import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { cores, raios, sombraCartao } from '@/src/constantes/tema';
import { Profissional } from '@/src/tipos/dominio';

type CartaoProfissionalProps = {
  profissional: Profissional;
  indice?: number;
  onEditar: () => void;
  onExcluir: () => void;
};

export function CartaoProfissional({
  profissional,
  indice = 0,
  onEditar,
  onExcluir,
}: CartaoProfissionalProps) {
  return (
    <Animated.View entering={FadeInUp.delay(indice * 45).duration(320).springify()}>
      <View style={styles.cartao}>
        <View style={styles.avatar}>
          <MaterialIcons name="badge" size={22} color={cores.verde} />
        </View>
        <View style={styles.info}>
          <Text style={styles.nome}>{profissional.nome}</Text>
          <Text style={styles.especialidade}>{profissional.especialidade}</Text>
        </View>
        <View style={styles.acoes}>
          <Pressable onPress={onEditar} style={styles.acao}>
            <MaterialIcons name="edit" size={18} color={cores.azul} />
          </Pressable>
          <Pressable onPress={onExcluir} style={[styles.acao, styles.acaoPerigo]}>
            <MaterialIcons name="delete-outline" size={18} color={cores.vermelho} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: raios.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
    ...sombraCartao,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.verdeSuave,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nome: {
    color: cores.texto,
    fontSize: 17,
    fontWeight: '800',
  },
  especialidade: {
    color: cores.textoSuave,
    fontSize: 14,
    fontWeight: '600',
  },
  acoes: {
    flexDirection: 'row',
    gap: 8,
  },
  acao: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.azulSuave,
  },
  acaoPerigo: {
    backgroundColor: cores.vermelhoSuave,
  },
});

