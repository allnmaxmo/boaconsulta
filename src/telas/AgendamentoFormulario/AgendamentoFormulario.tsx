import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Botao } from '@/src/componentes/interface/Botao';
import { AvisoSucesso } from '@/src/componentes/interface/AvisoSucesso';
import { Cabecalho } from '@/src/componentes/interface/Cabecalho';
import { CampoTexto } from '@/src/componentes/interface/CampoTexto';
import { ContainerTela } from '@/src/componentes/interface/ContainerTela';
import { ModalConfirmacao } from '@/src/componentes/interface/ModalConfirmacao';
import { Seletor } from '@/src/componentes/interface/Seletor';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';
import { StatusAtendimento } from '@/src/tipos/dominio';
import { dataISOHoje, montarDataHora, obterData, obterHorario } from '@/src/utilitarios/data';
import {
  AtendimentoEdicaoFormulario,
  atendimentoEdicaoSchema,
} from '@/src/validacoes/formularios';

type AgendamentoFormularioProps = {
  atendimentoId?: string;
};

const opcoesStatus: { rotulo: string; valor: StatusAtendimento }[] = [
  { rotulo: 'Agendado', valor: 'agendado' },
  { rotulo: 'Realizado', valor: 'realizado' },
  { rotulo: 'Cancelado', valor: 'cancelado' },
];

export function AgendamentoFormulario({ atendimentoId }: AgendamentoFormularioProps) {
  const router = useRouter();
  const {
    pacientes,
    profissionais,
    obterAtendimento,
    criarAtendimento,
    editarAtendimento,
    cancelarAtendimento,
  } = useDadosClinica();
  const atendimento = atendimentoId ? obterAtendimento(atendimentoId) : undefined;
  const editando = Boolean(atendimento);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AtendimentoEdicaoFormulario>({
    resolver: zodResolver(atendimentoEdicaoSchema),
    defaultValues: {
      pacienteId: atendimento?.pacienteId ?? '',
      profissionalId: atendimento?.profissionalId ?? '',
      data: atendimento ? obterData(atendimento.dataHora) : dataISOHoje(),
      horario: atendimento ? obterHorario(atendimento.dataHora) : '',
      tipoAtendimento: atendimento?.tipoAtendimento ?? '',
      status: atendimento?.status ?? 'agendado',
    },
  });

  async function salvar(dados: AtendimentoEdicaoFormulario) {
    setEnviando(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const dataHora = montarDataHora(dados.data, dados.horario);

    if (editando && atendimentoId) {
      editarAtendimento(atendimentoId, {
        pacienteId: dados.pacienteId,
        profissionalId: dados.profissionalId,
        dataHora,
        tipoAtendimento: dados.tipoAtendimento,
        status: dados.status,
      });
    } else {
      criarAtendimento({
        pacienteId: dados.pacienteId,
        profissionalId: dados.profissionalId,
        dataHora,
        tipoAtendimento: dados.tipoAtendimento,
      });
    }

    setEnviando(false);
    setSucesso(true);
    setTimeout(() => router.back(), 650);
  }

  function confirmarCancelamento() {
    if (atendimentoId) {
      cancelarAtendimento(atendimentoId);
      setSucesso(true);
      setConfirmandoCancelamento(false);
      setTimeout(() => router.back(), 650);
    }
  }

  return (
    <ContainerTela>
      <Cabecalho
        titulo={editando ? 'Editar Agendamento' : 'Novo Agendamento'}
        subtitulo={editando ? 'Atualize dados e status do atendimento' : 'Cadastre um atendimento local'}
      />

      {sucesso ? <AvisoSucesso mensagem="Agendamento salvo com sucesso." /> : null}

      <Controller
        control={control}
        name="pacienteId"
        render={({ field }) => (
          <Seletor
            rotulo="Paciente"
            valor={field.value}
            onChange={field.onChange}
            erro={errors.pacienteId?.message}
            opcoes={pacientes.map((paciente) => ({
              rotulo: paciente.nome,
              valor: paciente.id,
              detalhe: paciente.telefone,
            }))}
          />
        )}
      />

      <Controller
        control={control}
        name="profissionalId"
        render={({ field }) => (
          <Seletor
            rotulo="Profissional"
            valor={field.value}
            onChange={field.onChange}
            erro={errors.profissionalId?.message}
            opcoes={profissionais.map((profissional) => ({
              rotulo: profissional.nome,
              valor: profissional.id,
              detalhe: profissional.especialidade,
            }))}
          />
        )}
      />

      <View style={styles.linha}>
        <Controller
          control={control}
          name="data"
          render={({ field }) => (
            <CampoTexto
              rotulo="Data"
              placeholder="AAAA-MM-DD"
              value={field.value}
              onChangeText={field.onChange}
              erro={errors.data?.message}
              style={styles.campoLinha}
            />
          )}
        />
        <Controller
          control={control}
          name="horario"
          render={({ field }) => (
            <CampoTexto
              rotulo="Horário"
              placeholder="09:30"
              value={field.value}
              onChangeText={field.onChange}
              erro={errors.horario?.message}
              style={styles.campoLinha}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="tipoAtendimento"
        render={({ field }) => (
          <CampoTexto
            rotulo="Tipo de atendimento"
            placeholder="Consulta inicial, retorno, avaliação..."
            value={field.value}
            onChangeText={field.onChange}
            erro={errors.tipoAtendimento?.message}
          />
        )}
      />

      {editando ? (
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Seletor
              rotulo="Status"
              valor={field.value}
              onChange={field.onChange}
              erro={errors.status?.message}
              opcoes={opcoesStatus}
              horizontal
            />
          )}
        />
      ) : null}

      <View style={styles.acoes}>
        <Botao titulo="Salvar" carregando={enviando} onPress={handleSubmit(salvar)} style={styles.acao} />
        {editando ? (
          <Botao
            titulo="Cancelar atendimento"
            variante="perigo"
            onPress={() => setConfirmandoCancelamento(true)}
            style={styles.acao}
          />
        ) : null}
        <Botao titulo="Voltar" variante="fantasma" onPress={() => router.back()} />
      </View>

      <ModalConfirmacao
        visivel={confirmandoCancelamento}
        titulo="Cancelar atendimento?"
        descricao="O atendimento será mantido na lista e no histórico com status Cancelado."
        textoConfirmar="Cancelar"
        onCancelar={() => setConfirmandoCancelamento(false)}
        onConfirmar={confirmarCancelamento}
      />
    </ContainerTela>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  campoLinha: {
    flex: 1,
  },
  acoes: {
    gap: 10,
  },
  acao: {
    width: '100%',
  },
});
