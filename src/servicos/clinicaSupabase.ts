import { supabase } from '@/src/servicos/supabase';
import {
  Atendimento,
  AtendimentoComRelacionamentos,
  DadosClinica,
  Paciente,
  Profissional,
  StatusAtendimento,
} from '@/src/tipos/dominio';
import { obterData, obterHorario } from '@/src/utilitarios/data';

type PacienteRow = {
  id: string;
  nome: string;
  telefone: string;
  email?: string | null;
  observacoes?: string | null;
};

type ProfissionalRow = {
  id: string;
  nome: string;
  especialidade: string;
  telefone?: string | null;
  ativo?: boolean | null;
};

type AtendimentoRow = {
  id: string;
  paciente_id: string;
  profissional_id: string;
  data_atendimento: string;
  hora_atendimento: string;
  duracao_minutos?: number | null;
  tipo_atendimento: string;
  status: StatusAtendimento;
  observacoes?: string | null;
  pacientes?: PacienteRow | PacienteRow[] | null;
  profissionais?: ProfissionalRow | ProfissionalRow[] | null;
};

type DadosPaciente = Omit<Paciente, 'id'>;
type DadosProfissional = Omit<Profissional, 'id'>;
type DadosNovoAtendimento = Omit<Atendimento, 'id' | 'status'>;
type DadosEdicaoAtendimento = Omit<Atendimento, 'id'>;

const selectAtendimento =
  'id,paciente_id,profissional_id,data_atendimento,hora_atendimento,duracao_minutos,tipo_atendimento,status,observacoes,pacientes:paciente_id(id,nome,telefone,email,observacoes),profissionais:profissional_id(id,nome,especialidade,telefone,ativo)';

function primeiro<T>(valor: T | T[] | null | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

function falhar(operacao: string, erro: { message: string }) {
  throw new Error(`${operacao}: ${erro.message}`);
}

function exigirLinha<T>(data: T | null, operacao: string): T {
  if (!data) {
    throw new Error(`${operacao}: nenhum registro foi retornado pelo Supabase.`);
  }

  return data;
}

function mapearPaciente(row: PacienteRow): Paciente {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    email: row.email ?? undefined,
    observacoes: row.observacoes ?? undefined,
  };
}

function mapearProfissional(row: ProfissionalRow): Profissional {
  return {
    id: row.id,
    nome: row.nome,
    especialidade: row.especialidade,
    telefone: row.telefone ?? undefined,
    ativo: row.ativo ?? undefined,
  };
}

function mapearAtendimento(row: AtendimentoRow): AtendimentoComRelacionamentos {
  const paciente = primeiro(row.pacientes);
  const profissional = primeiro(row.profissionais);

  return {
    id: row.id,
    pacienteId: row.paciente_id,
    profissionalId: row.profissional_id,
    dataHora: `${row.data_atendimento}T${row.hora_atendimento.slice(0, 5)}:00`,
    tipoAtendimento: row.tipo_atendimento,
    status: row.status,
    duracaoMinutos: row.duracao_minutos ?? undefined,
    observacoes: row.observacoes ?? undefined,
    paciente: paciente ? mapearPaciente(paciente) : undefined,
    profissional: profissional ? mapearProfissional(profissional) : undefined,
  };
}

function payloadAtendimento(dados: DadosNovoAtendimento | DadosEdicaoAtendimento) {
  return {
    paciente_id: dados.pacienteId,
    profissional_id: dados.profissionalId,
    data_atendimento: obterData(dados.dataHora),
    hora_atendimento: obterHorario(dados.dataHora),
    tipo_atendimento: dados.tipoAtendimento,
    status: 'status' in dados ? dados.status : 'agendado',
    duracao_minutos: dados.duracaoMinutos ?? 30,
    observacoes: dados.observacoes ?? null,
  };
}

export async function listarDadosClinicaSupabase(): Promise<DadosClinica> {
  const [pacientesResposta, profissionaisResposta, atendimentosResposta] = await Promise.all([
    supabase.from('pacientes').select('id,nome,telefone,email,observacoes').order('nome'),
    supabase
      .from('profissionais')
      .select('id,nome,especialidade,telefone,ativo')
      .eq('ativo', true)
      .order('nome'),
    supabase
      .from('atendimentos')
      .select(selectAtendimento)
      .order('data_atendimento', { ascending: false })
      .order('hora_atendimento', { ascending: false }),
  ]);

  if (pacientesResposta.error) {
    falhar('Erro ao listar pacientes', pacientesResposta.error);
  }

  if (profissionaisResposta.error) {
    falhar('Erro ao listar profissionais', profissionaisResposta.error);
  }

  if (atendimentosResposta.error) {
    falhar('Erro ao listar atendimentos', atendimentosResposta.error);
  }

  return {
    pacientes: (pacientesResposta.data ?? []).map(mapearPaciente),
    profissionais: (profissionaisResposta.data ?? []).map(mapearProfissional),
    atendimentos: (atendimentosResposta.data ?? []).map((row) =>
      mapearAtendimento(row as AtendimentoRow),
    ),
  };
}

export async function criarPacienteSupabase(dados: DadosPaciente) {
  const { data, error } = await supabase
    .from('pacientes')
    .insert({ nome: dados.nome, telefone: dados.telefone })
    .select('id,nome,telefone,email,observacoes')
    .single();

  if (error) {
    falhar('Erro ao criar paciente', error);
  }

  return mapearPaciente(exigirLinha(data, 'Erro ao criar paciente'));
}

export async function editarPacienteSupabase(pacienteId: string, dados: DadosPaciente) {
  const { data, error } = await supabase
    .from('pacientes')
    .update({ nome: dados.nome, telefone: dados.telefone })
    .eq('id', pacienteId)
    .select('id,nome,telefone,email,observacoes')
    .single();

  if (error) {
    falhar('Erro ao editar paciente', error);
  }

  return mapearPaciente(exigirLinha(data, 'Erro ao editar paciente'));
}

export async function excluirPacienteSupabase(pacienteId: string) {
  const { error } = await supabase.from('pacientes').delete().eq('id', pacienteId);

  if (error) {
    falhar('Erro ao excluir paciente', error);
  }
}

export async function criarProfissionalSupabase(dados: DadosProfissional) {
  const { data, error } = await supabase
    .from('profissionais')
    .insert({ nome: dados.nome, especialidade: dados.especialidade })
    .select('id,nome,especialidade,telefone,ativo')
    .single();

  if (error) {
    falhar('Erro ao criar profissional', error);
  }

  return mapearProfissional(exigirLinha(data, 'Erro ao criar profissional'));
}

export async function editarProfissionalSupabase(
  profissionalId: string,
  dados: DadosProfissional,
) {
  const { data, error } = await supabase
    .from('profissionais')
    .update({ nome: dados.nome, especialidade: dados.especialidade })
    .eq('id', profissionalId)
    .select('id,nome,especialidade,telefone,ativo')
    .single();

  if (error) {
    falhar('Erro ao editar profissional', error);
  }

  return mapearProfissional(exigirLinha(data, 'Erro ao editar profissional'));
}

export async function excluirProfissionalSupabase(profissionalId: string) {
  const { error } = await supabase.from('profissionais').delete().eq('id', profissionalId);

  if (error) {
    falhar('Erro ao excluir profissional', error);
  }
}

export async function criarAtendimentoSupabase(dados: DadosNovoAtendimento) {
  const { data, error } = await supabase
    .from('atendimentos')
    .insert(payloadAtendimento(dados))
    .select(selectAtendimento)
    .single();

  if (error) {
    falhar('Erro ao criar atendimento', error);
  }

  return mapearAtendimento(data as AtendimentoRow);
}

export async function editarAtendimentoSupabase(
  atendimentoId: string,
  dados: DadosEdicaoAtendimento,
) {
  const { data, error } = await supabase
    .from('atendimentos')
    .update(payloadAtendimento(dados))
    .eq('id', atendimentoId)
    .select(selectAtendimento)
    .single();

  if (error) {
    falhar('Erro ao editar atendimento', error);
  }

  return mapearAtendimento(data as AtendimentoRow);
}

export async function cancelarAtendimentoSupabase(atendimentoId: string) {
  const { data, error } = await supabase
    .from('atendimentos')
    .update({ status: 'cancelado' })
    .eq('id', atendimentoId)
    .select(selectAtendimento)
    .single();

  if (error) {
    falhar('Erro ao cancelar atendimento', error);
  }

  return mapearAtendimento(data as AtendimentoRow);
}
