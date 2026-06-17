import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { cores, raios, sombraCartao } from '@/src/constantes/tema';
import { Paciente } from '@/src/tipos/dominio';

type CartaoPacienteProps = {
  paciente: Paciente;
  indice?: number;
  onAbrir: () => void;
  onEditar: () => void;
  onExcluir: () => void;
};

export function CartaoPaciente({ paciente, indice = 0, onAbrir, onEditar, onExcluir }: CartaoPacienteProps) {
  return (
    <Animated.View entering={FadeInUp.delay(indice * 45).duration(320).springify()}>
      <Pressable onPress={onAbrir} style={styles.cartao}>
        <View style={styles.avatar}>
          <Text style={styles.inicial}>{paciente.nome.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.nome}>{paciente.nome}</Text>
          <Text style={styles.telefone}>{paciente.telefone}</Text>
          <Text style={styles.perfil}>Ver perfil</Text>
        </View>
        <View style={styles.acoes}>
          <Pressable onPress={onEditar} style={styles.acao}>
            <MaterialIcons name="edit" size={18} color={cores.azul} />
          </Pressable>
          <Pressable onPress={onExcluir} style={[styles.acao, styles.acaoPerigo]}>
            <MaterialIcons name="delete-outline" size={18} color={cores.vermelho} />
          </Pressable>
        </View>
      </Pressable>
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
    backgroundColor: cores.azulSuave,
  },
  inicial: {
    color: cores.azul,
    fontSize: 20,
    fontWeight: '900',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nome: {
    color: cores.texto,
    fontSize: 17,
    fontWeight: '800',
  },
  telefone: {
    color: cores.textoSuave,
    fontSize: 14,
    fontWeight: '600',
  },
  perfil: {
    color: cores.azul,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
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

