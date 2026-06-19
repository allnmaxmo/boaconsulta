import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
  const opcaoSelecionada = opcoes.find((opcao) => opcao.valor === valor);
  const buscaNormalizada = normalizarTexto(busca);

  const opcoesFiltradas = useMemo(() => {
    if (!buscaNormalizada) {
      return opcoes.slice(0, 8);
    }

    return opcoes
      .filter((opcao) => {
        const rotulo = normalizarTexto(opcao.rotulo);
        return rotulo.startsWith(buscaNormalizada) || rotulo.includes(buscaNormalizada);
      })
      .slice(0, 8);
  }, [buscaNormalizada, opcoes]);

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        style={[styles.input, erro && styles.inputErro]}
        placeholder={placeholder ?? 'Digite para pesquisar'}
        placeholderTextColor={cores.textoSuave}
        value={busca}
        onChangeText={setBusca}
      />

      {opcaoSelecionada ? (
        <View style={styles.selecionado}>
          <Text style={styles.selecionadoRotulo}>{opcaoSelecionada.rotulo}</Text>
          {opcaoSelecionada.detalhe ? (
            <Text style={styles.selecionadoDetalhe}>{opcaoSelecionada.detalhe}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.lista}>
        {opcoesFiltradas.map((opcao) => {
          const selecionada = opcao.valor === valor;

          return (
            <Pressable
              key={opcao.valor}
              onPress={() => {
                onChange(opcao.valor);
                setBusca('');
              }}
              style={[styles.opcao, selecionada && styles.opcaoSelecionada]}
            >
              <Text style={[styles.opcaoRotulo, selecionada && styles.opcaoRotuloSelecionada]}>
                {opcao.rotulo}
              </Text>
              {opcao.detalhe ? <Text style={styles.opcaoDetalhe}>{opcao.detalhe}</Text> : null}
            </Pressable>
          );
        })}
      </View>

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
  input: {
    minHeight: 48,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.vidroForte,
    color: cores.texto,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    ...sombraSuave,
  },
  inputErro: {
    borderColor: cores.vermelho,
  },
  selecionado: {
    borderRadius: raios.lg,
    backgroundColor: cores.azulSuave,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selecionadoRotulo: {
    color: cores.azulProfundo,
    fontSize: 14,
    fontWeight: '800',
  },
  selecionadoDetalhe: {
    color: cores.textoSuave,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  lista: {
    gap: 8,
  },
  opcao: {
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.vidro,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  opcaoSelecionada: {
    borderColor: 'rgba(0,74,198,0.32)',
    backgroundColor: cores.azulSuave,
  },
  opcaoRotulo: {
    color: cores.texto,
    fontSize: 14,
    fontWeight: '700',
  },
  opcaoRotuloSelecionada: {
    color: cores.azulProfundo,
  },
  opcaoDetalhe: {
    color: cores.textoSuave,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  erro: {
    color: cores.vermelho,
    fontSize: 13,
    fontWeight: '600',
  },
});
