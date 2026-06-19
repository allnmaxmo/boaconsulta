export type StatusAtendimento = 'agendado' | 'realizado' | 'cancelado' | 'falta';

export type Paciente = {
  id: string;
  usuarioId?: string;
  nome: string;
  telefone: string;
  email?: string;
  avatarUrl?: string;
  observacoes?: string;
};

export type Profissional = {
  id: string;
  usuarioId?: string;
  nome: string;
  especialidade: string;
  telefone?: string;
  avatarUrl?: string;
  ativo?: boolean;
};

export type Atendimento = {
  id: string;
  pacienteId: string;
  profissionalId: string;
  dataHora: string;
  tipoAtendimento: string;
  status: StatusAtendimento;
  duracaoMinutos?: number;
  lembreteMinutos?: number;
  notificacaoId?: string;
  observacoes?: string;
};

export type DadosClinica = {
  pacientes: Paciente[];
  profissionais: Profissional[];
  atendimentos: Atendimento[];
};

export type AtendimentoComRelacionamentos = Atendimento & {
  paciente?: Paciente;
  profissional?: Profissional;
};

