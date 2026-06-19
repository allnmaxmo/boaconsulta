import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  outline: '#737686',
  outlineVariant: '#c3c6d7',
  error: '#ba1a1a',
  glass: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  glassButton: 'rgba(0, 74, 198, 0.92)',
  glassInput: 'rgba(255, 255, 255, 0.5)',
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

function CampoInput({
  rotulo,
  valor,
  onChangeText,
  placeholder,
  acaoRotulo,
  onPressAcao,
  segredo,
  visivel,
  onAlternarVisibilidade,
  tecladoTipo,
}: {
  rotulo: string;
  valor: string;
  onChangeText: (texto: string) => void;
  placeholder: string;
  acaoRotulo?: string;
  onPressAcao?: () => void;
  segredo?: boolean;
  visivel?: boolean;
  onAlternarVisibilidade?: () => void;
  tecladoTipo?: 'default' | 'email-address';
}) {
  return (
    <View style={styles.campo}>
      <View style={styles.campoCabecalho}>
        <Text style={styles.campoRotulo}>{rotulo}</Text>
        {acaoRotulo && (
          <Pressable onPress={onPressAcao}>
            <Text style={styles.campoAcao}>{acaoRotulo}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.outlineVariant}
          value={valor}
          onChangeText={onChangeText}
          secureTextEntry={segredo && !visivel}
          autoCapitalize="none"
          keyboardType={tecladoTipo ?? 'default'}
        />
        {segredo && (
          <Pressable onPress={onAlternarVisibilidade} hitSlop={8}>
            <Text style={styles.inputAcaoTexto}>{visivel ? 'OCULTAR' : 'VER'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

type TelaLoginProps = {
  redirecionarAposLogin?: string;
};

export function TelaLogin({ redirecionarAposLogin = '/(tabs)' }: TelaLoginProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  async function aoEntrar() {
    const emailNormalizado = email.trim();

    if (!emailNormalizado || !senha) {
      Alert.alert('Dados incompletos', 'Informe e-mail e senha para entrar.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailNormalizado,
      password: senha,
    });

    if (error) {
      Alert.alert('Erro ao entrar', error.message);
      return;
    }

    router.replace(rotaApp(redirecionarAposLogin));
  }

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Marca ── */}
        <View style={styles.marca}>
          <View style={styles.iconeMarca}>
            <Text style={styles.iconeMarcaTexto}>+</Text>
          </View>
          <Text style={styles.marcaTitulo}>BoaConsulta</Text>
          <Text style={styles.marcaSubtitulo}>Sua saúde em boas mãos, a um clique.</Text>
        </View>

        {/* ── Cartão de login ── */}
        <GlassCard style={styles.cartao}>
          <CampoInput
            rotulo="E-MAIL"
            placeholder="nome@exemplo.com"
            valor={email}
            onChangeText={setEmail}
            tecladoTipo="email-address"
          />

          <CampoInput
            rotulo="SENHA"
            placeholder="••••••••"
            valor={senha}
            onChangeText={setSenha}
            segredo
            visivel={senhaVisivel}
            onAlternarVisibilidade={() => setSenhaVisivel((v) => !v)}
            acaoRotulo="ESQUECI MINHA SENHA"
            onPressAcao={() => router.push(rotaApp('/recuperar-senha'))}
          />

          <Pressable
            onPress={aoEntrar}
            style={({ pressed }) => [
              styles.botaoPrincipal,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.botaoPrincipalTexto}>Entrar</Text>
          </Pressable>
        </GlassCard>

        {/* ── Rodapé ── */}
        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>Não tem uma conta? </Text>
          <Pressable onPress={() => router.push(rotaApp('/cadastro'))}>
            <Text style={styles.rodapeLink}>Criar conta</Text>
          </Pressable>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    gap: 24,
  },

  // ── Marca ──
  marca: {
    alignItems: 'center',
    gap: 6,
  },
  iconeMarca: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  iconeMarcaTexto: {
    color: COLORS.onPrimary,
    fontSize: 28,
    fontWeight: '300',
  },
  marcaTitulo: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: COLORS.primary,
  },
  marcaSubtitulo: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  // ── Cartão ──
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
  cartao: {
    borderRadius: RADIUS['3xl'],
    padding: 24,
    gap: 18,
  },

  // ── Campos ──
  campo: { gap: 6 },
  campoCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  campoRotulo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
  },
  campoAcao: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: COLORS.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.glassInput,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  inputAcaoTexto: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: COLORS.primary,
  },

  // ── Botão principal ──
  botaoPrincipal: {
    height: 56,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.glassButton,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
  botaoPrincipalTexto: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Rodapé ──
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rodapeTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  rodapeLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
