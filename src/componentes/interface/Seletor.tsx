import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

import { movimento } from '@/src/constantes/movimento';
import { cores, raios, sombraSuave } from '@/src/constantes/tema';

export type OpcaoSeletor = {
  rotulo: string;
  valor: string;
  detalhe?: string;
};

type SeletorProps = {
  rotulo: string;
  valor?: string;
  opcoes: OpcaoSeletor[];
  onChange: (valor: string) => void;
  erro?: string;
  horizontal?: boolean;
};

export function Seletor({ rotulo, valor, opcoes, onChange, erro, horizontal = false }: SeletorProps) {
  const conteudo = (
    <View style={horizontal ? styles.linha : styles.coluna}>
      {opcoes.map((opcao) => {
        const selecionado = opcao.valor === valor;

        return (
          <Animated.View
            key={opcao.valor}
            entering={FadeIn.duration(movimento.duracoes.entradaRapida)}
            layout={Layout.springify()
              .damping(movimento.molas.layoutDamping)
              .stiffness(movimento.molas.layoutStiffness)}>
            <Pressable
              onPress={() => onChange(opcao.valor)}
              style={[styles.opcao, selecionado ? styles.opcaoSelecionada : null]}>
              <Text style={[styles.opcaoTexto, selecionado ? styles.opcaoTextoSelecionada : null]}>
                {opcao.rotulo}
              </Text>
              {opcao.detalhe ? <Text style={styles.detalhe}>{opcao.detalhe}</Text> : null}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      {horizontal ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {conteudo}
        </ScrollView>
      ) : (
        conteudo
      )}
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  rotulo: {
    color: cores.texto,
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    paddingRight: 16,
  },
  linha: {
    flexDirection: 'row',
    gap: 10,
  },
  coluna: {
    gap: 10,
  },
  opcao: {
    minHeight: 48,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.vidroForte,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
    ...sombraSuave,
  },
  opcaoSelecionada: {
    backgroundColor: cores.lilasSuave,
    borderColor: 'rgba(139,92,246,0.28)',
  },
  opcaoTexto: {
    color: cores.texto,
    fontSize: 15,
    fontWeight: '700',
  },
  opcaoTextoSelecionada: {
    color: cores.lilas,
  },
  detalhe: {
    color: cores.textoSuave,
    fontSize: 12,
    fontWeight: '600',
  },
  erro: {
    color: cores.vermelho,
    fontSize: 13,
    fontWeight: '600',
  },
});
