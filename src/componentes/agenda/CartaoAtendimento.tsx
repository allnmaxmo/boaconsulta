import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { GlassDivider } from '@/src/componentes/interface/GlassDivider';
import { GlassSurface } from '@/src/componentes/interface/GlassSurface';
import { MotionPressable } from '@/src/componentes/interface/MotionPressable';
import { SeloStatus } from '@/src/componentes/agenda/SeloStatus';
import { movimento } from '@/src/constantes/movimento';
import { cores, raios } from '@/src/constantes/tema';
import { AtendimentoComRelacionamentos } from '@/src/tipos/dominio';
import { formatarDataCurta, obterHorario } from '@/src/utilitarios/data';

type CartaoAtendimentoProps = {
  atendimento: AtendimentoComRelacionamentos;
  indice?: number;
  onPress?: () => void;
  onPacientePress?: () => void;
  mostrarData?: boolean;
};

export function CartaoAtendimento({
  atendimento,
  indice = 0,
  onPress,
  onPacientePress,
  mostrarData = false,
}: CartaoAtendimentoProps) {
  return (
    <Animated.View
      entering={FadeInRight.delay(indice * movimento.listas.agendaDelay)
        .duration(movimento.duracoes.entradaPadrao)
        .springify()
        .damping(movimento.molas.entradaDamping)
        .stiffness(movimento.molas.entradaStiffness)}>
      <MotionPressable onPress={onPress}>
        <GlassSurface style={styles.cartao} contentStyle={styles.cartaoConteudo} intensity={84}>
          <View style={styles.hora}>
            <Text style={styles.horaTexto}>{obterHorario(atendimento.dataHora)}</Text>
            {mostrarData ? (
              <Text style={styles.dataTexto}>{formatarDataCurta(atendimento.dataHora)}</Text>
            ) : null}
          </View>
          <View style={styles.conteudo}>
            <View style={styles.topo}>
              <View style={styles.textos}>
                <Text style={styles.paciente}>{atendimento.paciente?.nome ?? 'Paciente removido'}</Text>
                <Text style={styles.tipo}>{atendimento.tipoAtendimento}</Text>
              </View>
              <SeloStatus status={atendimento.status} />
            </View>
            <GlassDivider />
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
        </GlassSurface>
      </MotionPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: raios.xl,
  },
  cartaoConteudo: {
    flexDirection: 'row',
    gap: 16,
    padding: 18,
  },
  hora: {
    minWidth: 70,
    minHeight: 56,
    borderRadius: raios.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.cianoSuave,
    borderWidth: 1,
    borderColor: cores.bordaClara,
  },
  horaTexto: {
    color: cores.azulProfundo,
    fontSize: 17,
    fontWeight: '800',
  },
  dataTexto: {
    color: cores.textoSuave,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
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
    borderRadius: raios.pill,
    backgroundColor: cores.azulSuave,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  linkTexto: {
    color: cores.azul,
    fontSize: 13,
    fontWeight: '800',
  },
});

