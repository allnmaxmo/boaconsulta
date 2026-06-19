import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { cores, raios, sombraSuave } from '@/src/constantes/tema';

type OpcaoPesquisavel = {
  rotulo: string;
  valor: string;
  detalhe?: string;
};

type SeletorPesquisavelProps = {
  rotulo: string;
  valor?: string;
  placeholder?: string;
  opcoes: OpcaoPesquisavel[];
  onChange: (valor: string) => void;
  erro?: string;
};

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function SeletorPesquisavel({
  rotulo,
  valor,
  placeholder,
  opcoes,
  onChange,
  erro,
}: SeletorPesquisavelProps) {
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(false);
  const opcaoSelecionada = opcoes.find((opcao) => opcao.valor === valor);
  const buscaNormalizada = normalizarTexto(busca);

  const opcoesFiltradas = useMemo(() => {
    if (!buscaNormalizada) {
      return opcoes;
    }

    return opcoes.filter((opcao) => {
      const rotuloNormalizado = normalizarTexto(opcao.rotulo);
      const detalheNormalizado = normalizarTexto(opcao.detalhe ?? '');

      return (
        rotuloNormalizado.startsWith(buscaNormalizada) ||
        rotuloNormalizado.includes(buscaNormalizada) ||
        detalheNormalizado.includes(buscaNormalizada)
      );
    });
  }, [buscaNormalizada, opcoes]);

  function selecionarOpcao(opcao: OpcaoPesquisavel) {
    onChange(opcao.valor);
    setBusca('');
    setAberto(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{rotulo}</Text>

      <Pressable
        onPress={() => setAberto(true)}
        style={({ pressed }) => [
          styles.campo,
          erro && styles.campoErro,
          pressed && { opacity: 0.76 },
        ]}
        accessibilityRole="button"
      >
        <View style={styles.campoTextos}>
          <Text style={[styles.campoRotulo, !opcaoSelecionada && styles.placeholder]}>
            {opcaoSelecionada?.rotulo ?? placeholder ?? 'Selecione uma opção'}
          </Text>
          {opcaoSelecionada?.detalhe ? (
            <Text style={styles.campoDetalhe}>{opcaoSelecionada.detalhe}</Text>
          ) : null}
        </View>
        <MaterialIcons name="expand-more" size={22} color={cores.textoSuave} />
      </Pressable>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable style={styles.fundoModal} onPress={() => setAberto(false)}>
          <Pressable style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitulo}>{rotulo}</Text>
                <Text style={styles.modalSubtitulo}>Pesquise e selecione uma opção</Text>
              </View>
              <Pressable onPress={() => setAberto(false)} style={styles.botaoFechar}>
                <MaterialIcons name="close" size={20} color={cores.texto} />
              </Pressable>
            </View>

            <View style={styles.buscaWrap}>
              <MaterialIcons name="search" size={19} color={cores.textoSuave} />
              <TextInput
                style={styles.buscaInput}
                placeholder="Digite para filtrar"
                placeholderTextColor={cores.textoSuave}
                value={busca}
                onChangeText={setBusca}
                autoFocus
                returnKeyType="search"
              />
            </View>

            <FlatList
              data={opcoesFiltradas}
              keyExtractor={(opcao) => opcao.valor}
              keyboardShouldPersistTaps="handled"
              style={styles.lista}
              contentContainerStyle={styles.listaConteudo}
              ListEmptyComponent={
                <Text style={styles.listaVazia}>Nenhuma opção encontrada.</Text>
              }
              renderItem={({ item }) => {
                const selecionada = item.valor === valor;

                return (
                  <Pressable
                    onPress={() => selecionarOpcao(item)}
                    style={[styles.opcao, selecionada && styles.opcaoSelecionada]}
                  >
                    <View style={styles.opcaoTextos}>
                      <Text
                        style={[
                          styles.opcaoRotulo,
                          selecionada && styles.opcaoRotuloSelecionada,
                        ]}
                      >
                        {item.rotulo}
                      </Text>
                      {item.detalhe ? <Text style={styles.opcaoDetalhe}>{item.detalhe}</Text> : null}
                    </View>
                    {selecionada ? (
                      <MaterialIcons name="check-circle" size={21} color={cores.azul} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  campo: {
    minHeight: 54,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.vidroForte,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    ...sombraSuave,
  },
  campoErro: {
    borderColor: cores.vermelho,
  },
  campoTextos: {
    flex: 1,
    gap: 2,
  },
  campoRotulo: {
    color: cores.texto,
    fontSize: 15,
    fontWeight: '700',
  },
  placeholder: {
    color: cores.textoSuave,
    fontWeight: '600',
  },
  campoDetalhe: {
    color: cores.textoSuave,
    fontSize: 12,
    fontWeight: '600',
  },
  erro: {
    color: cores.vermelho,
    fontSize: 13,
    fontWeight: '600',
  },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(8, 13, 28, 0.42)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '78%',
    borderRadius: raios.xl,
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalTitulo: {
    color: cores.texto,
    fontSize: 18,
    fontWeight: '900',
  },
  modalSubtitulo: {
    color: cores.textoSuave,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  botaoFechar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.vidroForte,
  },
  buscaWrap: {
    minHeight: 48,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.vidro,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
  },
  buscaInput: {
    flex: 1,
    color: cores.texto,
    fontSize: 15,
    fontWeight: '600',
  },
  lista: {
    maxHeight: 360,
  },
  listaConteudo: {
    gap: 8,
    paddingBottom: 4,
  },
  listaVazia: {
    color: cores.textoSuave,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 24,
  },
  opcao: {
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.vidro,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  opcaoSelecionada: {
    borderColor: 'rgba(0,74,198,0.32)',
    backgroundColor: cores.azulSuave,
  },
  opcaoTextos: {
    flex: 1,
    gap: 2,
  },
  opcaoRotulo: {
    color: cores.texto,
    fontSize: 14,
    fontWeight: '800',
  },
  opcaoRotuloSelecionada: {
    color: cores.azulProfundo,
  },
  opcaoDetalhe: {
    color: cores.textoSuave,
    fontSize: 12,
    fontWeight: '600',
  },
});
