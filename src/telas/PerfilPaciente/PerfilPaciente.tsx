import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ItemHistoricoAtendimento } from '@/src/componentes/historico/ItemHistoricoAtendimento';
import { EstadoVazio } from '@/src/componentes/interface/EstadoVazio';
import { ModalConfirmacao } from '@/src/componentes/interface/ModalConfirmacao';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';
import { rotaApp } from '@/src/utilitarios/rotas';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#004ac6',
  primaryFixed: '#dbe1ff',
  secondary: '#712ae2',
  onPrimary: '#ffffff',
  onSurface: '#131b2e',
  onSurfaceVariant: '#434655',
  surface: '#faf8ff',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  glassButton: 'rgba(0, 74, 198, 0.88)',
  glassButtonSecondary: 'rgba(255,255,255,0.55)',
  glassButtonDanger: 'rgba(186, 26, 26, 0.10)',
  glass: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  avatarBg: 'rgba(0, 74, 198, 0.12)',
};

const RADIUS = {
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

function BotaoGlass({
  titulo,
  icone,
  variante = 'primario',
  onPress,
  style,
}: {
  titulo: string;
  icone?: keyof typeof MaterialIcons.glyphMap;
  variante?: 'primario' | 'secundario' | 'perigo' | 'fantasma';
  onPress: () => void;
  style?: object;
}) {
  const estilosFundo: Record<string, object> = {
    primario: styles.botaoPrimario,
    secundario: styles.botaoSecundario,
    perigo: styles.botaoPerigo,
    fantasma: styles.botaoFantasma,
  };
  const estilosTexto: Record<string, object> = {
    primario: styles.botaoPrimarioTexto,
    secundario: styles.botaoSecundarioTexto,
    perigo: styles.botaoPerigoTexto,
    fantasma: styles.botaoFantasmaTexto,
  };
  const coresIcone: Record<string, string> = {
    primario: COLORS.onPrimary,
    secundario: COLORS.primary,
    perigo: COLORS.error,
    fantasma: COLORS.onSurfaceVariant,
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.botaoBase,
        estilosFundo[variante],
        style,
        pressed && { opacity: 0.78, transform: [{ scale: 0.97 }] },
      ]}
    >
      {icone && (
        <MaterialIcons name={icone} size={18} color={coresIcone[variante]} />
      )}
      <Text style={[styles.botaoTextoBase, estilosTexto[variante]]}>{titulo}</Text>
    </Pressable>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export function PerfilPaciente() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { obterPaciente, listarHistoricoDoPaciente, excluirPaciente } = useDadosClinica();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const paciente = obterPaciente(id);
  const historico = listarHistoricoDoPaciente(id);

  // ── Paciente não encontrado ──
  if (!paciente) {
    return (
      <View style={[styles.tela, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.headerWrap}>
          <GlassCard style={styles.headerCard}>
            <View>
              <Text style={styles.headerTitulo}>Paciente</Text>
              <Text style={styles.headerSubtitulo}>Cadastro não encontrado</Text>
            </View>
          </GlassCard>
        </View>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}>
          <EstadoVazio
            titulo="Paciente não encontrado"
            descricao="Este cadastro pode ter sido excluído do banco."
            icone="person-off"
          />
          <BotaoGlass
            titulo="Voltar para pacientes"
            onPress={() => router.replace(rotaApp('/pacientes'))}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Cabeçalho glass ── */}
      <View style={styles.headerWrap}>
        <GlassCard style={styles.headerCard}>
          <View>
            <Text style={styles.headerTitulo}>Perfil do Paciente</Text>
            <Text style={styles.headerSubtitulo}>Dados e histórico de atendimentos</Text>
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
      >
        {/* ── Cartão de perfil ── */}
        <GlassCard style={styles.cartaoPerfil}>
          <View style={styles.avatar}>
            <Text style={styles.inicial}>{paciente.nome.charAt(0)}</Text>
          </View>
          <View style={styles.infoPerfil}>
            <Text style={styles.nome}>{paciente.nome}</Text>
            <Text style={styles.telefone}>{paciente.telefone}</Text>
          </View>
          <Pressable
            onPress={() =>
              router.push(
                rotaApp({ pathname: '/pacientes/[id]/editar', params: { id: paciente.id } }),
              )
            }
            style={({ pressed }) => [styles.botaoIcone, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="edit" size={20} color={COLORS.primary} />
          </Pressable>
        </GlassCard>

        {/* ── Ações ── */}
        <View style={styles.acoes}>
          <BotaoGlass
            titulo="Editar paciente"
            variante="secundario"
            icone="edit"
            onPress={() =>
              router.push(
                rotaApp({ pathname: '/pacientes/[id]/editar', params: { id: paciente.id } }),
              )
            }
            style={styles.acao}
          />
          <BotaoGlass
            titulo="Excluir"
            variante="perigo"
            icone="delete-outline"
            onPress={() => setConfirmandoExclusao(true)}
            style={styles.acao}
          />
        </View>

        {/* ── Histórico ── */}
        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Histórico de Atendimentos</Text>
          {historico.length === 0 ? (
            <EstadoVazio
              titulo="Histórico vazio"
              descricao="Atendimentos concluídos, agendados e cancelados aparecerão aqui."
              icone="history"
            />
          ) : (
            <View style={styles.lista}>
              {historico.map((atendimento) => (
                <ItemHistoricoAtendimento key={atendimento.id} atendimento={atendimento} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ModalConfirmacao
        visivel={confirmandoExclusao}
        titulo="Excluir paciente?"
        descricao={`O cadastro de ${paciente.nome} será removido do banco.`}
        textoConfirmar="Excluir"
        onCancelar={() => setConfirmandoExclusao(false)}
        onConfirmar={async () => {
          await excluirPaciente(paciente.id);
          setConfirmandoExclusao(false);
          router.replace(rotaApp('/pacientes'));
        }}
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
    backgroundColor: COLORS.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
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

  // ── Cartão de perfil ──
  cartaoPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: RADIUS['2xl'],
    padding: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,74,198,0.15)',
  },
  inicial: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: '900',
  },
  infoPerfil: {
    flex: 1,
    gap: 4,
  },
  nome: {
    color: COLORS.onSurface,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  telefone: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
  },
  botaoIcone: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Ações ──
  acoes: {
    flexDirection: 'row',
    gap: 10,
  },
  acao: {
    flex: 1,
  },

  // ── Seção histórico ──
  secao: {
    gap: 12,
  },
  tituloSecao: {
    color: COLORS.onSurface,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  lista: {
    gap: 10,
  },

  // ── Botões ──
  botaoBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
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
  botaoSecundario: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: 'rgba(0,74,198,0.25)',
  },
  botaoSecundarioTexto: { color: COLORS.primary },
  botaoPerigo: {
    backgroundColor: COLORS.glassButtonDanger,
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.2)',
  },
  botaoPerigoTexto: { color: COLORS.error },
  botaoFantasma: {
    backgroundColor: 'transparent',
  },
  botaoFantasmaTexto: { color: COLORS.onSurfaceVariant },
});
