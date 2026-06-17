import { StyleSheet, Text, View } from 'react-native';

import { SeloStatus } from '@/src/componentes/agenda/SeloStatus';
import { cores, raios } from '@/src/constantes/tema';
import { AtendimentoComRelacionamentos } from '@/src/tipos/dominio';
import { formatarDataCurta, obterHorario } from '@/src/utilitarios/data';

type ItemHistoricoAtendimentoProps = {
  atendimento: AtendimentoComRelacionamentos;
};

export function ItemHistoricoAtendimento({ atendimento }: ItemHistoricoAtendimentoProps) {
  return (
    <View style={styles.item}>
      <View style={styles.data}>
        <Text style={styles.dataTexto}>{formatarDataCurta(atendimento.dataHora)}</Text>
        <Text style={styles.horaTexto}>{obterHorario(atendimento.dataHora)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.tipo}>{atendimento.tipoAtendimento}</Text>
        <Text style={styles.profissional}>
          {atendimento.profissional?.nome ?? 'Profissional removido'}
        </Text>
      </View>
      <SeloStatus status={atendimento.status} />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: raios.md,
    backgroundColor: cores.superficieElevada,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 12,
  },
  data: {
    width: 74,
    gap: 2,
  },
  dataTexto: {
    color: cores.texto,
    fontSize: 13,
    fontWeight: '800',
  },
  horaTexto: {
    color: cores.textoSuave,
    fontSize: 13,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  tipo: {
    color: cores.texto,
    fontSize: 15,
    fontWeight: '800',
  },
  profissional: {
    color: cores.textoSuave,
    fontSize: 13,
    fontWeight: '600',
  },
});

