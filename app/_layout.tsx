import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { DadosClinicaProvider } from '@/src/contextos/DadosClinicaContexto';
import { cores } from '@/src/constantes/tema';
import { configurarNotificacoes } from '@/src/servicos/notificacoes';
import { supabase } from '@/src/servicos/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

const temaBoaConsulta = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: cores.fundo,
    primary: cores.azulProfundo,
    card: cores.vidroForte,
    text: cores.texto,
    border: cores.borda,
  },
};

function TelaCarregandoSessao() {
  return (
    <View style={styles.carregando}>
      <ActivityIndicator color={cores.azulProfundo} />
    </View>
  );
}

export default function RootLayout() {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    configurarNotificacoes().catch((error) => {
      console.error(error instanceof Error ? error.message : 'Erro ao configurar notificações.');
    });

    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregandoSessao(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_evento, sessaoAtual) => {
      setSessao(sessaoAtual);
      setCarregandoSessao(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider value={temaBoaConsulta}>
      <DadosClinicaProvider sessaoAtiva={!!sessao}>
        {carregandoSessao ? (
          <TelaCarregandoSessao />
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!sessao}>
              <Stack.Screen name="login" />
              <Stack.Screen name="cadastro" />
              <Stack.Screen name="recuperar-senha" />
            </Stack.Protected>

            <Stack.Protected guard={!!sessao}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="agendamento/novo" options={{ presentation: 'modal' }} />
              <Stack.Screen name="agendamento/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="pacientes/novo" options={{ presentation: 'modal' }} />
              <Stack.Screen name="pacientes/[id]/editar" options={{ presentation: 'modal' }} />
              <Stack.Screen name="pacientes/[id]/index" />
              <Stack.Screen name="profissionais/novo" options={{ presentation: 'modal' }} />
              <Stack.Screen name="profissionais/[id]" options={{ presentation: 'modal' }} />
            </Stack.Protected>
          </Stack>
        )}
      </DadosClinicaProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
});
