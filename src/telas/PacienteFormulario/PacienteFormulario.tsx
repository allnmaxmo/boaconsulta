import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AvisoSucesso } from '@/src/componentes/interface/AvisoSucesso';
import { Botao } from '@/src/componentes/interface/Botao';
import { Cabecalho } from '@/src/componentes/interface/Cabecalho';
import { CampoTexto } from '@/src/componentes/interface/CampoTexto';
import { ContainerTela } from '@/src/componentes/interface/ContainerTela';
import { ModalConfirmacao } from '@/src/componentes/interface/ModalConfirmacao';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';
import { rotaApp } from '@/src/utilitarios/rotas';
import { PacienteFormulario as CamposPaciente, pacienteSchema } from '@/src/validacoes/formularios';

type PacienteFormularioProps = {
  pacienteId?: string;
};

export function PacienteFormulario({ pacienteId }: PacienteFormularioProps) {
  const router = useRouter();
  const { obterPaciente, criarPaciente, editarPaciente, excluirPaciente } = useDadosClinica();
  const paciente = pacienteId ? obterPaciente(pacienteId) : undefined;
  const editando = Boolean(paciente);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CamposPaciente>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      nome: paciente?.nome ?? '',
      telefone: paciente?.telefone ?? '',
    },
  });

  async function salvar(dados: CamposPaciente) {
    setEnviando(true);
    await new Promise((resolve) => setTimeout(resolve, 650));

    if (editando && pacienteId) {
      editarPaciente(pacienteId, dados);
    } else {
      criarPaciente(dados);
    }

    setEnviando(false);
    setSucesso(true);
    setTimeout(() => router.back(), 650);
  }

  return (
    <ContainerTela>
      <Cabecalho
        titulo={editando ? 'Editar Paciente' : 'Novo Paciente'}
        subtitulo="Dados básicos para atendimento"
      />

      {sucesso ? <AvisoSucesso mensagem="Paciente salvo com sucesso." /> : null}

      <Controller
        control={control}
        name="nome"
        render={({ field }) => (
          <CampoTexto
            rotulo="Nome completo"
            placeholder="Ex.: Ana Souza"
            value={field.value}
            onChangeText={field.onChange}
            erro={errors.nome?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="telefone"
        render={({ field }) => (
          <CampoTexto
            rotulo="Telefone"
            placeholder="(79) 99999-0000"
            value={field.value}
            onChangeText={field.onChange}
            erro={errors.telefone?.message}
            keyboardType="phone-pad"
          />
        )}
      />

      <Botao titulo="Salvar" carregando={enviando} onPress={handleSubmit(salvar)} />
      {editando ? (
        <Botao
          titulo="Excluir paciente"
          variante="perigo"
          icone="delete-outline"
          onPress={() => setConfirmandoExclusao(true)}
        />
      ) : null}
      <Botao titulo="Voltar" variante="fantasma" onPress={() => router.back()} />

      <ModalConfirmacao
        visivel={confirmandoExclusao}
        titulo="Excluir paciente?"
        descricao={`O cadastro de ${paciente?.nome ?? 'paciente'} será removido desta simulação.`}
        textoConfirmar="Excluir"
        onCancelar={() => setConfirmandoExclusao(false)}
        onConfirmar={() => {
          if (pacienteId) {
            excluirPaciente(pacienteId);
          }
          setConfirmandoExclusao(false);
          router.replace(rotaApp('/pacientes'));
        }}
      />
    </ContainerTela>
  );
}
