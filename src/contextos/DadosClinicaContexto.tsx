import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  listarAtendimentosDoDia as listarAtendimentosDoDiaMock,
  listarHistoricoDoPaciente as listarHistoricoDoPacienteMock,
} from '@/src/servicos/atendimentos';
import {
  listarPacientes as listarPacientesMock,
} from '@/src/servicos/pacientes';
import {
  listarProfissionais as listarProfissionaisMock,
} from '@/src/servicos/profissionais';
import {
  cancelarAtendimentoSupabase,
  criarAtendimentoSupabase,
  criarPacienteSupabase,
  criarProfissionalSupabase,
  editarAtendimentoSupabase,
  editarPacienteSupabase,
  editarProfissionalSupabase,
  excluirPacienteSupabase,
  excluirProfissionalSupabase,
  listarDadosClinicaSupabase,
} from '@/src/servicos/clinicaSupabase';
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
  carregando: boolean;
  erro: string | null;
  recarregarDados: () => Promise<void>;
  listarAtendimentosDoDia: (data: string, profissionalId?: string) => AtendimentoComRelacionamentos[];
  listarHistoricoDoPaciente: (pacienteId: string) => AtendimentoComRelacionamentos[];
  obterPaciente: (pacienteId: string) => Paciente | undefined;
  obterProfissional: (profissionalId: string) => Profissional | undefined;
  obterAtendimento: (atendimentoId: string) => AtendimentoComRelacionamentos | undefined;
  criarPaciente: (dados: DadosPaciente) => Promise<Paciente>;
  editarPaciente: (pacienteId: string, dados: DadosPaciente) => Promise<void>;
  excluirPaciente: (pacienteId: string) => Promise<void>;
  criarProfissional: (dados: DadosProfissional) => Promise<Profissional>;
  editarProfissional: (profissionalId: string, dados: DadosProfissional) => Promise<void>;
  excluirProfissional: (profissionalId: string) => Promise<void>;
  criarAtendimento: (dados: DadosNovoAtendimento) => Promise<Atendimento>;
  editarAtendimento: (atendimentoId: string, dados: DadosEdicaoAtendimento) => Promise<void>;
  cancelarAtendimento: (atendimentoId: string) => Promise<void>;
};

const DadosClinicaContexto = createContext<DadosClinicaContextoValor | null>(null);

type DadosClinicaProviderProps = PropsWithChildren<{
  sessaoAtiva?: boolean;
}>;

export function DadosClinicaProvider({ children, sessaoAtiva = true }: DadosClinicaProviderProps) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [atendimentos, setAtendimentos] = useState<AtendimentoComRelacionamentos[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregarDados = useCallback(async () => {
    if (!sessaoAtiva) {
      setPacientes([]);
      setProfissionais([]);
      setAtendimentos([]);
      setCarregando(false);
      setErro(null);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const dados = await listarDadosClinicaSupabase();
      setPacientes(dados.pacientes);
      setProfissionais(dados.profissionais);
      setAtendimentos(dados.atendimentos);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao carregar dados do Supabase.';
      setErro(mensagem);
      console.error(mensagem);
    } finally {
      setCarregando(false);
    }
  }, [sessaoAtiva]);

  useEffect(() => {
    recarregarDados();
  }, [recarregarDados]);

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

  const criarPaciente = useCallback(async (dados: DadosPaciente) => {
    const paciente = await criarPacienteSupabase(dados);
    setPacientes((atuais) => listarPacientesMock([...atuais, paciente]));
    return paciente;
  }, []);

  const editarPaciente = useCallback(async (pacienteId: string, dados: DadosPaciente) => {
    const pacienteEditado = await editarPacienteSupabase(pacienteId, dados);
    setPacientes((atuais) =>
      listarPacientesMock(
        atuais.map((paciente) => (paciente.id === pacienteId ? pacienteEditado : paciente)),
      ),
    );
  }, []);

  const excluirPaciente = useCallback(async (pacienteId: string) => {
    await excluirPacienteSupabase(pacienteId);
    setPacientes((atuais) => atuais.filter((paciente) => paciente.id !== pacienteId));
  }, []);

  const criarProfissional = useCallback(async (dados: DadosProfissional) => {
    const profissional = await criarProfissionalSupabase(dados);
    setProfissionais((atuais) => listarProfissionaisMock([...atuais, profissional]));
    return profissional;
  }, []);

  const editarProfissional = useCallback(async (profissionalId: string, dados: DadosProfissional) => {
    const profissionalEditado = await editarProfissionalSupabase(profissionalId, dados);
    setProfissionais((atuais) =>
      listarProfissionaisMock(
        atuais.map((profissional) =>
          profissional.id === profissionalId ? profissionalEditado : profissional,
        ),
      ),
    );
  }, []);

  const excluirProfissional = useCallback(async (profissionalId: string) => {
    await excluirProfissionalSupabase(profissionalId);
    setProfissionais((atuais) =>
      atuais.filter((profissional) => profissional.id !== profissionalId),
    );
  }, []);

  const criarAtendimento = useCallback(async (dados: DadosNovoAtendimento) => {
    const atendimento = await criarAtendimentoSupabase(dados);
    setAtendimentos((atuais) => [...atuais, atendimento]);
    return atendimento;
  }, []);

  const editarAtendimento = useCallback(
    async (atendimentoId: string, dados: DadosEdicaoAtendimento) => {
      const atendimentoEditado = await editarAtendimentoSupabase(atendimentoId, dados);
      setAtendimentos((atuais) =>
        atuais.map((atendimento) =>
          atendimento.id === atendimentoId ? atendimentoEditado : atendimento,
        ),
      );
    },
    [],
  );

  const cancelarAtendimento = useCallback(async (atendimentoId: string) => {
    const atendimentoCancelado = await cancelarAtendimentoSupabase(atendimentoId);
    setAtendimentos((atuais) =>
      atuais.map((atendimento) =>
        atendimento.id === atendimentoId ? atendimentoCancelado : atendimento,
      ),
    );
  }, []);

  const valor = useMemo<DadosClinicaContextoValor>(
    () => ({
      pacientes: listarPacientesMock(pacientes),
      profissionais: listarProfissionaisMock(profissionais),
      atendimentos,
      carregando,
      erro,
      recarregarDados,
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
      erro,
      excluirPaciente,
      excluirProfissional,
      carregando,
      listarAtendimentosDoDia,
      listarHistoricoDoPaciente,
      obterAtendimento,
      obterPaciente,
      obterProfissional,
      pacientes,
      profissionais,
      recarregarDados,
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

