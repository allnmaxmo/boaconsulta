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
import {
  ProfissionalFormulario as CamposProfissional,
  profissionalSchema,
} from '@/src/validacoes/formularios';

type ProfissionalFormularioProps = {
  profissionalId?: string;
};

export function ProfissionalFormulario({ profissionalId }: ProfissionalFormularioProps) {
  const router = useRouter();
  const { obterProfissional, criarProfissional, editarProfissional, excluirProfissional } =
    useDadosClinica();
  const profissional = profissionalId ? obterProfissional(profissionalId) : undefined;
  const editando = Boolean(profissional);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CamposProfissional>({
    resolver: zodResolver(profissionalSchema),
    defaultValues: {
      nome: profissional?.nome ?? '',
      especialidade: profissional?.especialidade ?? '',
    },
  });

  async function salvar(dados: CamposProfissional) {
    setEnviando(true);
    await new Promise((resolve) => setTimeout(resolve, 650));

    if (editando && profissionalId) {
      editarProfissional(profissionalId, dados);
    } else {
      criarProfissional(dados);
    }

    setEnviando(false);
    setSucesso(true);
    setTimeout(() => router.back(), 650);
  }

  return (
    <ContainerTela>
      <Cabecalho
        titulo={editando ? 'Editar Profissional' : 'Novo Profissional'}
        subtitulo="Dados da equipe clínica"
      />

      {sucesso ? <AvisoSucesso mensagem="Profissional salvo com sucesso." /> : null}

      <Controller
        control={control}
        name="nome"
        render={({ field }) => (
          <CampoTexto
            rotulo="Nome completo"
            placeholder="Ex.: Dra. Fernanda Rocha"
            value={field.value}
            onChangeText={field.onChange}
            erro={errors.nome?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="especialidade"
        render={({ field }) => (
          <CampoTexto
            rotulo="Especialidade"
            placeholder="Ex.: Cardiologia"
            value={field.value}
            onChangeText={field.onChange}
            erro={errors.especialidade?.message}
          />
        )}
      />

      <Botao titulo="Salvar" carregando={enviando} onPress={handleSubmit(salvar)} />
      {editando ? (
        <Botao
          titulo="Excluir profissional"
          variante="perigo"
          icone="delete-outline"
          onPress={() => setConfirmandoExclusao(true)}
        />
      ) : null}
      <Botao titulo="Voltar" variante="fantasma" onPress={() => router.back()} />

      <ModalConfirmacao
        visivel={confirmandoExclusao}
        titulo="Excluir profissional?"
        descricao={`O cadastro de ${profissional?.nome ?? 'profissional'} será removido desta simulação.`}
        textoConfirmar="Excluir"
        onCancelar={() => setConfirmandoExclusao(false)}
        onConfirmar={() => {
          if (profissionalId) {
            excluirProfissional(profissionalId);
          }
          setConfirmandoExclusao(false);
          router.replace(rotaApp('/profissionais'));
        }}
      />
    </ContainerTela>
  );
}
