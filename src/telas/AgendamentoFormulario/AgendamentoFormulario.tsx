import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Pressable,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModalConfirmacao } from '@/src/componentes/interface/ModalConfirmacao';
import { Seletor } from '@/src/componentes/interface/Seletor';
import { SeletorPesquisavel } from '@/src/componentes/interface/SeletorPesquisavel';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';
import { opcoesLembreteAtendimento } from '@/src/servicos/notificacoes';
import { StatusAtendimento } from '@/src/tipos/dominio';
import { dataISOHoje, montarDataHora, obterData, obterHorario } from '@/src/utilitarios/data';
import {
  AtendimentoEdicaoFormulario,
  atendimentoEdicaoSchema,
} from '@/src/validacoes/formularios';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#004ac6',
  onPrimary: '#ffffff',
  onSurface: '#131b2e',
  onSurfaceVariant: '#434655',
  surface: '#faf8ff',
  error: '#ba1a1a',
  successBg: 'rgba(0, 74, 198, 0.08)',
  errorBg: 'rgba(186, 26, 26, 0.08)',
  glassButton: 'rgba(0, 74, 198, 0.88)',
  glass: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  inputBg: 'rgba(255, 255, 255, 0.60)',
};

const RADIUS = {
  lg: 16,
  xl: 20,
  '2xl': 24,
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AgendamentoFormularioProps = {
  atendimentoId?: string;
};

const opcoesStatus: { rotulo: string; valor: StatusAtendimento }[] = [
  { rotulo: 'Agendado', valor: 'agendado' },
  { rotulo: 'Realizado', valor: 'realizado' },
  { rotulo: 'Cancelado', valor: 'cancelado' },
  { rotulo: 'Falta', valor: 'falta' },
];

function formatarDataFormulario(data: string) {
  if (!data) {
    return '';
  }

  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarDataISO(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function formatarHorarioFormulario(data: Date) {
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  return `${hora}:${minuto}`;
}

function criarDataPicker(data: string, horario: string) {
  const dataBase = data || dataISOHoje();
  const horarioBase = horario || '12:00';
  return new Date(`${dataBase}T${horarioBase}:00`);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

function CampoGlass({
  rotulo,
  placeholder,
  value,
  onChangeText,
  erro,
  style,
  keyboardType,
}: {
  rotulo: string;
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;
  erro?: string;
  style?: object;
  keyboardType?: 'default' | 'phone-pad' | 'numeric';
}) {
  return (
    <View style={[styles.campoWrap, style]}>
      <Text style={styles.campoRotulo}>{rotulo}</Text>
      <TextInput
        style={[styles.campoInput, erro && styles.campoInputErro]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
      />
      {erro ? <Text style={styles.campoErro}>{erro}</Text> : null}
    </View>
  );
}

function CampoAcionavel({
  rotulo,
  valor,
  placeholder,
  erro,
  onPress,
  style,
}: {
  rotulo: string;
  valor: string;
  placeholder: string;
  erro?: string;
  onPress: () => void;
  style?: object;
}) {
  return (
    <View style={[styles.campoWrap, style]}>
      <Text style={styles.campoRotulo}>{rotulo}</Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.campoInput,
          styles.campoAcionavel,
          erro && styles.campoInputErro,
          pressed && { opacity: 0.76 },
        ]}
      >
        <Text style={[styles.campoAcionavelTexto, !valor && styles.campoAcionavelPlaceholder]}>
          {valor || placeholder}
        </Text>
        <MaterialIcons name="expand-more" size={20} color={COLORS.onSurfaceVariant} />
      </Pressable>
      {erro ? <Text style={styles.campoErro}>{erro}</Text> : null}
    </View>
  );
}

function BotaoGlass({
  titulo,
  variante = 'primario',
  carregando,
  onPress,
  style,
}: {
  titulo: string;
  variante?: 'primario' | 'perigo' | 'fantasma';
  carregando?: boolean;
  onPress: () => void;
  style?: object;
}) {
  const estilosFundo: Record<string, object> = {
    primario: styles.botaoPrimario,
    perigo: styles.botaoPerigo,
    fantasma: styles.botaoFantasma,
  };
  const estilosTexto: Record<string, object> = {
    primario: styles.botaoPrimarioTexto,
    perigo: styles.botaoPerigoTexto,
    fantasma: styles.botaoFantasmaTexto,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={carregando}
      style={({ pressed }) => [
        styles.botaoBase,
        estilosFundo[variante],
        style,
        (pressed || carregando) && { opacity: 0.72, transform: [{ scale: 0.97 }] },
      ]}
    >
      <Text style={[styles.botaoTextoBase, estilosTexto[variante]]}>
        {carregando ? 'Salvando...' : titulo}
      </Text>
    </Pressable>
  );
}

function AvisoGlass({ mensagem, tipo = 'sucesso' }: { mensagem: string; tipo?: 'sucesso' | 'erro' }) {
  return (
    <View style={[styles.avisoWrap, tipo === 'erro' ? styles.avisoErro : styles.avisoSucesso]}>
      <MaterialIcons
        name={tipo === 'erro' ? 'error-outline' : 'check-circle-outline'}
        size={18}
        color={tipo === 'erro' ? COLORS.error : COLORS.primary}
      />
      <Text style={[styles.avisoTexto, tipo === 'erro' ? styles.avisoErroTexto : styles.avisoSucessoTexto]}>
        {mensagem}
      </Text>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export function AgendamentoFormulario({ atendimentoId }: AgendamentoFormularioProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    pacientes,
    profissionais,
    obterAtendimento,
    criarAtendimento,
    editarAtendimento,
    cancelarAtendimento,
  } = useDadosClinica();

  const atendimento = atendimentoId ? obterAtendimento(atendimentoId) : undefined;
  const editando = Boolean(atendimento);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
  const [mostrandoData, setMostrandoData] = useState(false);
  const [mostrandoHorario, setMostrandoHorario] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AtendimentoEdicaoFormulario>({
    resolver: zodResolver(atendimentoEdicaoSchema),
    defaultValues: {
      pacienteId: atendimento?.pacienteId ?? '',
      profissionalId: atendimento?.profissionalId ?? '',
      data: atendimento ? obterData(atendimento.dataHora) : dataISOHoje(),
      horario: atendimento ? obterHorario(atendimento.dataHora) : '',
      tipoAtendimento: atendimento?.tipoAtendimento ?? '',
      lembreteMinutos: String(atendimento?.lembreteMinutos ?? 30),
      status: atendimento?.status ?? 'agendado',
    },
  });
  const dataSelecionada = watch('data');
  const horarioSelecionado = watch('horario');

  async function salvar(dados: AtendimentoEdicaoFormulario) {
    setEnviando(true);
    setErroEnvio(null);
    const dataHora = montarDataHora(dados.data, dados.horario);
    try {
      if (editando && atendimentoId) {
        await editarAtendimento(atendimentoId, {
          pacienteId: dados.pacienteId,
          profissionalId: dados.profissionalId,
          dataHora,
          tipoAtendimento: dados.tipoAtendimento,
          status: dados.status,
          lembreteMinutos: Number(dados.lembreteMinutos),
        });
      } else {
        await criarAtendimento({
          pacienteId: dados.pacienteId,
          profissionalId: dados.profissionalId,
          dataHora,
          tipoAtendimento: dados.tipoAtendimento,
          lembreteMinutos: Number(dados.lembreteMinutos),
        });
      }
      setSucesso(true);
      setTimeout(() => router.back(), 650);
    } catch (error) {
      setErroEnvio(error instanceof Error ? error.message : 'Erro ao salvar agendamento.');
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarCancelamento() {
    if (atendimentoId) {
      try {
        await cancelarAtendimento(atendimentoId);
        setSucesso(true);
        setConfirmandoCancelamento(false);
        setTimeout(() => router.back(), 650);
      } catch (error) {
        setErroEnvio(error instanceof Error ? error.message : 'Erro ao cancelar atendimento.');
      }
    }
  }

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Cabeçalho glass ── */}
      <View style={styles.headerWrap}>
        <GlassCard style={styles.headerCard}>
          <View>
            <Text style={styles.headerTitulo}>
              {editando ? 'Editar Agendamento' : 'Novo Agendamento'}
            </Text>
            <Text style={styles.headerSubtitulo}>
              {editando
                ? 'Atualize dados e status do atendimento'
                : 'Cadastre um atendimento'}
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.botaoVoltar, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>
        </GlassCard>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avisos ── */}
        {sucesso && <AvisoGlass mensagem="Agendamento salvo com sucesso." tipo="sucesso" />}
        {erroEnvio && <AvisoGlass mensagem={erroEnvio} tipo="erro" />}

        {/* ── Campos ── */}
        <GlassCard style={styles.formCard}>
          <Controller
            control={control}
            name="pacienteId"
            render={({ field }) => (
              <SeletorPesquisavel
                rotulo="Paciente"
                valor={field.value}
                onChange={field.onChange}
                erro={errors.pacienteId?.message}
                placeholder="Digite o nome do paciente"
                opcoes={pacientes.map((p) => ({
                  rotulo: p.nome,
                  valor: p.id,
                  detalhe: p.telefone,
                }))}
              />
            )}
          />

          <View style={styles.separador} />

          <Controller
            control={control}
            name="profissionalId"
            render={({ field }) => (
              <SeletorPesquisavel
                rotulo="Profissional"
                valor={field.value}
                onChange={field.onChange}
                erro={errors.profissionalId?.message}
                placeholder="Digite o nome do profissional"
                opcoes={profissionais.map((p) => ({
                  rotulo: p.nome,
                  valor: p.id,
                  detalhe: p.especialidade,
                }))}
              />
            )}
          />

          <View style={styles.separador} />

          <View style={styles.linha}>
            <Controller
              control={control}
              name="data"
              render={({ field }) => (
                <>
                  <CampoAcionavel
                    rotulo="Data"
                    placeholder="DD/MM/AAAA"
                    valor={formatarDataFormulario(field.value)}
                    erro={errors.data?.message}
                    style={styles.campoLinha}
                    onPress={() => setMostrandoData(true)}
                  />
                  {mostrandoData ? (
                    <DateTimePicker
                      value={criarDataPicker(field.value, horarioSelecionado)}
                      mode="date"
                      display="default"
                      onChange={(event: DateTimePickerEvent, dataEscolhida?: Date) => {
                        if (Platform.OS !== 'ios') {
                          setMostrandoData(false);
                        }
                        if (event.type === 'dismissed' || !dataEscolhida) {
                          return;
                        }
                        field.onChange(formatarDataISO(dataEscolhida));
                      }}
                    />
                  ) : null}
                </>
              )}
            />
            <Controller
              control={control}
              name="horario"
              render={({ field }) => (
                <>
                  <CampoAcionavel
                    rotulo="Horário"
                    placeholder="HH:mm"
                    valor={field.value}
                    erro={errors.horario?.message}
                    style={styles.campoLinha}
                    onPress={() => setMostrandoHorario(true)}
                  />
                  {mostrandoHorario ? (
                    <DateTimePicker
                      value={criarDataPicker(dataSelecionada, field.value)}
                      mode="time"
                      display="default"
                      is24Hour
                      onChange={(event: DateTimePickerEvent, horarioEscolhido?: Date) => {
                        if (Platform.OS !== 'ios') {
                          setMostrandoHorario(false);
                        }
                        if (event.type === 'dismissed' || !horarioEscolhido) {
                          return;
                        }
                        field.onChange(formatarHorarioFormulario(horarioEscolhido));
                      }}
                    />
                  ) : null}
                </>
              )}
            />
          </View>

          <View style={styles.separador} />

          <Controller
            control={control}
            name="tipoAtendimento"
            render={({ field }) => (
              <CampoGlass
                rotulo="Tipo de atendimento"
                placeholder="Consulta inicial, retorno, avaliação..."
                value={field.value}
                onChangeText={field.onChange}
                erro={errors.tipoAtendimento?.message}
              />
            )}
          />

          <View style={styles.separador} />

          <Controller
            control={control}
            name="lembreteMinutos"
            render={({ field }) => (
              <Seletor
                rotulo="Lembrete"
                valor={field.value}
                onChange={field.onChange}
                erro={errors.lembreteMinutos?.message}
                opcoes={opcoesLembreteAtendimento}
                horizontal
              />
            )}
          />

          {editando && (
            <>
              <View style={styles.separador} />
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Seletor
                    rotulo="Status"
                    valor={field.value}
                    onChange={field.onChange}
                    erro={errors.status?.message}
                    opcoes={opcoesStatus}
                    horizontal
                  />
                )}
              />
            </>
          )}
        </GlassCard>

        {/* ── Ações ── */}
        <View style={styles.acoes}>
          <BotaoGlass
            titulo="Salvar"
            carregando={enviando}
            onPress={handleSubmit(salvar)}
          />
          {editando && (
            <BotaoGlass
              titulo="Cancelar atendimento"
              variante="perigo"
              onPress={() => setConfirmandoCancelamento(true)}
            />
          )}
          <BotaoGlass
            titulo="Voltar"
            variante="fantasma"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>

      <ModalConfirmacao
        visivel={confirmandoCancelamento}
        titulo="Cancelar atendimento?"
        descricao="O atendimento será mantido na lista e no histórico com status Cancelado."
        textoConfirmar="Cancelar"
        onCancelar={() => setConfirmandoCancelamento(false)}
        onConfirmar={confirmarCancelamento}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  // ── Cabeçalho ──
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    zIndex: 40,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: RADIUS['2xl'],
  },
  headerTitulo: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: COLORS.onSurface,
  },
  headerSubtitulo: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(0,74,198,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },

  // ── Glass card base ──
  glassCard: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },

  // ── Card de formulário ──
  formCard: {
    borderRadius: RADIUS['2xl'],
    padding: 20,
    gap: 4,
  },
  separador: {
    height: 1,
    backgroundColor: 'rgba(195,198,215,0.4)',
    marginVertical: 10,
  },
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  campoLinha: {
    flex: 1,
  },

  // ── Campo de texto glass ──
  campoWrap: {
    gap: 6,
  },
  campoRotulo: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  campoInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  campoAcionavel: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  campoAcionavelTexto: {
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '600',
  },
  campoAcionavelPlaceholder: {
    color: COLORS.onSurfaceVariant,
  },
  campoInputErro: {
    borderColor: 'rgba(186,26,26,0.4)',
  },
  campoErro: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.error,
  },

  // ── Avisos ──
  avisoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
  },
  avisoSucesso: {
    backgroundColor: COLORS.successBg,
    borderColor: 'rgba(0,74,198,0.2)',
  },
  avisoErro: {
    backgroundColor: COLORS.errorBg,
    borderColor: 'rgba(186,26,26,0.2)',
  },
  avisoTexto: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  avisoSucessoTexto: { color: COLORS.primary },
  avisoErroTexto: { color: COLORS.error },

  // ── Ações ──
  acoes: {
    gap: 10,
  },

  // ── Botões ──
  botaoBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: RADIUS.xl,
  },
  botaoTextoBase: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  botaoPrimario: {
    backgroundColor: COLORS.glassButton,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoPrimarioTexto: { color: COLORS.onPrimary },
  botaoPerigo: {
    backgroundColor: 'rgba(186,26,26,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.2)',
  },
  botaoPerigoTexto: { color: COLORS.error },
  botaoFantasma: {
    backgroundColor: 'transparent',
  },
  botaoFantasmaTexto: { color: COLORS.onSurfaceVariant },
});
