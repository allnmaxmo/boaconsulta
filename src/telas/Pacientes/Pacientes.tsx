import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModalConfirmacao } from '@/src/componentes/interface/ModalConfirmacao';
import { EstadoCarregamento } from '@/src/componentes/interface/EstadoCarregamento';
import { EstadoVazio } from '@/src/componentes/interface/EstadoVazio';
import { CartaoPaciente } from '@/src/componentes/pacientes/CartaoPaciente';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';
import { Paciente } from '@/src/tipos/dominio';
import { rotaApp } from '@/src/utilitarios/rotas';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#004ac6',
  onPrimary: '#ffffff',
  onSurface: '#131b2e',
  onSurfaceVariant: '#434655',
  surface: '#faf8ff',
  glassButton: 'rgba(0, 74, 198, 0.88)',
  glass: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  inputBackground: 'rgba(255, 255, 255, 0.45)',
};

const RADIUS = {
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

function CampoBusca({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View style={styles.campoBuscaWrap}>
      <Text style={styles.campoBuscaIcone}>🔍</Text>
      <TextInput
        style={styles.campoBuscaInput}
        placeholder="Nome ou telefone"
        placeholderTextColor={COLORS.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        clearButtonMode="while-editing"
        keyboardType="default"
      />
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export function Pacientes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pacientes, excluirPaciente, carregando, erro } = useDadosClinica();
  const [busca, setBusca] = useState('');
  const [pacienteParaExcluir, setPacienteParaExcluir] = useState<Paciente | null>(null);

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    if (!termo) return pacientes;
    return pacientes.filter(
      (p) =>
        p.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
        p.telefone.toLocaleLowerCase('pt-BR').includes(termo),
    );
  }, [busca, pacientes]);

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Cabeçalho glass ── */}
      <View style={styles.headerWrap}>
        <GlassCard style={styles.headerCard}>
          <View style={styles.headerTextos}>
            <Text style={styles.headerTitulo}>Pacientes</Text>
            <Text style={styles.headerSubtitulo}>Cadastro e perfil dos pacientes</Text>
          </View>
          <Pressable
            onPress={() => router.push(rotaApp('/pacientes/novo'))}
            style={({ pressed }) => [
              styles.headerBotao,
              pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
            ]}
          >
            <Text style={styles.headerBotaoTexto}>+ Novo</Text>
          </Pressable>
        </GlassCard>
      </View>

      {/* ── Conteúdo rolável ── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Campo de busca ── */}
        <CampoBusca value={busca} onChangeText={setBusca} />

        {/* ── Lista ── */}
        {carregando ? (
          <EstadoCarregamento />
        ) : erro ? (
          <EstadoVazio
            titulo="Não foi possível carregar pacientes"
            descricao={erro}
            icone="cloud-off"
          />
        ) : pacientesFiltrados.length === 0 ? (
          <EstadoVazio
            titulo={busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            descricao="Cadastre pacientes para consultar dados e histórico de atendimentos."
            icone="person-search"
          />
        ) : (
          <View style={styles.lista}>
            {pacientesFiltrados.map((paciente, indice) => (
              <CartaoPaciente
                key={paciente.id}
                paciente={paciente}
                indice={indice}
                onAbrir={() =>
                  router.push(
                    rotaApp({ pathname: '/pacientes/[id]', params: { id: paciente.id } }),
                  )
                }
                onEditar={() =>
                  router.push(
                    rotaApp({
                      pathname: '/pacientes/[id]/editar',
                      params: { id: paciente.id },
                    }),
                  )
                }
                onExcluir={() => setPacienteParaExcluir(paciente)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Botão de ação flutuante ── */}
      <Pressable
        onPress={() => router.push(rotaApp('/pacientes/novo'))}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 88 },
          pressed && { opacity: 0.8, transform: [{ scale: 0.93 }] },
        ]}
        accessibilityLabel="Cadastrar novo paciente"
        accessibilityRole="button"
      >
        <Text style={styles.fabIcone}>＋</Text>
      </Pressable>

      {/* ── Modal de confirmação ── */}
      <ModalConfirmacao
        visivel={Boolean(pacienteParaExcluir)}
        titulo="Excluir paciente?"
        descricao={`O cadastro de ${pacienteParaExcluir?.nome ?? 'paciente'} será removido do banco.`}
        textoConfirmar="Excluir"
        onCancelar={() => setPacienteParaExcluir(null)}
        onConfirmar={async () => {
          if (pacienteParaExcluir) {
            await excluirPaciente(pacienteParaExcluir.id);
          }
          setPacienteParaExcluir(null);
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
  headerTextos: {
    flex: 1,
    marginRight: 12,
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
    gap: 16,
  },

  // ── Campo de busca ──
  campoBuscaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  campoBuscaIcone: {
    fontSize: 16,
  },
  campoBuscaInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.onSurface,
  },

  // ── Lista ──
  lista: {
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
