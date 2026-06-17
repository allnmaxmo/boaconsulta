import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ItemHistoricoAtendimento } from '@/src/componentes/historico/ItemHistoricoAtendimento';
import { Botao } from '@/src/componentes/interface/Botao';
import { Cabecalho } from '@/src/componentes/interface/Cabecalho';
import { ContainerTela } from '@/src/componentes/interface/ContainerTela';
import { EstadoVazio } from '@/src/componentes/interface/EstadoVazio';
import { ModalConfirmacao } from '@/src/componentes/interface/ModalConfirmacao';
import { cores, raios, sombraCartao } from '@/src/constantes/tema';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';
import { rotaApp } from '@/src/utilitarios/rotas';

export function PerfilPaciente() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { obterPaciente, listarHistoricoDoPaciente, excluirPaciente } = useDadosClinica();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const paciente = obterPaciente(id);
  const historico = listarHistoricoDoPaciente(id);

  if (!paciente) {
    return (
      <ContainerTela>
        <Cabecalho titulo="Paciente" subtitulo="Cadastro não encontrado" />
        <EstadoVazio
          titulo="Paciente não encontrado"
          descricao="Este cadastro pode ter sido excluído da simulação."
          icone="person-off"
        />
        <Botao titulo="Voltar para pacientes" onPress={() => router.replace(rotaApp('/pacientes'))} />
      </ContainerTela>
    );
  }

  return (
    <ContainerTela>
      <Cabecalho titulo="Perfil do Paciente" subtitulo="Dados e histórico de atendimentos" />

      <View style={styles.cartaoPerfil}>
        <View style={styles.avatar}>
          <Text style={styles.inicial}>{paciente.nome.charAt(0)}</Text>
        </View>
        <View style={styles.infoPerfil}>
          <Text style={styles.nome}>{paciente.nome}</Text>
          <Text style={styles.telefone}>{paciente.telefone}</Text>
        </View>
        <Pressable
          onPress={() => router.push(rotaApp({ pathname: '/pacientes/[id]/editar', params: { id: paciente.id } }))}
          style={styles.botaoIcone}>
          <MaterialIcons name="edit" size={20} color={cores.azul} />
        </Pressable>
      </View>

      <View style={styles.acoes}>
        <Botao
          titulo="Editar paciente"
          variante="secundario"
          icone="edit"
          onPress={() => router.push(rotaApp({ pathname: '/pacientes/[id]/editar', params: { id: paciente.id } }))}
          style={styles.acao}
        />
        <Botao
          titulo="Excluir"
          variante="perigo"
          icone="delete-outline"
          onPress={() => setConfirmandoExclusao(true)}
          style={styles.acao}
        />
      </View>

      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>Histórico de Atendimentos</Text>
        {historico.length === 0 ? (
          <EstadoVazio
            titulo="Histórico vazio"
            descricao="Atendimentos concluídos, agendados e cancelados aparecerão aqui."
            icone="history"
          />
        ) : (
          <View style={styles.lista}>
            {historico.map((atendimento) => (
              <ItemHistoricoAtendimento key={atendimento.id} atendimento={atendimento} />
            ))}
          </View>
        )}
      </View>

      <ModalConfirmacao
        visivel={confirmandoExclusao}
        titulo="Excluir paciente?"
        descricao={`O cadastro de ${paciente.nome} será removido desta simulação.`}
        textoConfirmar="Excluir"
        onCancelar={() => setConfirmandoExclusao(false)}
        onConfirmar={() => {
          excluirPaciente(paciente.id);
          setConfirmandoExclusao(false);
          router.replace(rotaApp('/pacientes'));
        }}
      />
    </ContainerTela>
  );
}

const styles = StyleSheet.create({
  cartaoPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: raios.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 18,
    ...sombraCartao,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: cores.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    color: cores.azul,
    fontSize: 24,
    fontWeight: '900',
  },
  infoPerfil: {
    flex: 1,
    gap: 4,
  },
  nome: {
    color: cores.texto,
    fontSize: 20,
    fontWeight: '900',
  },
  telefone: {
    color: cores.textoSuave,
    fontSize: 15,
    fontWeight: '700',
  },
  botaoIcone: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: cores.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
  },
  acao: {
    flex: 1,
  },
  secao: {
    gap: 12,
  },
  tituloSecao: {
    color: cores.texto,
    fontSize: 20,
    fontWeight: '900',
  },
  lista: {
    gap: 10,
  },
});
