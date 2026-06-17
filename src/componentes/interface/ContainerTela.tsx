import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/src/componentes/interface/AmbientBackground';
import { cores } from '@/src/constantes/tema';

type ContainerTelaProps = PropsWithChildren<{
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}>;

export function ContainerTela({ children, style, contentContainerStyle }: ContainerTelaProps) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={['top', 'left', 'right']}>
      <AmbientBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.conteudo, contentContainerStyle]}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: cores.fundo,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  conteudo: {
    padding: 22,
    paddingBottom: 190,
    gap: 20,
  },
});
