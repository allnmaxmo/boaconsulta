export type StatusAtendimento = 'agendado' | 'realizado' | 'cancelado';

export type Paciente = {
  id: string;
  nome: string;
  telefone: string;
};

export type Profissional = {
  id: string;
  nome: string;
  especialidade: string;
};

export type Atendimento = {
  id: string;
  pacienteId: string;
  profissionalId: string;
  dataHora: string;
  tipoAtendimento: string;
  status: StatusAtendimento;
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

