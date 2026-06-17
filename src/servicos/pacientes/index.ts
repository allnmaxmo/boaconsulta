import { Paciente } from '@/src/tipos/dominio';
import { gerarId } from '@/src/utilitarios/id';

export function listarPacientes(pacientes: Paciente[]) {
  return [...pacientes].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function criarPaciente(dados: Omit<Paciente, 'id'>): Paciente {
  return {
    id: gerarId('paciente'),
    ...dados,
  };
}

export function editarPaciente(paciente: Paciente, dados: Omit<Paciente, 'id'>): Paciente {
  return {
    ...paciente,
    ...dados,
  };
}

export function excluirPaciente(pacientes: Paciente[], pacienteId: string) {
  return pacientes.filter((paciente) => paciente.id !== pacienteId);
}

