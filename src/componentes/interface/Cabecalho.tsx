import { StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/src/componentes/interface/GlassSurface';
import { cores, raios, sombraSuave } from '@/src/constantes/tema';

type CabecalhoProps = {
  titulo: string;
  subtitulo?: string;
  acao?: React.ReactNode;
};

export function Cabecalho({ titulo, subtitulo, acao }: CabecalhoProps) {
  return (
    <GlassSurface style={styles.container} contentStyle={styles.conteudo} variant="strong" intensity={84}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      </View>
      {acao}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: raios.xl,
    ...sombraSuave,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: 18,
  },
  textos: {
    flex: 1,
    gap: 4,
  },
  titulo: {
    color: cores.texto,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitulo: {
    color: cores.textoSuave,
    fontSize: 15,
    fontWeight: '700',
  },
});
