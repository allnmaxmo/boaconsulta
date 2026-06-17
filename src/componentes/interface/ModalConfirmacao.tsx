import { Modal, StyleSheet, Text, View } from 'react-native';

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
        <View style={styles.cartao}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.descricao}>{descricao}</Text>
          <View style={styles.acoes}>
            <Botao titulo="Voltar" variante="secundario" onPress={onCancelar} style={styles.botao} />
            <Botao titulo={textoConfirmar} variante="perigo" onPress={onConfirmar} style={styles.botao} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 32, 51, 0.34)',
    padding: 22,
  },
  cartao: {
    width: '100%',
    maxWidth: 420,
    borderRadius: raios.lg,
    backgroundColor: cores.superficie,
    padding: 22,
    gap: 12,
    ...sombraCartao,
  },
  titulo: {
    color: cores.texto,
    fontSize: 21,
    fontWeight: '800',
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

