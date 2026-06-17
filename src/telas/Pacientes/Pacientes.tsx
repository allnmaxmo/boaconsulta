import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BotaoAcaoFlutuante } from '@/src/componentes/interface/BotaoAcaoFlutuante';
import { Cabecalho } from '@/src/componentes/interface/Cabecalho';
import { CampoTexto } from '@/src/componentes/interface/CampoTexto';
import { ContainerTela } from '@/src/componentes/interface/ContainerTela';
import { EstadoCarregamento } from '@/src/componentes/interface/EstadoCarregamento';
import { EstadoVazio } from '@/src/componentes/interface/EstadoVazio';
import { ModalConfirmacao } from '@/src/componentes/interface/ModalConfirmacao';
import { CartaoPaciente } from '@/src/componentes/pacientes/CartaoPaciente';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';
import { Paciente } from '@/src/tipos/dominio';
import { rotaApp } from '@/src/utilitarios/rotas';

export function Pacientes() {
  const router = useRouter();
  const { pacientes, excluirPaciente } = useDadosClinica();
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [pacienteParaExcluir, setPacienteParaExcluir] = useState<Paciente | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setCarregando(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    if (!termo) {
      return pacientes;
    }

    return pacientes.filter(
      (paciente) =>
        paciente.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
        paciente.telefone.toLocaleLowerCase('pt-BR').includes(termo),
    );
  }, [busca, pacientes]);

  return (
    <View style={styles.tela}>
      <ContainerTela>
        <Cabecalho titulo="Pacientes" subtitulo="Cadastro e perfil dos pacientes" />
        <CampoTexto
          rotulo="Buscar"
          placeholder="Nome ou telefone"
          value={busca}
          onChangeText={setBusca}
        />

        {carregando ? (
          <EstadoCarregamento />
        ) : pacientesFiltrados.length === 0 ? (
          <EstadoVazio
            titulo={busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            descricao="Cadastre pacientes para consultar dados e histórico de atendimentos."
            icone="person-search"
          />
        ) : (
          <View style={styles.lista}>
            {pacientesFiltrados.map((paciente, indice) => (
              <CartaoPaciente
                key={paciente.id}
                paciente={paciente}
                indice={indice}
                onAbrir={() => router.push(rotaApp({ pathname: '/pacientes/[id]', params: { id: paciente.id } }))}
                onEditar={() =>
                  router.push(rotaApp({ pathname: '/pacientes/[id]/editar', params: { id: paciente.id } }))
                }
                onExcluir={() => setPacienteParaExcluir(paciente)}
              />
            ))}
          </View>
        )}
      </ContainerTela>

      <BotaoAcaoFlutuante
        acessibilidade="Cadastrar novo paciente"
        onPress={() => router.push(rotaApp('/pacientes/novo'))}
      />

      <ModalConfirmacao
        visivel={Boolean(pacienteParaExcluir)}
        titulo="Excluir paciente?"
        descricao={`O cadastro de ${pacienteParaExcluir?.nome ?? 'paciente'} será removido desta simulação.`}
        textoConfirmar="Excluir"
        onCancelar={() => setPacienteParaExcluir(null)}
        onConfirmar={() => {
          if (pacienteParaExcluir) {
            excluirPaciente(pacienteParaExcluir.id);
          }
          setPacienteParaExcluir(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  lista: {
    gap: 14,
  },
});
