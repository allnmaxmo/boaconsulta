import { Profissional } from '@/src/tipos/dominio';
import { gerarId } from '@/src/utilitarios/id';

export function listarProfissionais(profissionais: Profissional[]) {
  return [...profissionais].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function criarProfissional(dados: Omit<Profissional, 'id'>): Profissional {
  return {
    id: gerarId('profissional'),
    ...dados,
  };
}

export function editarProfissional(
  profissional: Profissional,
  dados: Omit<Profissional, 'id'>,
): Profissional {
  return {
    ...profissional,
    ...dados,
  };
}

export function excluirProfissional(profissionais: Profissional[], profissionalId: string) {
  return profissionais.filter((profissional) => profissional.id !== profissionalId);
}

