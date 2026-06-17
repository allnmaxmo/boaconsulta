import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { obterDadosSimulados } from '@/src/dados/dadosSimulados';
import {
  cancelarAtendimento as cancelarAtendimentoMock,
  criarAtendimento as criarAtendimentoMock,
  editarAtendimento as editarAtendimentoMock,
  listarAtendimentosDoDia as listarAtendimentosDoDiaMock,
  listarHistoricoDoPaciente as listarHistoricoDoPacienteMock,
} from '@/src/servicos/atendimentos';
import {
  criarPaciente as criarPacienteMock,
  editarPaciente as editarPacienteMock,
  excluirPaciente as excluirPacienteMock,
  listarPacientes as listarPacientesMock,
} from '@/src/servicos/pacientes';
import {
  criarProfissional as criarProfissionalMock,
  editarProfissional as editarProfissionalMock,
  excluirProfissional as excluirProfissionalMock,
  listarProfissionais as listarProfissionaisMock,
} from '@/src/servicos/profissionais';
import {
  Atendimento,
  AtendimentoComRelacionamentos,
  Paciente,
  Profissional,
} from '@/src/tipos/dominio';

type DadosPaciente = Omit<Paciente, 'id'>;
type DadosProfissional = Omit<Profissional, 'id'>;
type DadosNovoAtendimento = Omit<Atendimento, 'id' | 'status'>;
type DadosEdicaoAtendimento = Omit<Atendimento, 'id'>;

type DadosClinicaContextoValor = {
  pacientes: Paciente[];
  profissionais: Profissional[];
  atendimentos: Atendimento[];
  listarAtendimentosDoDia: (data: string, profissionalId?: string) => AtendimentoComRelacionamentos[];
  listarHistoricoDoPaciente: (pacienteId: string) => AtendimentoComRelacionamentos[];
  obterPaciente: (pacienteId: string) => Paciente | undefined;
  obterProfissional: (profissionalId: string) => Profissional | undefined;
  obterAtendimento: (atendimentoId: string) => AtendimentoComRelacionamentos | undefined;
  criarPaciente: (dados: DadosPaciente) => Paciente;
  editarPaciente: (pacienteId: string, dados: DadosPaciente) => void;
  excluirPaciente: (pacienteId: string) => void;
  criarProfissional: (dados: DadosProfissional) => Profissional;
  editarProfissional: (profissionalId: string, dados: DadosProfissional) => void;
  excluirProfissional: (profissionalId: string) => void;
  criarAtendimento: (dados: DadosNovoAtendimento) => Atendimento;
  editarAtendimento: (atendimentoId: string, dados: DadosEdicaoAtendimento) => void;
  cancelarAtendimento: (atendimentoId: string) => void;
};

const DadosClinicaContexto = createContext<DadosClinicaContextoValor | null>(null);

export function DadosClinicaProvider({ children }: PropsWithChildren) {
  const dadosIniciais = useMemo(() => obterDadosSimulados(), []);
  const [pacientes, setPacientes] = useState(dadosIniciais.pacientes);
  const [profissionais, setProfissionais] = useState(dadosIniciais.profissionais);
  const [atendimentos, setAtendimentos] = useState(dadosIniciais.atendimentos);

  const obterPaciente = useCallback(
    (pacienteId: string) => pacientes.find((paciente) => paciente.id === pacienteId),
    [pacientes],
  );

  const obterProfissional = useCallback(
    (profissionalId: string) =>
      profissionais.find((profissional) => profissional.id === profissionalId),
    [profissionais],
  );

  const relacionarAtendimento = useCallback(
    (atendimento: Atendimento): AtendimentoComRelacionamentos => ({
      ...atendimento,
      paciente: obterPaciente(atendimento.pacienteId),
      profissional: obterProfissional(atendimento.profissionalId),
    }),
    [obterPaciente, obterProfissional],
  );

  const listarAtendimentosDoDia = useCallback(
    (data: string, profissionalId?: string) =>
      listarAtendimentosDoDiaMock(atendimentos, data, profissionalId).map(relacionarAtendimento),
    [atendimentos, relacionarAtendimento],
  );

  const listarHistoricoDoPaciente = useCallback(
    (pacienteId: string) =>
      listarHistoricoDoPacienteMock(atendimentos, pacienteId).map(relacionarAtendimento),
    [atendimentos, relacionarAtendimento],
  );

  const obterAtendimento = useCallback(
    (atendimentoId: string) => {
      const atendimento = atendimentos.find((item) => item.id === atendimentoId);
      return atendimento ? relacionarAtendimento(atendimento) : undefined;
    },
    [atendimentos, relacionarAtendimento],
  );

  const criarPaciente = useCallback((dados: DadosPaciente) => {
    const paciente = criarPacienteMock(dados);
    setPacientes((atuais) => listarPacientesMock([...atuais, paciente]));
    return paciente;
  }, []);

  const editarPaciente = useCallback((pacienteId: string, dados: DadosPaciente) => {
    setPacientes((atuais) =>
      listarPacientesMock(
        atuais.map((paciente) =>
          paciente.id === pacienteId ? editarPacienteMock(paciente, dados) : paciente,
        ),
      ),
    );
  }, []);

  const excluirPaciente = useCallback((pacienteId: string) => {
    setPacientes((atuais) => excluirPacienteMock(atuais, pacienteId));
  }, []);

  const criarProfissional = useCallback((dados: DadosProfissional) => {
    const profissional = criarProfissionalMock(dados);
    setProfissionais((atuais) => listarProfissionaisMock([...atuais, profissional]));
    return profissional;
  }, []);

  const editarProfissional = useCallback((profissionalId: string, dados: DadosProfissional) => {
    setProfissionais((atuais) =>
      listarProfissionaisMock(
        atuais.map((profissional) =>
          profissional.id === profissionalId
            ? editarProfissionalMock(profissional, dados)
            : profissional,
        ),
      ),
    );
  }, []);

  const excluirProfissional = useCallback((profissionalId: string) => {
    setProfissionais((atuais) => excluirProfissionalMock(atuais, profissionalId));
  }, []);

  const criarAtendimento = useCallback((dados: DadosNovoAtendimento) => {
    const atendimento = criarAtendimentoMock(dados);
    setAtendimentos((atuais) => [...atuais, atendimento]);
    return atendimento;
  }, []);

  const editarAtendimento = useCallback(
    (atendimentoId: string, dados: DadosEdicaoAtendimento) => {
      setAtendimentos((atuais) =>
        atuais.map((atendimento) =>
          atendimento.id === atendimentoId ? editarAtendimentoMock(atendimento, dados) : atendimento,
        ),
      );
    },
    [],
  );

  const cancelarAtendimento = useCallback((atendimentoId: string) => {
    setAtendimentos((atuais) =>
      atuais.map((atendimento) =>
        atendimento.id === atendimentoId ? cancelarAtendimentoMock(atendimento) : atendimento,
      ),
    );
  }, []);

  const valor = useMemo<DadosClinicaContextoValor>(
    () => ({
      pacientes: listarPacientesMock(pacientes),
      profissionais: listarProfissionaisMock(profissionais),
      atendimentos,
      listarAtendimentosDoDia,
      listarHistoricoDoPaciente,
      obterPaciente,
      obterProfissional,
      obterAtendimento,
      criarPaciente,
      editarPaciente,
      excluirPaciente,
      criarProfissional,
      editarProfissional,
      excluirProfissional,
      criarAtendimento,
      editarAtendimento,
      cancelarAtendimento,
    }),
    [
      atendimentos,
      cancelarAtendimento,
      criarAtendimento,
      criarPaciente,
      criarProfissional,
      editarAtendimento,
      editarPaciente,
      editarProfissional,
      excluirPaciente,
      excluirProfissional,
      listarAtendimentosDoDia,
      listarHistoricoDoPaciente,
      obterAtendimento,
      obterPaciente,
      obterProfissional,
      pacientes,
      profissionais,
    ],
  );

  return <DadosClinicaContexto.Provider value={valor}>{children}</DadosClinicaContexto.Provider>;
}

export function useDadosClinica() {
  const contexto = useContext(DadosClinicaContexto);

  if (!contexto) {
    throw new Error('useDadosClinica deve ser usado dentro de DadosClinicaProvider');
  }

  return contexto;
}

