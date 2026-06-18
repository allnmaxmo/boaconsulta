export type StatusAtendimento = 'agendado' | 'realizado' | 'cancelado' | 'falta';

export type Paciente = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  observacoes?: string;
};

export type Profissional = {
  id: string;
  nome: string;
  especialidade: string;
  telefone?: string;
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

