import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

import { GlassSurface } from '@/src/componentes/interface/GlassSurface';
import { MotionPressable } from '@/src/componentes/interface/MotionPressable';
import { movimento } from '@/src/constantes/movimento';
import { cores, raios } from '@/src/constantes/tema';
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
    <Animated.View
      entering={FadeInLeft.delay(indice * movimento.listas.pacientesDelay)
        .duration(movimento.duracoes.entradaPadrao)
        .springify()
        .damping(movimento.molas.entradaDamping)
        .stiffness(movimento.molas.entradaStiffness)}>
      <MotionPressable onPress={onAbrir}>
        <GlassSurface style={styles.cartao} contentStyle={styles.cartaoConteudo} intensity={84}>
          <View style={styles.avatar}>
            {paciente.avatarUrl ? (
              <Image source={{ uri: paciente.avatarUrl }} style={styles.avatarImagem} />
            ) : (
              <Text style={styles.inicial}>{paciente.nome.charAt(0)}</Text>
            )}
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
        </GlassSurface>
      </MotionPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: raios.xl,
  },
  cartaoConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.lilasSuave,
    borderWidth: 1,
    borderColor: cores.bordaClara,
    overflow: 'hidden',
  },
  avatarImagem: {
    width: '100%',
    height: '100%',
  },
  inicial: {
    color: cores.lilas,
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
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.vidroForte,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  acaoPerigo: {
    backgroundColor: cores.vermelhoSuave,
  },
});

