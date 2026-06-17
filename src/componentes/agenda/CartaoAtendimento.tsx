import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { SeloStatus } from '@/src/componentes/agenda/SeloStatus';
import { cores, raios, sombraCartao } from '@/src/constantes/tema';
import { AtendimentoComRelacionamentos } from '@/src/tipos/dominio';
import { obterHorario } from '@/src/utilitarios/data';

type CartaoAtendimentoProps = {
  atendimento: AtendimentoComRelacionamentos;
  indice?: number;
  onPress?: () => void;
  onPacientePress?: () => void;
};

export function CartaoAtendimento({
  atendimento,
  indice = 0,
  onPress,
  onPacientePress,
}: CartaoAtendimentoProps) {
  return (
    <Animated.View entering={FadeInUp.delay(indice * 55).duration(360).springify()}>
      <Pressable onPress={onPress} style={styles.cartao}>
        <View style={styles.hora}>
          <Text style={styles.horaTexto}>{obterHorario(atendimento.dataHora)}</Text>
        </View>
        <View style={styles.conteudo}>
          <View style={styles.topo}>
            <View style={styles.textos}>
              <Text style={styles.paciente}>{atendimento.paciente?.nome ?? 'Paciente removido'}</Text>
              <Text style={styles.tipo}>{atendimento.tipoAtendimento}</Text>
            </View>
            <SeloStatus status={atendimento.status} />
          </View>
          <View style={styles.rodape}>
            <MaterialIcons name="medical-services" size={16} color={cores.textoSuave} />
            <Text style={styles.profissional}>
              {atendimento.profissional?.nome ?? 'Profissional removido'}
            </Text>
          </View>
          {onPacientePress ? (
            <Pressable onPress={onPacientePress} style={styles.linkPaciente}>
              <Text style={styles.linkTexto}>Abrir perfil do paciente</Text>
              <MaterialIcons name="chevron-right" size={18} color={cores.azul} />
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: raios.lg,
    backgroundColor: cores.superficie,
    padding: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    ...sombraCartao,
  },
  hora: {
    minWidth: 66,
    height: 52,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.azulSuave,
  },
  horaTexto: {
    color: cores.azul,
    fontSize: 17,
    fontWeight: '800',
  },
  conteudo: {
    flex: 1,
    gap: 12,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  textos: {
    flex: 1,
    gap: 4,
  },
  paciente: {
    color: cores.texto,
    fontSize: 17,
    fontWeight: '800',
  },
  tipo: {
    color: cores.textoSuave,
    fontSize: 14,
    fontWeight: '600',
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profissional: {
    flex: 1,
    color: cores.textoSuave,
    fontSize: 14,
    fontWeight: '600',
  },
  linkPaciente: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  linkTexto: {
    color: cores.azul,
    fontSize: 13,
    fontWeight: '800',
  },
});

