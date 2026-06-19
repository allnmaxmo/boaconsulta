import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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

import {
  CargoUsuario,
  enviarImagemPerfil,
  obterPerfilUsuarioAtual,
  obterResumoProfissionalDoUsuario,
  PerfilUsuarioAtual,
  ResumoProfissional,
} from '@/src/servicos/perfilSupabase';
import { supabase } from '@/src/servicos/supabase';
import { rotaApp } from '@/src/utilitarios/rotas';

const COLORS = {
  primary: '#004ac6',
  onPrimary: '#ffffff',
  onSurface: '#131b2e',
  onSurfaceVariant: '#434655',
  surface: '#faf8ff',
  surfaceContainerHigh: '#e2e7ff',
  error: '#ba1a1a',
  glass: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

const RADIUS = {
  lg: 16,
  '2xl': 24,
  full: 9999,
};

const rotulosCargo: Record<CargoUsuario, string> = {
  administrador: 'Administrador',
  atendente: 'Atendente',
  profissional: 'Profissional',
  paciente: 'Paciente',
};

function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

function obterIniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

type PerfilUsuarioProps = {
  redirecionarAposLogout?: string;
};

export function PerfilUsuario({ redirecionarAposLogout = '/login' }: PerfilUsuarioProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [perfil, setPerfil] = useState<PerfilUsuarioAtual | null>(null);
  const [resumoProfissional, setResumoProfissional] = useState<ResumoProfissional | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const versaoApp = Constants.expoConfig?.version ?? '1.0.0';

  useFocusEffect(
    useCallback(() => {
      let telaAtiva = true;
      // A tentativa funciona como chave para repetir a carga após um erro.
      void tentativa;

      async function carregarPerfil() {
        setCarregando(true);
        setErro(null);

        try {
          const perfilAtual = await obterPerfilUsuarioAtual();
          if (!telaAtiva) return;

          setPerfil(perfilAtual);
          setResumoProfissional(null);

          if (perfilAtual.cargo === 'profissional') {
            try {
              const resumo = await obterResumoProfissionalDoUsuario(perfilAtual.id);

              if (telaAtiva) setResumoProfissional(resumo ?? null);
            } catch (error) {
              if (telaAtiva) {
                setErro(
                  error instanceof Error
                    ? error.message
                    : 'Não foi possível carregar os dados profissionais.',
                );
              }
            }
          }
        } catch (error) {
          if (telaAtiva) {
            setErro(error instanceof Error ? error.message : 'Não foi possível carregar o perfil.');
          }
        } finally {
          if (telaAtiva) setCarregando(false);
        }
      }

      carregarPerfil();

      return () => {
        telaAtiva = false;
      };
    }, [tentativa]),
  );

  async function aoSair() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Erro ao sair', error.message);
      return;
    }

    router.replace(rotaApp(redirecionarAposLogout));
  }

  async function aoSelecionarImagemPerfil() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        'Autorize o acesso às fotos para atualizar sua imagem de perfil.',
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (resultado.canceled) return;

    try {
      setEnviandoImagem(true);
      const avatarUrl = await enviarImagemPerfil(resultado.assets[0].uri);
      setPerfil((atual) => (atual ? { ...atual, avatarUrl } : atual));
    } catch (error) {
      Alert.alert(
        'Erro ao atualizar foto',
        error instanceof Error ? error.message : 'Não foi possível atualizar a imagem de perfil.',
      );
    } finally {
      setEnviandoImagem(false);
    }
  }

  function renderizarConteudo() {
    if (carregando && !perfil) {
      return (
        <View style={styles.estadoCentral}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.estadoTexto}>Carregando perfil...</Text>
        </View>
      );
    }

    if (erro && !perfil) {
      return (
        <View style={styles.estadoCentral}>
          <MaterialIcons name="error-outline" size={32} color={COLORS.error} />
          <Text style={styles.erroTexto}>{erro}</Text>
          <Pressable onPress={() => setTentativa((atual) => atual + 1)} style={styles.botaoTentar}>
            <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    if (!perfil) return null;

    return (
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {erro && (
          <Pressable onPress={() => setTentativa((atual) => atual + 1)} style={styles.avisoErro}>
            <Text style={styles.avisoErroTexto}>{erro} Toque para tentar novamente.</Text>
          </Pressable>
        )}

        <View style={styles.perfilCabecalho}>
          <View style={styles.avatarWrapper}>
            {perfil.avatarUrl ? (
              <Image
                source={{ uri: perfil.avatarUrl }}
                style={styles.avatar}
                onError={() =>
                  setPerfil((atual) => (atual ? { ...atual, avatarUrl: undefined } : atual))
                }
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarIniciais}>{obterIniciais(perfil.nomeCompleto)}</Text>
              </View>
            )}
            <Pressable
              disabled={enviandoImagem}
              onPress={aoSelecionarImagemPerfil}
              accessibilityLabel="Alterar foto de perfil"
              style={({ pressed }) => [
                styles.botaoEditarFoto,
                (pressed || enviandoImagem) && { opacity: 0.72 },
              ]}
            >
              {enviandoImagem ? (
                <ActivityIndicator size="small" color={COLORS.onPrimary} />
              ) : (
                <MaterialIcons name="photo-camera" size={17} color={COLORS.onPrimary} />
              )}
            </Pressable>
          </View>

          <Text style={styles.nome}>{perfil.nomeCompleto}</Text>
          <Text style={styles.email}>{perfil.email}</Text>
          <Text style={styles.telefone}>{perfil.telefone ?? 'Telefone não informado'}</Text>

          <View style={styles.seloCargo}>
            <MaterialIcons name="badge" size={14} color={COLORS.primary} />
            <Text style={styles.seloTexto}>{rotulosCargo[perfil.cargo].toUpperCase()}</Text>
          </View>

          {perfil.cargo === 'profissional' && resumoProfissional?.especialidade ? (
            <Text style={styles.especialidade}>{resumoProfissional.especialidade}</Text>
          ) : null}
        </View>

        {perfil.cargo === 'profissional' && (
          <View style={styles.linhaEstatisticas}>
            <GlassCard style={styles.cartaoEstatistica}>
              <Text style={styles.estatisticaValor}>
                {resumoProfissional?.totalConsultasRealizadas ?? '—'}
              </Text>
              <Text style={styles.estatisticaRotulo}>CONSULTAS REALIZADAS</Text>
            </GlassCard>
          </View>
        )}

        <GlassCard style={styles.menuCartao}>
          <Pressable
            onPress={() => router.push(rotaApp('/perfil/editar'))}
            style={({ pressed }) => [styles.itemMenu, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.itemMenuEsquerda}>
              <View style={styles.itemMenuIcone}>
                <MaterialIcons name="edit" size={19} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.itemMenuTitulo}>Editar dados</Text>
                <Text style={styles.itemMenuDescricao}>Nome e telefone</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
          </Pressable>
        </GlassCard>

        <Pressable
          onPress={aoSair}
          style={({ pressed }) => [styles.botaoSair, pressed && { opacity: 0.85 }]}
        >
          <MaterialIcons name="logout" size={18} color={COLORS.error} />
          <Text style={styles.botaoSairTexto}>Sair da conta</Text>
        </Pressable>

        <View style={styles.rodapeInfo}>
          <Text style={styles.rodapeVersao}>BOACONSULTA v{versaoApp}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.tela, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.headerWrap}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.botaoVoltar, pressed && { opacity: 0.7 }]}
        >
          <MaterialIcons name="arrow-back" size={22} color={COLORS.primary} />
        </Pressable>
        <Text style={styles.headerTitulo}>BoaConsulta</Text>
        <View style={styles.espacador} />
      </View>

      {renderizarConteudo()}
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  botaoVoltar: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitulo: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  espacador: { width: 32 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  estadoCentral: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  estadoTexto: { color: COLORS.onSurfaceVariant },
  erroTexto: { color: COLORS.error, textAlign: 'center', lineHeight: 20 },
  botaoTentar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(0,74,198,0.10)',
  },
  botaoTentarTexto: { color: COLORS.primary, fontWeight: '700' },
  avisoErro: {
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(186,26,26,0.08)',
  },
  avisoErroTexto: { color: COLORS.error, textAlign: 'center' },
  perfilCabecalho: { alignItems: 'center', gap: 6, paddingVertical: 16 },
  avatarWrapper: { width: 120, height: 120, marginBottom: 8 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.glassBorder,
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerHigh,
    borderWidth: 4,
    borderColor: COLORS.glassBorder,
  },
  avatarIniciais: { fontSize: 34, fontWeight: '800', color: COLORS.primary },
  botaoEditarFoto: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    elevation: 4,
  },
  nome: { fontSize: 22, fontWeight: '700', color: COLORS.onSurface, textAlign: 'center' },
  email: { fontSize: 14, fontWeight: '500', color: COLORS.onSurfaceVariant },
  telefone: { fontSize: 13, color: COLORS.onSurfaceVariant },
  seloCargo: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,74,198,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,74,198,0.2)',
  },
  seloTexto: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, color: COLORS.primary },
  especialidade: { marginTop: 2, fontSize: 13, fontWeight: '600', color: COLORS.onSurfaceVariant },
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
  linhaEstatisticas: { flexDirection: 'row' },
  cartaoEstatistica: {
    flex: 1,
    borderRadius: RADIUS['2xl'],
    paddingVertical: 22,
    alignItems: 'center',
  },
  estatisticaValor: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  estatisticaRotulo: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.onSurfaceVariant,
  },
  menuCartao: { borderRadius: RADIUS['2xl'], overflow: 'hidden' },
  itemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  itemMenuEsquerda: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  itemMenuIcone: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,74,198,0.10)',
  },
  itemMenuTitulo: { fontSize: 15, fontWeight: '700', color: COLORS.onSurface },
  itemMenuDescricao: { marginTop: 2, fontSize: 12, color: COLORS.onSurfaceVariant },
  botaoSair: {
    height: 56,
    flexDirection: 'row',
    gap: 8,
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
  rodapeInfo: { alignItems: 'center', opacity: 0.4, marginTop: 4 },
  rodapeVersao: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: COLORS.onSurfaceVariant,
  },
});
