import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { cores, raios } from '@/src/constantes/tema';

type CampoTextoProps = TextInputProps & {
  rotulo: string;
  erro?: string;
};

export function CampoTexto({ rotulo, erro, style, ...props }: CampoTextoProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        placeholderTextColor={cores.textoSuave}
        style={[styles.input, erro ? styles.inputErro : null, style]}
        {...props}
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  rotulo: {
    color: cores.texto,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    color: cores.texto,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputErro: {
    borderColor: cores.vermelho,
    backgroundColor: cores.vermelhoSuave,
  },
  erro: {
    color: cores.vermelho,
    fontSize: 13,
    fontWeight: '600',
  },
});

