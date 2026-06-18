import { StyleSheet, Text, View } from 'react-native';

import { cores, raios } from '@/src/constantes/tema';
import { StatusAtendimento } from '@/src/tipos/dominio';

const configuracaoStatus: Record<StatusAtendimento, { rotulo: string; cor: string; fundo: string; borda: string }> = {
  agendado: { rotulo: 'Agendado', cor: cores.azulProfundo, fundo: cores.lilasSuave, borda: 'rgba(139,92,246,0.20)' },
  realizado: { rotulo: 'Realizado', cor: cores.verde, fundo: cores.verdeSuave, borda: 'rgba(22,163,74,0.18)' },
  cancelado: { rotulo: 'Cancelado', cor: cores.vermelho, fundo: cores.vermelhoSuave, borda: 'rgba(220,38,38,0.16)' },
  falta: { rotulo: 'Falta', cor: cores.laranja, fundo: cores.laranjaSuave, borda: 'rgba(245,158,11,0.18)' },
};

type SeloStatusProps = {
  status: StatusAtendimento;
};

export function SeloStatus({ status }: SeloStatusProps) {
  const config = configuracaoStatus[status];

  return (
    <View style={[styles.selo, { backgroundColor: config.fundo, borderColor: config.borda }]}>
      <Text style={[styles.texto, { color: config.cor }]}>{config.rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  selo: {
    borderRadius: raios.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  texto: {
    fontSize: 12,
    fontWeight: '800',
  },
});

