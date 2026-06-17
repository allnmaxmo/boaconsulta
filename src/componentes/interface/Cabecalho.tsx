import { StyleSheet, Text, View } from 'react-native';

import { cores } from '@/src/constantes/tema';

type CabecalhoProps = {
  titulo: string;
  subtitulo?: string;
  acao?: React.ReactNode;
};

export function Cabecalho({ titulo, subtitulo, acao }: CabecalhoProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      </View>
      {acao}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  textos: {
    flex: 1,
    gap: 4,
  },
  titulo: {
    color: cores.texto,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitulo: {
    color: cores.textoSuave,
    fontSize: 15,
    fontWeight: '600',
  },
});

