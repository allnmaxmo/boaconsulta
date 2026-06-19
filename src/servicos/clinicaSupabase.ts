import { supabase } from '@/src/servicos/supabase';
import {
  agendarNotificacaoAtendimento,
  cancelarNotificacaoAtendimento,
} from '@/src/servicos/notificacoes';
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
  usuario_id?: string | null;
  nome: string;
  telefone: string;
  email?: string | null;
  avatar_url?: string | null;
  observacoes?: string | null;
};

type ProfissionalRow = {
  id: string;
  usuario_id?: string | null;
  nome: string;
  especialidade: string;
  telefone?: string | null;
  avatar_url?: string | null;
  ativo?: boolean | null;
};

type AtendimentoRow = {
  id: string;
  paciente_id: string;
  profissional_id: string;
  data_atendimento: string;
  hora_atendimento: string;
  duracao_minutos?: number | null;
  lembrete_minutos?: number | null;
  tipo_atendimento: string;
  status: StatusAtendimento;
  notificacao_id?: string | null;
  observacoes?: string | null;
  pacientes?: PacienteRow | PacienteRow[] | null;
  profissionais?: ProfissionalRow | ProfissionalRow[] | null;
};

type DadosPaciente = Omit<Paciente, 'id'>;
type DadosProfissional = Omit<Profissional, 'id'>;
type DadosNovoAtendimento = Omit<Atendimento, 'id' | 'status'>;
type DadosEdicaoAtendimento = Omit<Atendimento, 'id'>;

const selectAtendimento =
  'id,paciente_id,profissional_id,data_atendimento,hora_atendimento,duracao_minutos,lembrete_minutos,tipo_atendimento,status,notificacao_id,observacoes,pacientes:paciente_id(id,usuario_id,nome,telefone,email,avatar_url,observacoes),profissionais:profissional_id(id,usuario_id,nome,especialidade,telefone,avatar_url,ativo)';

function primeiro<T>(valor: T | T[] | null | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

function traduzirErroSupabase(erro: { message: string; code?: string }) {
  if (erro.code === '23503') {
    return 'Este registro possui vínculos no banco e não pode ser excluído fisicamente.';
  }

  return erro.message;
}

function falhar(operacao: string, erro: { message: string; code?: string }) {
  throw new Error(`${operacao}: ${traduzirErroSupabase(erro)}`);
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
    usuarioId: row.usuario_id ?? undefined,
    nome: row.nome,
    telefone: row.telefone,
    email: row.email ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    observacoes: row.observacoes ?? undefined,
  };
}

function mapearProfissional(row: ProfissionalRow): Profissional {
  return {
    id: row.id,
    usuarioId: row.usuario_id ?? undefined,
    nome: row.nome,
    especialidade: row.especialidade,
    telefone: row.telefone ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
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
    lembreteMinutos: row.lembrete_minutos ?? undefined,
    notificacaoId: row.notificacao_id ?? undefined,
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
    lembrete_minutos: dados.lembreteMinutos ?? 30,
    observacoes: dados.observacoes ?? null,
  };
}

async function salvarNotificacaoAtendimento(atendimento: AtendimentoComRelacionamentos) {
  const notificacaoId = await agendarNotificacaoAtendimento(
    atendimento,
    atendimento.lembreteMinutos ?? 30,
  );

  if (!notificacaoId) {
    return atendimento;
  }

  const { data, error } = await supabase
    .from('atendimentos')
    .update({ notificacao_id: notificacaoId })
    .eq('id', atendimento.id)
    .select(selectAtendimento)
    .single();

  if (error) {
    falhar('Erro ao salvar notificação do atendimento', error);
  }

  return mapearAtendimento(data as AtendimentoRow);
}

export async function listarDadosClinicaSupabase(): Promise<DadosClinica> {
  const [pacientesResposta, profissionaisResposta, atendimentosResposta] = await Promise.all([
    supabase.from('pacientes').select('id,usuario_id,nome,telefone,email,avatar_url,observacoes').order('nome'),
    supabase
      .from('profissionais')
      .select('id,usuario_id,nome,especialidade,telefone,avatar_url,ativo')
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
    .select('id,usuario_id,nome,telefone,email,avatar_url,observacoes')
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
    .select('id,usuario_id,nome,telefone,email,avatar_url,observacoes')
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
    .select('id,usuario_id,nome,especialidade,telefone,avatar_url,ativo')
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
    .select('id,usuario_id,nome,especialidade,telefone,avatar_url,ativo')
    .single();

  if (error) {
    falhar('Erro ao editar profissional', error);
  }

  return mapearProfissional(exigirLinha(data, 'Erro ao editar profissional'));
}

export async function excluirProfissionalSupabase(profissionalId: string) {
  const { error } = await supabase
    .from('profissionais')
    .update({ ativo: false })
    .eq('id', profissionalId);

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

  return salvarNotificacaoAtendimento(mapearAtendimento(data as AtendimentoRow));
}

export async function editarAtendimentoSupabase(
  atendimentoId: string,
  dados: DadosEdicaoAtendimento,
) {
  const { data: atendimentoAtual, error: erroAtendimentoAtual } = await supabase
    .from('atendimentos')
    .select('notificacao_id')
    .eq('id', atendimentoId)
    .single();

  if (erroAtendimentoAtual) {
    falhar('Erro ao buscar notificação anterior', erroAtendimentoAtual);
  }

  await cancelarNotificacaoAtendimento(atendimentoAtual?.notificacao_id);

  const { data, error } = await supabase
    .from('atendimentos')
    .update({ ...payloadAtendimento(dados), notificacao_id: null })
    .eq('id', atendimentoId)
    .select(selectAtendimento)
    .single();

  if (error) {
    falhar('Erro ao editar atendimento', error);
  }

  return salvarNotificacaoAtendimento(mapearAtendimento(data as AtendimentoRow));
}

export async function cancelarAtendimentoSupabase(atendimentoId: string) {
  const { data: atendimentoAtual, error: erroAtendimentoAtual } = await supabase
    .from('atendimentos')
    .select('notificacao_id')
    .eq('id', atendimentoId)
    .single();

  if (erroAtendimentoAtual) {
    falhar('Erro ao buscar notificação anterior', erroAtendimentoAtual);
  }

  await cancelarNotificacaoAtendimento(atendimentoAtual?.notificacao_id);

  const { data, error } = await supabase
    .from('atendimentos')
    .update({ status: 'cancelado', notificacao_id: null })
    .eq('id', atendimentoId)
    .select(selectAtendimento)
    .single();

  if (error) {
    falhar('Erro ao cancelar atendimento', error);
  }

  return mapearAtendimento(data as AtendimentoRow);
}
