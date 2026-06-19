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
  segredo,
  visivel,
  onAlternarVisibilidade,
  tecladoTipo,
  style,
}: {
  rotulo: string;
  valor: string;
  onChangeText: (texto: string) => void;
  placeholder: string;
  segredo?: boolean;
  visivel?: boolean;
  onAlternarVisibilidade?: () => void;
  tecladoTipo?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: object;
}) {
  return (
    <View style={[styles.campo, style]}>
      <Text style={styles.campoRotulo}>{rotulo}</Text>
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

export function TelaCadastro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  async function aoCadastrar() {
    const emailNormalizado = email.trim();
    const nomeNormalizado = nome.trim();
    const cpfNormalizado = cpf.trim();
    const telefoneNormalizado = telefone.trim();

    if (!nomeNormalizado || !emailNormalizado || !cpfNormalizado || !telefoneNormalizado || !senha) {
      Alert.alert('Dados incompletos', 'Preencha todos os campos para criar sua conta.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: emailNormalizado,
      password: senha,
      options: {
        data: {
          nome_completo: nomeNormalizado,
          cpf: cpfNormalizado,
          telefone: telefoneNormalizado,
          cargo: 'profissional',
        },
      },
    });

    if (error) {
      Alert.alert('Erro ao cadastrar', error.message);
      return;
    }

    if (data.user) {
      const { data: profissionalExistente, error: erroBuscaPerfil } = await supabase
        .from('profissionais')
        .select('id')
        .eq('usuario_id', data.user.id)
        .maybeSingle();

      if (erroBuscaPerfil) {
        Alert.alert(
          'Conta criada',
          `Sua conta foi criada, mas não foi possível verificar o perfil profissional: ${erroBuscaPerfil.message}`,
          [{ text: 'Entrar', onPress: () => router.replace(rotaApp('/login')) }],
        );
        return;
      }

      const { error: erroPerfil } = profissionalExistente
        ? { error: null }
        : await supabase.from('profissionais').insert({
            usuario_id: data.user.id,
            nome: nomeNormalizado,
            especialidade: 'Profissional de saude',
            telefone: telefoneNormalizado,
            ativo: true,
          });

      if (erroPerfil) {
        Alert.alert(
          'Conta criada',
          `Sua conta foi criada, mas não foi possível criar o perfil profissional: ${erroPerfil.message}`,
          [{ text: 'Entrar', onPress: () => router.replace(rotaApp('/login')) }],
        );
        return;
      }
    }

    Alert.alert('Cadastro realizado', 'Sua conta foi criada com sucesso.', [
      { text: 'Entrar', onPress: () => router.replace(rotaApp('/login')) },
    ]);
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
        <GlassCard style={styles.cartao}>
          <View style={styles.intro}>
            <Text style={styles.tituloIntro}>Crie sua conta</Text>
            <Text style={styles.descricaoIntro}>
              Preencha os dados abaixo para começar a agendar suas consultas de forma
              inteligente.
            </Text>
          </View>

          <CampoInput
            rotulo="NOME COMPLETO"
            placeholder="Ex: João da Silva"
            valor={nome}
            onChangeText={setNome}
          />

          <CampoInput
            rotulo="E-MAIL"
            placeholder="seu@email.com"
            valor={email}
            onChangeText={setEmail}
            tecladoTipo="email-address"
          />

          <View style={styles.linhaDupla}>
            <CampoInput
              rotulo="CPF"
              placeholder="000.000.000-00"
              valor={cpf}
              onChangeText={setCpf}
              tecladoTipo="numeric"
              style={styles.campoMetade}
            />
            <CampoInput
              rotulo="TELEFONE"
              placeholder="(11) 99999-9999"
              valor={telefone}
              onChangeText={setTelefone}
              tecladoTipo="phone-pad"
              style={styles.campoMetade}
            />
          </View>

          <CampoInput
            rotulo="SENHA"
            placeholder="••••••••"
            valor={senha}
            onChangeText={setSenha}
            segredo
            visivel={senhaVisivel}
            onAlternarVisibilidade={() => setSenhaVisivel((v) => !v)}
          />

          <Pressable
            onPress={aoCadastrar}
            style={({ pressed }) => [
              styles.botaoPrincipal,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.botaoPrincipalTexto}>Cadastrar</Text>
          </Pressable>

          <View style={styles.rodapeCartao}>
            <Text style={styles.rodapeTexto}>Já possui uma conta? </Text>
            <Pressable onPress={() => router.push(rotaApp('/login'))}>
              <Text style={styles.rodapeLink}>Fazer Login</Text>
            </Pressable>
          </View>
        </GlassCard>

        <Text style={styles.termos}>
          Ao se cadastrar, você concorda com nossos{' '}
          <Text style={styles.termosLink}>Termos de Uso</Text> e{' '}
          <Text style={styles.termosLink}>Privacidade</Text>.
        </Text>
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
    gap: 24,
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
    gap: 16,
  },
  intro: { gap: 6, marginBottom: 4 },
  tituloIntro: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: COLORS.primary,
  },
  descricaoIntro: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
  },

  // ── Campos ──
  campo: { gap: 6 },
  campoMetade: { flex: 1 },
  linhaDupla: {
    flexDirection: 'row',
    gap: 16,
  },
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
  rodapeCartao: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rodapeTexto: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  rodapeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  termos: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: COLORS.outlineVariant,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
  },
  termosLink: { color: COLORS.primary },
});
