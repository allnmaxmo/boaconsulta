import { Atendimento, DadosClinica, Paciente, Profissional } from '@/src/tipos/dominio';
import { dataISOHoje } from '@/src/utilitarios/data';

export const pacientesSimulados: Paciente[] = [
  { id: 'paciente-ana', nome: 'Ana Souza', telefone: '(79) 99999-0001' },
  { id: 'paciente-carlos', nome: 'Carlos Lima', telefone: '(79) 99999-0002' },
  { id: 'paciente-marina', nome: 'Marina Alves', telefone: '(79) 99999-0003' },
];

export const profissionaisSimulados: Profissional[] = [
  { id: 'profissional-fernanda', nome: 'Dra. Fernanda Rocha', especialidade: 'Cardiologia' },
  { id: 'profissional-gustavo', nome: 'Dr. Gustavo Mendes', especialidade: 'Ortopedia' },
  { id: 'profissional-paula', nome: 'Dra. Paula Nascimento', especialidade: 'Dermatologia' },
];

export function criarAtendimentosSimulados(): Atendimento[] {
  const hoje = dataISOHoje();

  return [
    {
      id: 'atendimento-1',
      pacienteId: 'paciente-ana',
      profissionalId: 'profissional-fernanda',
      dataHora: `${hoje}T08:30:00`,
      tipoAtendimento: 'Consulta inicial',
      status: 'agendado',
    },
    {
      id: 'atendimento-2',
      pacienteId: 'paciente-carlos',
      profissionalId: 'profissional-gustavo',
      dataHora: `${hoje}T10:00:00`,
      tipoAtendimento: 'Retorno',
      status: 'realizado',
    },
    {
      id: 'atendimento-3',
      pacienteId: 'paciente-marina',
      profissionalId: 'profissional-paula',
      dataHora: `${hoje}T11:30:00`,
      tipoAtendimento: 'Avaliação',
      status: 'cancelado',
    },
    {
      id: 'atendimento-4',
      pacienteId: 'paciente-ana',
      profissionalId: 'profissional-paula',
      dataHora: `${hoje}T15:00:00`,
      tipoAtendimento: 'Exame clínico',
      status: 'agendado',
    },
    {
      id: 'atendimento-5',
      pacienteId: 'paciente-ana',
      profissionalId: 'profissional-fernanda',
      dataHora: '2026-06-10T09:00:00',
      tipoAtendimento: 'Retorno',
      status: 'realizado',
    },
    {
      id: 'atendimento-6',
      pacienteId: 'paciente-carlos',
      profissionalId: 'profissional-paula',
      dataHora: '2026-06-08T14:00:00',
      tipoAtendimento: 'Avaliação',
      status: 'cancelado',
    },
  ];
}

export function obterDadosSimulados(): DadosClinica {
  return {
    pacientes: pacientesSimulados,
    profissionais: profissionaisSimulados,
    atendimentos: criarAtendimentosSimulados(),
  };
}

