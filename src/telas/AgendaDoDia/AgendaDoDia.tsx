import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartaoAtendimento } from '@/src/componentes/agenda/CartaoAtendimento';
import { EstadoCarregamento } from '@/src/componentes/interface/EstadoCarregamento';
import { EstadoVazio } from '@/src/componentes/interface/EstadoVazio';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';
import { dataISOHoje, formatarDataLonga, obterData } from '@/src/utilitarios/data';
import { rotaApp } from '@/src/utilitarios/rotas';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#004ac6',
  primaryContainer: '#2563eb',
  primaryFixed: '#dbe1ff',
  primaryFixedDim: '#b4c5ff',
  secondary: '#712ae2',
  onPrimary: '#ffffff',
  onSurface: '#131b2e',
  onSurfaceVariant: '#434655',
  surface: '#faf8ff',
  surfaceContainerHigh: '#e2e7ff',
  outlineVariant: '#c3c6d7',
  error: '#ba1a1a',
  gradientStart: '#dbe1ff',
  gradientEnd: '#faf8ff',
  glass: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  glassButton: 'rgba(0, 74, 198, 0.88)',
};

const RADIUS = {
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Cartão glassmorphism envolve o conteúdo */
function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

type ModoAgenda = 'dia' | 'semana';

function formatarDataISO(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function obterPeriodoSemana(dataBase: Date) {
  const inicio = new Date(dataBase);
  const diaSemana = inicio.getDay();
  const deslocamento = diaSemana === 0 ? -6 : 1 - diaSemana;
  inicio.setDate(inicio.getDate() + deslocamento);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  fim.setHours(23, 59, 59, 999);

  return {
    inicio,
    fim,
    inicioISO: formatarDataISO(inicio),
    fimISO: formatarDataISO(fim),
  };
}

function calcularTaxaComparecimento(atendimentos: { status: string }[]) {
  const concluidos = atendimentos.filter((atendimento) =>
    ['realizado', 'falta'].includes(atendimento.status),
  );

  if (concluidos.length === 0) {
    return null;
  }

  const realizados = concluidos.filter((atendimento) => atendimento.status === 'realizado');
  return Math.round((realizados.length / concluidos.length) * 100);
}

/** Chip de filtro individual */
function FiltroChip({
  rotulo,
  detalhe,
  ativo,
  onPress,
}: {
  rotulo: string;
  detalhe?: string;
  ativo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filtroChip,
        ativo ? styles.filtroChipAtivo : styles.filtroChipInativo,
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={[styles.filtroChipRotulo, ativo ? styles.filtroChipRoduloAtivo : styles.filtroChipRoduloInativo]}>
        {rotulo}
      </Text>
      {detalhe && !ativo && (
        <Text style={styles.filtroChipDetalhe}>{detalhe.toUpperCase()}</Text>
      )}
    </Pressable>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export function AgendaDoDia() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    atendimentos: todosAtendimentos,
    profissionais,
    carregando,
    erro,
    perfilUsuario,
  } = useDadosClinica();
  const [profissionalFiltro, setProfissionalFiltro] = useState('todos');
  const [modoAgenda, setModoAgenda] = useState<ModoAgenda>('dia');
  const dataHoje = dataISOHoje();
  const periodoSemana = obterPeriodoSemana(new Date());
  const cargo = perfilUsuario?.cargo;
  const podeGerenciarClinica = cargo === 'administrador' || cargo === 'atendente';
  const podeVerSemana = podeGerenciarClinica || cargo === 'profissional';
  const profissionalLogado = profissionais.find(
    (profissional) => profissional.usuarioId === perfilUsuario?.id,
  );
  const profissionalSelecionadoId = podeGerenciarClinica
    ? profissionalFiltro === 'todos'
      ? undefined
      : profissionalFiltro
    : profissionalLogado?.id;

  const atendimentosBase = useMemo(() => {
    if (podeGerenciarClinica) {
      return profissionalSelecionadoId
        ? todosAtendimentos.filter((atendimento) => atendimento.profissionalId === profissionalSelecionadoId)
        : todosAtendimentos;
    }

    if (cargo === 'paciente') {
      return todosAtendimentos.filter(
        (atendimento) => atendimento.paciente?.usuarioId === perfilUsuario?.id,
      );
    }

    return todosAtendimentos.filter(
      (atendimento) => atendimento.profissionalId === profissionalLogado?.id,
    );
  }, [
    cargo,
    perfilUsuario?.id,
    podeGerenciarClinica,
    profissionalLogado?.id,
    profissionalSelecionadoId,
    todosAtendimentos,
  ]);

  const atendimentos = useMemo(() => {
    const lista =
      modoAgenda === 'dia' || !podeVerSemana
        ? atendimentosBase.filter((atendimento) => obterData(atendimento.dataHora) === dataHoje)
        : atendimentosBase.filter((atendimento) => {
            const dataAtendimento = obterData(atendimento.dataHora);
            return dataAtendimento >= periodoSemana.inicioISO && dataAtendimento <= periodoSemana.fimISO;
          });

    return [...lista].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  }, [
    atendimentosBase,
    dataHoje,
    modoAgenda,
    periodoSemana.fimISO,
    periodoSemana.inicioISO,
    podeVerSemana,
  ]);

  const atendimentosParaTaxa = useMemo(() => {
    if (cargo === 'profissional' || profissionalSelecionadoId) {
      return todosAtendimentos.filter(
        (atendimento) => atendimento.profissionalId === profissionalSelecionadoId,
      );
    }

    if (podeGerenciarClinica) {
      return todosAtendimentos;
    }

    return [];
  }, [cargo, podeGerenciarClinica, profissionalSelecionadoId, todosAtendimentos]);
  const taxaComparecimento = calcularTaxaComparecimento(atendimentosParaTaxa);

  const opcoesProfissionais = useMemo<{ rotulo: string; valor: string; detalhe?: string }[]>(
    () => [
      { rotulo: 'Todos', valor: 'todos' },
      ...profissionais.map((p) => ({
        rotulo: p.nome,
        valor: p.id,
        detalhe: p.especialidade,
      })),
    ],
    [profissionais],
  );

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Cabeçalho glass ── */}
      <View style={styles.headerWrap}>
        <GlassCard style={styles.headerCard}>
          <View>
            <Text style={styles.headerTitulo}>
              {cargo === 'paciente'
                ? 'Minhas consultas'
                : cargo === 'profissional'
                  ? 'Minha agenda'
                  : 'BoaConsulta'}
            </Text>
            <Text style={styles.headerSubtitulo}>
              {podeGerenciarClinica
                ? formatarDataLonga(new Date())
                : perfilUsuario?.nomeCompleto ?? formatarDataLonga(new Date())}
            </Text>
          </View>
          {podeGerenciarClinica ? (
            <Pressable
              onPress={() => router.push(rotaApp('/agendamento/novo'))}
              style={({ pressed }) => [styles.headerBotao, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
            >
              <Text style={styles.headerBotaoTexto}>+ Novo</Text>
            </Pressable>
          ) : null}
        </GlassCard>
      </View>

      {/* ── Conteúdo rolável ── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Filtros ── */}
        {podeGerenciarClinica ? (
          <View style={styles.secao}>
            <Text style={styles.secaoLabel}>FILTRAR POR PROFISSIONAL</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtroScroll}
            >
              {opcoesProfissionais.map((opcao) => (
                <FiltroChip
                  key={opcao.valor}
                  rotulo={opcao.rotulo}
                  detalhe={opcao.detalhe}
                  ativo={profissionalFiltro === opcao.valor}
                  onPress={() => setProfissionalFiltro(opcao.valor)}
                />
              ))}
            </ScrollView>
          </View>
        ) : (
          <GlassCard style={styles.resumoCard}>
            <Text style={styles.resumoValor}>{atendimentos.length}</Text>
            <Text style={styles.resumoRotulo}>
              {cargo === 'paciente' ? 'ATENDIMENTOS VINCULADOS A VOCÊ' : 'ATENDIMENTOS NA SUA AGENDA'}
            </Text>
          </GlassCard>
        )}

        {podeVerSemana ? (
          <View style={styles.secao}>
            <Text style={styles.secaoLabel}>VISÃO DA AGENDA</Text>
            <View style={styles.segmento}>
              <Pressable
                onPress={() => setModoAgenda('dia')}
                style={[styles.segmentoOpcao, modoAgenda === 'dia' && styles.segmentoOpcaoAtiva]}
              >
                <Text
                  style={[
                    styles.segmentoTexto,
                    modoAgenda === 'dia' && styles.segmentoTextoAtivo,
                  ]}
                >
                  Hoje
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setModoAgenda('semana')}
                style={[styles.segmentoOpcao, modoAgenda === 'semana' && styles.segmentoOpcaoAtiva]}
              >
                <Text
                  style={[
                    styles.segmentoTexto,
                    modoAgenda === 'semana' && styles.segmentoTextoAtivo,
                  ]}
                >
                  Semana
                </Text>
              </Pressable>
            </View>
            {modoAgenda === 'semana' ? (
              <Text style={styles.periodoTexto}>
                {formatarDataLonga(periodoSemana.inicio)} até {formatarDataLonga(periodoSemana.fim)}
              </Text>
            ) : null}
          </View>
        ) : null}

        {podeVerSemana ? (
          <GlassCard style={styles.metricasCard}>
            <View style={styles.metricaItem}>
              <Text style={styles.metricaValor}>
                {taxaComparecimento === null ? '—' : `${taxaComparecimento}%`}
              </Text>
              <Text style={styles.metricaRotulo}>TAXA DE COMPARECIMENTO</Text>
            </View>
            <View style={styles.metricaDivisor} />
            <View style={styles.metricaItem}>
              <Text style={styles.metricaValor}>{atendimentosParaTaxa.length}</Text>
              <Text style={styles.metricaRotulo}>ATENDIMENTOS NO HISTÓRICO</Text>
            </View>
          </GlassCard>
        ) : null}

        {/* ── Lista de atendimentos ── */}
        <View style={styles.secao}>
          {carregando ? (
            <EstadoCarregamento />
          ) : erro ? (
            <EstadoVazio
              titulo="Não foi possível carregar a agenda"
              descricao={erro}
              icone="cloud-off"
            />
          ) : atendimentos.length === 0 ? (
            <EstadoVazio
              titulo={
                podeGerenciarClinica
                  ? profissionalFiltro === 'todos'
                    ? 'Nenhum atendimento para hoje'
                    : 'Nenhum atendimento neste filtro'
                  : 'Nenhum atendimento encontrado'
              }
              descricao={
                podeGerenciarClinica
                  ? 'Quando novos agendamentos forem criados, eles aparecerão organizados por horário.'
                  : 'Quando houver atendimentos vinculados ao seu cadastro, eles aparecerão aqui.'
              }
            />
          ) : (
            <View style={styles.lista}>
              {atendimentos.map((atendimento, indice) => (
                <CartaoAtendimento
                  key={atendimento.id}
                  atendimento={atendimento}
                  indice={indice}
                  mostrarData={modoAgenda === 'semana' && podeVerSemana}
                  onPress={
                    podeGerenciarClinica
                      ? () =>
                          router.push(
                            rotaApp({ pathname: '/agendamento/[id]', params: { id: atendimento.id } }),
                          )
                      : undefined
                  }
                  onPacientePress={
                    podeGerenciarClinica && atendimento.paciente
                      ? () =>
                          router.push(
                            rotaApp({
                              pathname: '/pacientes/[id]',
                              params: { id: atendimento.pacienteId },
                            }),
                          )
                      : undefined
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Botão de ação flutuante ── */}
      {podeGerenciarClinica ? (
        <Pressable
          onPress={() => router.push(rotaApp('/agendamento/novo'))}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + 88 },
            pressed && { opacity: 0.8, transform: [{ scale: 0.93 }] },
          ]}
          accessibilityLabel="Criar novo agendamento"
          accessibilityRole="button"
        >
          <Text style={styles.fabIcone}>＋</Text>
        </Pressable>
      ) : null}
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
  headerBotao: {
    backgroundColor: COLORS.glassButton,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: RADIUS.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  headerBotaoTexto: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 24,
  },

  // ── Seções ──
  secao: {
    gap: 12,
  },
  secaoLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: COLORS.onSurfaceVariant,
    paddingHorizontal: 2,
  },

  // ── Filtros ──
  filtroScroll: {
    gap: 10,
    paddingRight: 4,
  },
  filtroChip: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: RADIUS.xl,
    alignItems: 'flex-start',
  },
  filtroChipAtivo: {
    backgroundColor: 'rgba(0, 74, 198, 0.92)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  filtroChipInativo: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  filtroChipRotulo: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  filtroChipRoduloAtivo: {
    color: COLORS.onPrimary,
  },
  filtroChipRoduloInativo: {
    color: COLORS.onSurface,
  },
  filtroChipDetalhe: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  segmento: {
    flexDirection: 'row',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.xl,
    padding: 4,
    gap: 4,
  },
  segmentoOpcao: {
    flex: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: 11,
    alignItems: 'center',
  },
  segmentoOpcaoAtiva: {
    backgroundColor: COLORS.glassButton,
  },
  segmentoTexto: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '800',
  },
  segmentoTextoAtivo: {
    color: COLORS.onPrimary,
  },
  periodoTexto: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 2,
  },

  // ── Lista ──
  lista: {
    gap: 14,
  },
  resumoCard: {
    borderRadius: RADIUS['2xl'],
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  resumoValor: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '800',
  },
  resumoRotulo: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  metricasCard: {
    borderRadius: RADIUS['2xl'],
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  metricaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricaValor: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  metricaRotulo: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  metricaDivisor: {
    width: 1,
    height: 44,
    backgroundColor: COLORS.outlineVariant,
    opacity: 0.55,
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

  // ── FAB ──
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.glassButton,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 50,
  },
  fabIcone: {
    color: COLORS.onPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
});
