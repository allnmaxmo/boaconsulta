import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { DadosClinicaProvider } from '@/src/contextos/DadosClinicaContexto';
import { cores } from '@/src/constantes/tema';

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

export default function RootLayout() {
  return (
    <DadosClinicaProvider>
      <ThemeProvider value={temaBoaConsulta}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="agendamento/novo" options={{ presentation: 'modal' }} />
          <Stack.Screen name="agendamento/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="pacientes/novo" options={{ presentation: 'modal' }} />
          <Stack.Screen name="pacientes/[id]/editar" options={{ presentation: 'modal' }} />
          <Stack.Screen name="pacientes/[id]/index" />
          <Stack.Screen name="profissionais/novo" options={{ presentation: 'modal' }} />
          <Stack.Screen name="profissionais/[id]" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </DadosClinicaProvider>
  );
}
