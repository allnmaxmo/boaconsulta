import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ModalConfirmacao } from "@/src/componentes/interface/ModalConfirmacao";
import { Seletor } from "@/src/componentes/interface/Seletor";
import { SeletorPesquisavel } from "@/src/componentes/interface/SeletorPesquisavel";
import { useDadosClinica } from "@/src/contextos/DadosClinicaContexto";
import { opcoesLembreteAtendimento } from "@/src/servicos/notificacoes";
import { StatusAtendimento } from "@/src/tipos/dominio";
import {
  dataISOHoje,
  montarDataHora,
  obterData,
  obterHorario,
} from "@/src/utilitarios/data";
import {
  AtendimentoEdicaoFormulario,
  atendimentoEdicaoSchema,
} from "@/src/validacoes/formularios";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#004ac6",
  primaryDeep: "#0033a0",
  onPrimary: "#ffffff",
  onSurface: "#131b2e",
  onSurfaceVariant: "#5b5e70",
  surface: "#f3f1fb",
  error: "#ba1a1a",
  successBg: "rgba(0, 74, 198, 0.08)",
  errorBg: "rgba(186, 26, 26, 0.08)",
  glassButton: "rgba(0, 74, 198, 0.92)",
  glassOverlay: "rgba(255, 255, 255, 0.55)",
  glassBorder: "rgba(255, 255, 255, 0.65)",
  inputBg: "rgba(255, 255, 255, 0.72)",
  chipBg: "rgba(0, 74, 198, 0.10)",
};

const RADIUS = {
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

type AgendamentoFormularioProps = {
  atendimentoId?: string;
};

const opcoesStatus: { rotulo: string; valor: StatusAtendimento }[] = [
  { rotulo: "Agendado", valor: "agendado" },
  { rotulo: "Realizado", valor: "realizado" },
  { rotulo: "Cancelado", valor: "cancelado" },
  { rotulo: "Falta", valor: "falta" },
];

function formatarDataISO(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarHorarioFormulario(data: Date) {
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  return `${hora}:${minuto}`;
}

// Exibição curta no campo: "19/06/2026"
function formatarDataCurta(data: string) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Exibição amigável no resumo: "sexta-feira, 19 de junho de 2026"
function formatarDataExtensa(data: string) {
  if (!data) return "";
  const dataObj = new Date(`${data}T00:00:00`);
  const texto = dataObj.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function criarDataPicker(data: string, horario: string) {
  const dataBase = data || dataISOHoje();
  const horarioBase = horario || "12:00";
  return new Date(`${dataBase}T${horarioBase}:00`);
}

function disparoHaptico() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.glassCardWrap, style]}>
      <BlurView
        intensity={50}
        tint="light"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glassCardOverlay} />
      <View style={styles.glassCardContent}>{children}</View>
    </View>
  );
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
  keyboardType?: "default" | "phone-pad" | "numeric";
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
        keyboardType={keyboardType ?? "default"}
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
  icone,
  onPress,
  style,
}: {
  rotulo: string;
  valor: string;
  placeholder: string;
  erro?: string;
  icone: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  style?: object;
}) {
  return (
    <View style={[styles.campoWrap, style]}>
      <Text style={styles.campoRotulo}>{rotulo}</Text>
      <Pressable
        onPress={() => {
          disparoHaptico();
          onPress();
        }}
        style={({ pressed }) => [
          styles.campoInput,
          styles.campoAcionavel,
          erro && styles.campoInputErro,
          pressed && { opacity: 0.76, transform: [{ scale: 0.99 }] },
        ]}
      >
        <View style={styles.campoAcionavelEsquerda}>
          <View style={styles.campoAcionavelIconeWrap}>
            <MaterialIcons name={icone} size={16} color={COLORS.primary} />
          </View>
          <Text
            style={[
              styles.campoAcionavelTexto,
              !valor && styles.campoAcionavelPlaceholder,
            ]}
          >
            {valor || placeholder}
          </Text>
        </View>
        <MaterialIcons
          name="expand-more"
          size={20}
          color={COLORS.onSurfaceVariant}
        />
      </Pressable>
      {erro ? <Text style={styles.campoErro}>{erro}</Text> : null}
    </View>
  );
}

function BotaoGlass({
  titulo,
  variante = "primario",
  carregando,
  onPress,
  style,
}: {
  titulo: string;
  variante?: "primario" | "perigo" | "fantasma";
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
      onPress={() => {
        disparoHaptico();
        onPress();
      }}
      disabled={carregando}
      style={({ pressed }) => [
        styles.botaoBase,
        estilosFundo[variante],
        style,
        (pressed || carregando) && {
          opacity: 0.72,
          transform: [{ scale: 0.97 }],
        },
      ]}
    >
      <Text style={[styles.botaoTextoBase, estilosTexto[variante]]}>
        {carregando ? "Salvando..." : titulo}
      </Text>
    </Pressable>
  );
}

function AvisoGlass({
  mensagem,
  tipo = "sucesso",
}: {
  mensagem: string;
  tipo?: "sucesso" | "erro";
}) {
  return (
    <View
      style={[
        styles.avisoWrap,
        tipo === "erro" ? styles.avisoErro : styles.avisoSucesso,
      ]}
    >
      <MaterialIcons
        name={tipo === "erro" ? "error-outline" : "check-circle-outline"}
        size={18}
        color={tipo === "erro" ? COLORS.error : COLORS.primary}
      />
      <Text
        style={[
          styles.avisoTexto,
          tipo === "erro" ? styles.avisoErroTexto : styles.avisoSucessoTexto,
        ]}
      >
        {mensagem}
      </Text>
    </View>
  );
}

// Resumo visual de data + horário escolhidos
function ResumoAgendamento({
  data,
  horario,
}: {
  data: string;
  horario: string;
}) {
  if (!data || !horario) return null;
  return (
    <View style={styles.resumoWrap}>
      <View style={styles.resumoIconeWrap}>
        <MaterialIcons
          name="event-available"
          size={18}
          color={COLORS.onPrimary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.resumoTitulo}>{formatarDataExtensa(data)}</Text>
        <Text style={styles.resumoSubtitulo}>às {horario}</Text>
      </View>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export function AgendamentoFormulario({
  atendimentoId,
}: AgendamentoFormularioProps) {
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

  const atendimento = atendimentoId
    ? obterAtendimento(atendimentoId)
    : undefined;
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<AtendimentoEdicaoFormulario>({
    resolver: zodResolver(atendimentoEdicaoSchema),
    defaultValues: {
      pacienteId: atendimento?.pacienteId ?? "",
      profissionalId: atendimento?.profissionalId ?? "",
      data: atendimento ? obterData(atendimento.dataHora) : dataISOHoje(),
      horario: atendimento ? obterHorario(atendimento.dataHora) : "",
      tipoAtendimento: atendimento?.tipoAtendimento ?? "",
      lembreteMinutos: String(atendimento?.lembreteMinutos ?? 30),
      status: atendimento?.status ?? "agendado",
    },
  });
  const dataSelecionada = watch("data");
  const horarioSelecionado = watch("horario");

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
      setErroEnvio(
        error instanceof Error ? error.message : "Erro ao salvar agendamento.",
      );
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
        setErroEnvio(
          error instanceof Error
            ? error.message
            : "Erro ao cancelar atendimento.",
        );
      }
    }
  }

  function aoMudarData(event: DateTimePickerEvent, dataEscolhida?: Date) {
    // No Android o diálogo é nativo e fecha sozinho; escondemos o controlador
    // imediatamente. No iOS ele fica embutido (spinner) até o usuário confirmar.
    if (Platform.OS === "android") {
      setMostrandoData(false);
    }
    if (event.type === "dismissed" || !dataEscolhida) {
      return;
    }
    setValue("data", formatarDataISO(dataEscolhida), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function aoMudarHorario(event: DateTimePickerEvent, horarioEscolhido?: Date) {
    if (Platform.OS === "android") {
      setMostrandoHorario(false);
    }
    if (event.type === "dismissed" || !horarioEscolhido) {
      return;
    }
    setValue("horario", formatarHorarioFormulario(horarioEscolhido), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={["rgba(0,74,198,0.16)", "rgba(243,241,251,0)"]}
        style={styles.gradienteTopo}
        pointerEvents="none"
      />

      {/* ── Cabeçalho glass ── */}
      <View style={styles.headerWrap}>
        <GlassCard style={styles.headerCard}>
          <View>
            <Text style={styles.headerTitulo}>
              {editando ? "Editar Agendamento" : "Novo Agendamento"}
            </Text>
            <Text style={styles.headerSubtitulo}>
              {editando
                ? "Atualize dados e status do atendimento"
                : "Cadastre um atendimento"}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              disparoHaptico();
              router.back();
            }}
            style={({ pressed }) => [
              styles.botaoVoltar,
              pressed && { opacity: 0.7 },
            ]}
          >
            <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>
        </GlassCard>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avisos ── */}
        {sucesso && (
          <AvisoGlass
            mensagem="Agendamento salvo com sucesso."
            tipo="sucesso"
          />
        )}
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

          <Text style={styles.secaoRotulo}>Data e horário</Text>

          <View style={styles.linha}>
            <Controller
              control={control}
              name="data"
              render={({ field }) => (
                <CampoAcionavel
                  rotulo="Data"
                  placeholder="Selecione a data"
                  valor={formatarDataCurta(field.value)}
                  erro={errors.data?.message}
                  icone="calendar-today"
                  style={styles.campoLinha}
                  onPress={() => setMostrandoData(true)}
                />
              )}
            />
            <Controller
              control={control}
              name="horario"
              render={({ field }) => (
                <CampoAcionavel
                  rotulo="Horário"
                  placeholder="Selecione"
                  valor={field.value}
                  erro={errors.horario?.message}
                  icone="schedule"
                  style={styles.campoLinha}
                  onPress={() => setMostrandoHorario(true)}
                />
              )}
            />
          </View>

          <ResumoAgendamento
            data={dataSelecionada}
            horario={horarioSelecionado}
          />

          {/* iOS: spinner embutido com cartão próprio.
              Android: o componente abaixo não ocupa espaço visual —
              ele dispara o diálogo nativo do sistema sozinho. */}
          {mostrandoData &&
            (Platform.OS === "ios" ? (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={criarDataPicker(dataSelecionada, horarioSelecionado)}
                  mode="date"
                  display="spinner"
                  locale="pt-BR"
                  themeVariant="light"
                  textColor={COLORS.onSurface}
                  onChange={aoMudarData}
                  style={styles.pickerSpinner}
                />
                <Pressable
                  onPress={() => setMostrandoData(false)}
                  style={({ pressed }) => [
                    styles.botaoPicker,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.botaoPickerTexto}>Confirmar data</Text>
                </Pressable>
              </View>
            ) : (
              <DateTimePicker
                value={criarDataPicker(dataSelecionada, horarioSelecionado)}
                mode="date"
                display="default"
                onChange={aoMudarData}
              />
            ))}

          {mostrandoHorario &&
            (Platform.OS === "ios" ? (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={criarDataPicker(dataSelecionada, horarioSelecionado)}
                  mode="time"
                  display="spinner"
                  is24Hour
                  locale="pt-BR"
                  themeVariant="light"
                  textColor={COLORS.onSurface}
                  onChange={aoMudarHorario}
                  style={styles.pickerSpinner}
                />
                <Pressable
                  onPress={() => setMostrandoHorario(false)}
                  style={({ pressed }) => [
                    styles.botaoPicker,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.botaoPickerTexto}>Confirmar horário</Text>
                </Pressable>
              </View>
            ) : (
              <DateTimePicker
                value={criarDataPicker(dataSelecionada, horarioSelecionado)}
                mode="time"
                display="default"
                is24Hour
                onChange={aoMudarHorario}
              />
            ))}

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
  gradienteTopo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },

  // ── Cabeçalho ──
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    zIndex: 40,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitulo: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: COLORS.onSurface,
  },
  headerSubtitulo: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.lg,
    backgroundColor: "rgba(0,74,198,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },

  // ── Glass card base (com blur real) ──
  glassCardWrap: {
    borderRadius: RADIUS["2xl"],
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 3,
    overflow: "hidden",
  },
  glassCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.glassOverlay,
  },
  glassCardContent: {
    padding: 20,
  },

  // ── Card de formulário ──
  formCard: {
    gap: 4,
  },
  secaoRotulo: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: COLORS.primary,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  separador: {
    height: 1,
    backgroundColor: "rgba(195,198,215,0.4)",
    marginVertical: 10,
  },
  linha: {
    flexDirection: "row",
    gap: 12,
  },
  campoLinha: {
    flex: 1,
  },

  // ── Resumo data + horário ──
  resumoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.chipBg,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
  },
  resumoIconeWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  resumoTitulo: {
    fontSize: 13.5,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  resumoSubtitulo: {
    fontSize: 12.5,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },

  // ── Picker (somente iOS embute spinner) ──
  pickerWrap: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.inputBg,
    padding: 12,
    gap: 10,
    marginTop: 12,
  },
  pickerSpinner: {
    alignSelf: "center",
  },
  botaoPicker: {
    alignSelf: "flex-end",
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.glassButton,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  botaoPickerTexto: {
    color: COLORS.onPrimary,
    fontSize: 13,
    fontWeight: "800",
  },

  // ── Campo de texto glass ──
  campoWrap: {
    gap: 6,
  },
  campoRotulo: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: COLORS.onSurfaceVariant,
    textTransform: "uppercase",
  },
  campoInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.onSurface,
  },
  campoAcionavel: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  campoAcionavelEsquerda: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  campoAcionavelIconeWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.chipBg,
    alignItems: "center",
    justifyContent: "center",
  },
  campoAcionavelTexto: {
    color: COLORS.onSurface,
    fontSize: 14.5,
    fontWeight: "600",
    flexShrink: 1,
  },
  campoAcionavelPlaceholder: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "500",
  },
  campoInputErro: {
    borderColor: "rgba(186,26,26,0.4)",
  },
  campoErro: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.error,
  },

  // ── Avisos ──
  avisoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
  },
  avisoSucesso: {
    backgroundColor: COLORS.successBg,
    borderColor: "rgba(0,74,198,0.2)",
  },
  avisoErro: {
    backgroundColor: COLORS.errorBg,
    borderColor: "rgba(186,26,26,0.2)",
  },
  avisoTexto: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  avisoSucessoTexto: { color: COLORS.primary },
  avisoErroTexto: { color: COLORS.error },

  // ── Ações ──
  acoes: {
    gap: 10,
  },

  // ── Botões ──
  botaoBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: RADIUS.xl,
  },
  botaoTextoBase: {
    fontSize: 14,
    fontWeight: "700",
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
    backgroundColor: "rgba(186,26,26,0.08)",
    borderWidth: 1,
    borderColor: "rgba(186,26,26,0.2)",
  },
  botaoPerigoTexto: { color: COLORS.error },
  botaoFantasma: {
    backgroundColor: "transparent",
  },
  botaoFantasmaTexto: { color: COLORS.onSurfaceVariant },
});
