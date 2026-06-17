import { Atendimento } from '@/src/tipos/dominio';
import { compararMaisRecentePrimeiro, obterData } from '@/src/utilitarios/data';
import { gerarId } from '@/src/utilitarios/id';

export function listarAtendimentosDoDia(
  atendimentos: Atendimento[],
  data: string,
  profissionalId?: string,
) {
  return atendimentos
    .filter((atendimento) => obterData(atendimento.dataHora) === data)
    .filter((atendimento) => !profissionalId || atendimento.profissionalId === profissionalId)
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
}

export function criarAtendimento(dados: Omit<Atendimento, 'id' | 'status'>): Atendimento {
  return {
    id: gerarId('atendimento'),
    status: 'agendado',
    ...dados,
  };
}

export function editarAtendimento(
  atendimento: Atendimento,
  dados: Omit<Atendimento, 'id'>,
): Atendimento {
  return {
    ...atendimento,
    ...dados,
  };
}

export function cancelarAtendimento(atendimento: Atendimento): Atendimento {
  return {
    ...atendimento,
    status: 'cancelado',
  };
}

export function listarHistoricoDoPaciente(atendimentos: Atendimento[], pacienteId: string) {
  return atendimentos
    .filter((atendimento) => atendimento.pacienteId === pacienteId)
    .sort((a, b) => compararMaisRecentePrimeiro(a.dataHora, b.dataHora));
}

