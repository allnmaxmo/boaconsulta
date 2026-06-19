import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlassSurface } from '@/src/componentes/interface/GlassSurface';
import { movimento } from '@/src/constantes/movimento';
import { cores, raios } from '@/src/constantes/tema';
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
    <Animated.View
      entering={FadeInDown.delay(indice * movimento.listas.profissionaisDelay)
        .duration(movimento.duracoes.entradaRapida)
        .springify()
        .damping(movimento.molas.entradaDamping)
        .stiffness(movimento.molas.entradaStiffness)}>
      <GlassSurface style={styles.cartao} contentStyle={styles.cartaoConteudo} intensity={84}>
        <View style={styles.avatar}>
          {profissional.avatarUrl ? (
            <Image source={{ uri: profissional.avatarUrl }} style={styles.avatarImagem} />
          ) : (
            <Text style={styles.inicial}>{profissional.nome.charAt(0)}</Text>
          )}
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
      </GlassSurface>
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
    backgroundColor: cores.cianoSuave,
    borderWidth: 1,
    borderColor: cores.bordaClara,
    overflow: 'hidden',
  },
  avatarImagem: {
    width: '100%',
    height: '100%',
  },
  inicial: {
    color: cores.verde,
    fontSize: 20,
    fontWeight: '900',
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

