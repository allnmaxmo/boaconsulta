import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/src/servicos/supabase';
import { rotaApp } from '@/src/utilitarios/rotas';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#004ac6',
  primaryContainer: '#2563eb',
  secondary: '#712ae2',
  onPrimary: '#ffffff',
  onSurface: '#131b2e',
  onSurfaceVariant: '#434655',
  surface: '#faf8ff',
  surfaceContainerHigh: '#e2e7ff',
  outline: '#737686',
  outlineVariant: '#c3c6d7',
  error: '#ba1a1a',
  glass: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  glassButton: 'rgba(0, 74, 198, 0.92)',
};

const RADIUS = {
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

type ItemMenu = {
  icone: string;
  titulo: string;
  destaque?: boolean;
  selo?: number;
  aoPressionar?: () => void;
};

function ItemMenuLinha({ item, ultimo }: { item: ItemMenu; ultimo: boolean }) {
  return (
    <Pressable
      onPress={item.aoPressionar}
      style={({ pressed }) => [
        styles.itemMenu,
        !ultimo && styles.itemMenuDivisor,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.itemMenuEsquerda}>
        <View
          style={[
            styles.itemMenuIcone,
            item.destaque
              ? { backgroundColor: 'rgba(0, 74, 198, 0.1)' }
              : { backgroundColor: COLORS.surfaceContainerHigh },
          ]}
        >
          <Text
            style={[
              styles.itemMenuIconeTexto,
              { color: item.destaque ? COLORS.primary : COLORS.onSurfaceVariant },
            ]}
          >
            {item.icone}
          </Text>
        </View>
        <Text style={styles.itemMenuTitulo}>{item.titulo}</Text>
      </View>

      <View style={styles.itemMenuDireita}>
        {!!item.selo && (
          <View style={styles.selo}>
            <Text style={styles.seloNumero}>{item.selo}</Text>
          </View>
        )}
        <Text style={styles.itemMenuSeta}>›</Text>
      </View>
    </Pressable>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

type PerfilUsuarioProps = {
  redirecionarAposLogout?: string;
};

export function PerfilUsuario({ redirecionarAposLogout = '/login' }: PerfilUsuarioProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profissional, setProfissional] = useState({
    nome: 'Dr. Ricardo Silva',
    email: 'ricardo.silva@boaconsulta.com',
    fotoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChohkqajxpqLDLOZaLrlctOkS46yD5q6uYzK5K2pT3P-CixlSUX78cKuAG4uY3ylvq4CcHKa9kn0PMp7Zx4mYFuVPI4i9p7wHGk6eSzmiogkx_qUOU_LmiU3Sow8h4vCToZTiBpKuXAGCrdtNPlTocyeSNIQjHzGfG3LCZvdSsSlSImPix_cE9tM21HM5OEn855kW6Go1jSv2jmLnBi_XxZhigjy4Vf7x5Zl0zWJ-FGSw_JfzImPRkSTmAo8KXglaX-wkZGfD0vnES',
    consultas: 124,
    avaliacao: '4.9',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        return;
      }

      setProfissional((atual) => ({
        ...atual,
        nome:
          typeof data.user.user_metadata.nome === 'string'
            ? data.user.user_metadata.nome
            : atual.nome,
        email: data.user.email ?? atual.email,
      }));
    });
  }, []);

  const itensMenu: ItemMenu[] = [
    { icone: '✎', titulo: 'Editar Dados', destaque: true },
    { icone: '⚙', titulo: 'Configurações' },
    { icone: '🔔', titulo: 'Notificações', selo: 3 },
  ];

  async function aoSair() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Erro ao sair', error.message);
      return;
    }

    router.replace(rotaApp(redirecionarAposLogout));
  }

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Cabeçalho ── */}
      <View style={styles.headerWrap}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.botaoVoltar, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.botaoVoltarTexto}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitulo}>BoaConsulta</Text>
        <View style={styles.espacador} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cabeçalho de perfil ── */}
        <View style={styles.perfilCabecalho}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: profissional.fotoUrl }} style={styles.avatar} />
            <Pressable style={styles.botaoEditarFoto}>
              <Text style={styles.botaoEditarFotoTexto}>✎</Text>
            </Pressable>
          </View>

          <Text style={styles.nome}>{profissional.nome}</Text>
          <Text style={styles.email}>{profissional.email}</Text>

          <View style={styles.seloVerificado}>
            <View style={styles.pontoVerde} />
            <Text style={styles.seloTexto}>MÉDICO VERIFICADO</Text>
          </View>
        </View>

        {/* ── Estatísticas rápidas ── */}
        <View style={styles.linhaEstatisticas}>
          <GlassCard style={styles.cartaoEstatistica}>
            <Text style={[styles.estatisticaValor, { color: COLORS.primary }]}>
              {profissional.consultas}
            </Text>
            <Text style={styles.estatisticaRotulo}>CONSULTAS</Text>
          </GlassCard>
          <GlassCard style={styles.cartaoEstatistica}>
            <Text style={[styles.estatisticaValor, { color: COLORS.secondary }]}>
              {profissional.avaliacao}
            </Text>
            <Text style={styles.estatisticaRotulo}>AVALIAÇÃO</Text>
          </GlassCard>
        </View>

        {/* ── Menu de ações ── */}
        <GlassCard style={styles.menuCartao}>
          {itensMenu.map((item, indice) => (
            <ItemMenuLinha key={item.titulo} item={item} ultimo={indice === itensMenu.length - 1} />
          ))}
        </GlassCard>

        {/* ── Sair da conta ── */}
        <Pressable
          onPress={aoSair}
          style={({ pressed }) => [styles.botaoSair, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.botaoSairTexto}>Sair da Conta</Text>
        </Pressable>

        <View style={styles.rodapeInfo}>
          <Text style={styles.rodapeVersao}>BOACONSULTA v2.4.1</Text>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  botaoVoltar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoVoltarTexto: {
    fontSize: 26,
    fontWeight: '300',
    color: COLORS.primary,
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: COLORS.primary,
  },
  espacador: { width: 32 },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },

  // ── Perfil cabeçalho ──
  perfilCabecalho: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.glassBorder,
  },
  botaoEditarFoto: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  botaoEditarFotoTexto: {
    color: COLORS.onPrimary,
    fontSize: 14,
  },
  nome: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  email: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  seloVerificado: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 74, 198, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 74, 198, 0.2)',
  },
  pontoVerde: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  seloTexto: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.primary,
  },

  // ── Estatísticas ──
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
  linhaEstatisticas: {
    flexDirection: 'row',
    gap: 16,
  },
  cartaoEstatistica: {
    flex: 1,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 22,
    alignItems: 'center',
  },
  estatisticaValor: {
    fontSize: 24,
    fontWeight: '700',
  },
  estatisticaRotulo: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.onSurfaceVariant,
  },

  // ── Menu ──
  menuCartao: {
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
  },
  itemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  itemMenuDivisor: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
  },
  itemMenuEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  itemMenuIcone: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemMenuIconeTexto: {
    fontSize: 16,
  },
  itemMenuTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  itemMenuDireita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selo: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: COLORS.error,
  },
  seloNumero: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
  itemMenuSeta: {
    fontSize: 20,
    color: COLORS.onSurfaceVariant,
  },

  // ── Sair ──
  botaoSair: {
    height: 56,
    borderRadius: RADIUS['2xl'],
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSairTexto: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.error,
    textTransform: 'uppercase',
  },

  // ── Rodapé ──
  rodapeInfo: {
    alignItems: 'center',
    opacity: 0.4,
    marginTop: 4,
  },
  rodapeVersao: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: COLORS.onSurfaceVariant,
  },
});
