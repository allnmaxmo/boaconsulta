import { Modal, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/src/componentes/interface/GlassSurface';
import { cores, raios, sombraCartao } from '@/src/constantes/tema';
import { Botao } from '@/src/componentes/interface/Botao';

type ModalConfirmacaoProps = {
  visivel: boolean;
  titulo: string;
  descricao: string;
  textoConfirmar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export function ModalConfirmacao({
  visivel,
  titulo,
  descricao,
  textoConfirmar = 'Confirmar',
  onConfirmar,
  onCancelar,
}: ModalConfirmacaoProps) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.overlay}>
        <GlassSurface style={styles.cartao} contentStyle={styles.cartaoConteudo} variant="strong" intensity={84}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.descricao}>{descricao}</Text>
          <View style={styles.acoes}>
            <Botao titulo="Voltar" variante="secundario" onPress={onCancelar} style={styles.botao} />
            <Botao titulo={textoConfirmar} variante="perigo" onPress={onConfirmar} style={styles.botao} />
          </View>
        </GlassSurface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,24,39,0.28)',
    padding: 22,
  },
  cartao: {
    width: '100%',
    maxWidth: 420,
    borderRadius: raios.xl,
    ...sombraCartao,
  },
  cartaoConteudo: {
    padding: 24,
    gap: 14,
  },
  titulo: {
    color: cores.texto,
    fontSize: 22,
    fontWeight: '900',
  },
  descricao: {
    color: cores.textoSuave,
    fontSize: 15,
    lineHeight: 22,
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  botao: {
    flex: 1,
  },
});
