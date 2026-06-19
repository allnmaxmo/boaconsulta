import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  atualizarPerfilUsuarioAtual,
  CargoUsuario,
  obterPerfilUsuarioAtual,
} from '@/src/servicos/perfilSupabase';
import {
  PerfilUsuarioFormulario,
  perfilUsuarioSchema,
} from '@/src/validacoes/formularios';

const COLORS = {
  primary: '#004ac6',
  onPrimary: '#ffffff',
  onSurface: '#131b2e',
  onSurfaceVariant: '#434655',
  surface: '#faf8ff',
  error: '#ba1a1a',
  glass: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  inputBg: 'rgba(255, 255, 255, 0.60)',
};

const rotulosCargo: Record<CargoUsuario, string> = {
  administrador: 'Administrador',
  atendente: 'Atendente',
  profissional: 'Profissional',
  paciente: 'Paciente',
};

function CampoPerfil({
  rotulo,
  value,
  onChangeText,
  erro,
  teclado,
}: {
  rotulo: string;
  value: string;
  onChangeText: (valor: string) => void;
  erro?: string;
  teclado?: 'default' | 'phone-pad';
}) {
  return (
    <View style={styles.campoWrap}>
      <Text style={styles.campoRotulo}>{rotulo}</Text>
      <TextInput
        style={[styles.campoInput, erro && styles.campoInputErro]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={teclado}
        placeholderTextColor={COLORS.onSurfaceVariant}
      />
      {erro ? <Text style={styles.campoErro}>{erro}</Text> : null}
    </View>
  );
}

export function EditarPerfilUsuario() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState<CargoUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PerfilUsuarioFormulario>({
    resolver: zodResolver(perfilUsuarioSchema),
    defaultValues: { nomeCompleto: '', telefone: '' },
  });

  useEffect(() => {
    let telaAtiva = true;

    obterPerfilUsuarioAtual()
      .then((perfil) => {
        if (!telaAtiva) return;

        setEmail(perfil.email);
        setCargo(perfil.cargo);
        reset({ nomeCompleto: perfil.nomeCompleto, telefone: perfil.telefone ?? '' });
      })
      .catch((error) => {
        if (telaAtiva) {
          setErroCarregamento(
            error instanceof Error ? error.message : 'Não foi possível carregar o perfil.',
          );
        }
      })
      .finally(() => {
        if (telaAtiva) setCarregando(false);
      });

    return () => {
      telaAtiva = false;
    };
  }, [reset]);

  async function salvar(dados: PerfilUsuarioFormulario) {
    setSalvando(true);
    setErroEnvio(null);
    setSucesso(false);

    try {
      await atualizarPerfilUsuarioAtual(dados);
      setSucesso(true);
      setTimeout(() => router.back(), 650);
    } catch (error) {
      setErroEnvio(error instanceof Error ? error.message : 'Não foi possível salvar o perfil.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.headerWrap}>
        <View>
          <Text style={styles.headerTitulo}>Editar dados</Text>
          <Text style={styles.headerSubtitulo}>Informações do usuário logado</Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.botaoVoltar, pressed && { opacity: 0.7 }]}
        >
          <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
        </Pressable>
      </View>

      {carregando ? (
        <View style={styles.estadoCentral}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.estadoTexto}>Carregando perfil...</Text>
        </View>
      ) : erroCarregamento ? (
        <View style={styles.estadoCentral}>
          <MaterialIcons name="error-outline" size={30} color={COLORS.error} />
          <Text style={styles.erroCentral}>{erroCarregamento}</Text>
          <Pressable onPress={() => router.back()} style={styles.botaoSecundario}>
            <Text style={styles.botaoSecundarioTexto}>Voltar</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.conteudo, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {sucesso && <Text style={styles.avisoSucesso}>Perfil atualizado com sucesso.</Text>}
          {erroEnvio && <Text style={styles.avisoErro}>{erroEnvio}</Text>}

          <View style={styles.cartao}>
            <Controller
              control={control}
              name="nomeCompleto"
              render={({ field }) => (
                <CampoPerfil
                  rotulo="Nome completo"
                  value={field.value}
                  onChangeText={field.onChange}
                  erro={errors.nomeCompleto?.message}
                />
              )}
            />

            <View style={styles.separador} />

            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <CampoPerfil
                  rotulo="Telefone"
                  value={field.value}
                  onChangeText={field.onChange}
                  erro={errors.telefone?.message}
                  teclado="phone-pad"
                />
              )}
            />
          </View>

          <View style={styles.cartaoInformativo}>
            <Text style={styles.informacaoRotulo}>E-mail</Text>
            <Text style={styles.informacaoValor}>{email}</Text>
            <Text style={styles.informacaoAjuda}>O e-mail de acesso não é alterado nesta tela.</Text>
            <View style={styles.separador} />
            <Text style={styles.informacaoRotulo}>Cargo</Text>
            <Text style={styles.informacaoValor}>{cargo ? rotulosCargo[cargo] : '—'}</Text>
            <Text style={styles.informacaoAjuda}>O cargo é protegido pelas regras do banco.</Text>
          </View>

          <Pressable
            disabled={salvando}
            onPress={handleSubmit(salvar)}
            style={({ pressed }) => [
              styles.botaoSalvar,
              (pressed || salvando) && { opacity: 0.72 },
            ]}
          >
            <Text style={styles.botaoSalvarTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: COLORS.surface },
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitulo: { fontSize: 22, fontWeight: '800', color: COLORS.onSurface },
  headerSubtitulo: { marginTop: 2, fontSize: 13, color: COLORS.onSurfaceVariant },
  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,74,198,0.10)',
  },
  conteudo: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  estadoCentral: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  estadoTexto: { color: COLORS.onSurfaceVariant },
  erroCentral: { color: COLORS.error, textAlign: 'center', lineHeight: 20 },
  cartao: {
    padding: 20,
    gap: 18,
    borderRadius: 24,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  cartaoInformativo: {
    padding: 20,
    gap: 6,
    borderRadius: 24,
    backgroundColor: 'rgba(0,74,198,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,74,198,0.12)',
  },
  campoWrap: { gap: 7 },
  campoRotulo: { fontSize: 13, fontWeight: '700', color: COLORS.onSurface },
  campoInput: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    color: COLORS.onSurface,
  },
  campoInputErro: { borderColor: COLORS.error },
  campoErro: { fontSize: 12, color: COLORS.error },
  separador: { height: 1, backgroundColor: 'rgba(19,27,46,0.08)' },
  informacaoRotulo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  informacaoValor: { fontSize: 16, fontWeight: '700', color: COLORS.onSurface },
  informacaoAjuda: { fontSize: 12, color: COLORS.onSurfaceVariant, marginBottom: 10 },
  botaoSalvar: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.primary,
  },
  botaoSalvarTexto: { color: COLORS.onPrimary, fontWeight: '800', textTransform: 'uppercase' },
  botaoSecundario: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(0,74,198,0.10)',
  },
  botaoSecundarioTexto: { color: COLORS.primary, fontWeight: '700' },
  avisoSucesso: {
    padding: 14,
    borderRadius: 16,
    color: COLORS.primary,
    backgroundColor: 'rgba(0,74,198,0.08)',
  },
  avisoErro: {
    padding: 14,
    borderRadius: 16,
    color: COLORS.error,
    backgroundColor: 'rgba(186,26,26,0.08)',
  },
});
