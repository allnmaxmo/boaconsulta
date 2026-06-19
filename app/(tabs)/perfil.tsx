import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { cores } from '@/src/constantes/tema';
import { supabase } from '@/src/servicos/supabase';
import { PerfilUsuario } from '@/src/telas/PerfilUsuario/PerfilUsuario';
import { TelaLogin } from '@/src/telas/TelaLogin/TelaLogin';

export default function PerfilTab() {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, sessaoAtual) => {
      setSession(sessaoAtual);
      setCarregando(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator color={cores.azulProfundo} />
      </View>
    );
  }

  if (!session) {
    return <TelaLogin redirecionarAposLogin="/perfil" />;
  }

  return <PerfilUsuario redirecionarAposLogout="/perfil" />;
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
});
