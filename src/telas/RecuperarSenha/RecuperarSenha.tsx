import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
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

// ─── Tela principal ───────────────────────────────────────────────────────────

export function RecuperarSenha() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sucessoVisivel, setSucessoVisivel] = useState(false);

  async function aoEnviar() {
    const emailNormalizado = email.trim();

    if (!emailNormalizado) {
      Alert.alert('E-mail obrigatório', 'Informe o e-mail cadastrado para recuperar sua senha.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailNormalizado);

    if (error) {
      Alert.alert('Erro ao enviar e-mail', error.message);
      return;
    }

    setSucessoVisivel(true);
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
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Bloco hero ── */}
        <View style={styles.hero}>
          <View style={styles.iconeHero}>
            <Text style={styles.iconeHeroTexto}>↺</Text>
          </View>
          <Text style={styles.heroTitulo}>Recuperar Senha</Text>
          <Text style={styles.heroDescricao}>
            Informe seu e-mail cadastrado para receber as instruções de redefinição.
          </Text>
        </View>

        {/* ── Cartão de formulário ── */}
        <GlassCard style={styles.cartao}>
          <View style={styles.campo}>
            <Text style={styles.campoRotulo}>E-MAIL CADASTRADO</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="exemplo@boaconsulta.com"
                placeholderTextColor={COLORS.outlineVariant}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <Pressable
            onPress={aoEnviar}
            style={({ pressed }) => [
              styles.botaoPrincipal,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.botaoPrincipalTexto}>Enviar Instruções</Text>
          </Pressable>

          <View style={styles.linksSecundarios}>
            <Pressable
              onPress={() => router.push(rotaApp('/login'))}
              style={styles.linkVoltarLogin}
            >
              <Text style={styles.linkVoltarLoginTexto}>Voltar ao Login</Text>
            </Pressable>

            <View style={styles.divisor} />

            <View style={styles.linhaCadastro}>
              <Text style={styles.rodapeTexto}>Ainda não tem conta? </Text>
              <Pressable onPress={() => router.push(rotaApp('/cadastro'))}>
                <Text style={styles.rodapeLink}>Cadastre-se</Text>
              </Pressable>
            </View>
          </View>
        </GlassCard>

        {/* ── Cartão de suporte ── */}
        <GlassCard style={styles.cartaoSuporte}>
          <View style={styles.iconeSuporte}>
            <Text style={styles.iconeSuporteTexto}>?</Text>
          </View>
          <View style={styles.suporteTextos}>
            <Text style={styles.suporteTitulo}>PRECISA DE AJUDA?</Text>
            <Text style={styles.suporteDescricao}>Fale com nossa central de suporte técnico.</Text>
          </View>
          <Text style={styles.suporteSeta}>›</Text>
        </GlassCard>
      </ScrollView>

      {/* ── Modal de sucesso ── */}
      <Modal visible={sucessoVisivel} transparent animationType="fade">
        <View style={styles.modalFundo}>
          <View style={styles.modalCartao}>
            <View style={styles.modalIconeWrapper}>
              <Text style={styles.modalIconeTexto}>✓</Text>
            </View>
            <Text style={styles.modalTitulo}>E-mail Enviado!</Text>
            <Text style={styles.modalDescricao}>
              Enviamos um link de recuperação para o e-mail informado. Verifique sua caixa de
              entrada e spam.
            </Text>
            <Pressable style={styles.modalBotao} onPress={() => setSucessoVisivel(false)}>
              <Text style={styles.modalBotaoTexto}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
    gap: 32,
    alignItems: 'center',
  },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 300,
  },
  iconeHero: {
    width: 88,
    height: 88,
    borderRadius: RADIUS['2xl'],
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconeHeroTexto: {
    fontSize: 36,
    color: COLORS.primary,
  },
  heroTitulo: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: COLORS.onSurface,
  },
  heroDescricao: {
    fontSize: 15,
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
    width: '100%',
    borderRadius: RADIUS['3xl'],
    padding: 24,
    gap: 20,
  },

  campo: { gap: 8 },
  campoRotulo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.onSurfaceVariant,
    paddingHorizontal: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.glassInput,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.onSurface,
  },

  // ── Botão principal ──
  botaoPrincipal: {
    height: 56,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.glassButton,
    alignItems: 'center',
    justifyContent: 'center',
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

  // ── Links secundários ──
  linksSecundarios: {
    alignItems: 'center',
    gap: 16,
  },
  linkVoltarLogin: { paddingVertical: 4 },
  linkVoltarLoginTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divisor: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    opacity: 0.3,
  },
  linhaCadastro: { flexDirection: 'row' },
  rodapeTexto: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  rodapeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  // ── Cartão de suporte ──
  cartaoSuporte: {
    width: '100%',
    borderRadius: RADIUS['2xl'],
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconeSuporte: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 74, 198, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeSuporteTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  suporteTextos: { flex: 1, gap: 2 },
  suporteTitulo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: COLORS.onSurface,
  },
  suporteDescricao: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  suporteSeta: {
    fontSize: 22,
    color: COLORS.outlineVariant,
  },

  // ── Modal ──
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(40, 48, 68, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCartao: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: RADIUS['3xl'],
    padding: 32,
    alignItems: 'center',
  },
  modalIconeWrapper: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalIconeTexto: {
    fontSize: 36,
    color: COLORS.onPrimary,
    fontWeight: '700',
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  modalDescricao: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 28,
  },
  modalBotao: {
    width: '100%',
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBotaoTexto: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
