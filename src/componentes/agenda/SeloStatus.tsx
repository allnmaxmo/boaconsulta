import { StyleSheet, Text, View } from 'react-native';

import { cores, raios } from '@/src/constantes/tema';
import { StatusAtendimento } from '@/src/tipos/dominio';

const configuracaoStatus: Record<StatusAtendimento, { rotulo: string; cor: string; fundo: string }> = {
  agendado: { rotulo: 'Agendado', cor: cores.azul, fundo: cores.azulSuave },
  realizado: { rotulo: 'Realizado', cor: cores.verde, fundo: cores.verdeSuave },
  cancelado: { rotulo: 'Cancelado', cor: cores.vermelho, fundo: cores.vermelhoSuave },
};

type SeloStatusProps = {
  status: StatusAtendimento;
};

export function SeloStatus({ status }: SeloStatusProps) {
  const config = configuracaoStatus[status];

  return (
    <View style={[styles.selo, { backgroundColor: config.fundo }]}>
      <Text style={[styles.texto, { color: config.cor }]}>{config.rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  selo: {
    borderRadius: raios.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  texto: {
    fontSize: 12,
    fontWeight: '800',
  },
});

