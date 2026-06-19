import { z } from 'zod';

const campoObrigatorio = (nome: string) => z.string().trim().min(1, `${nome} é obrigatório.`);

export const pacienteSchema = z.object({
  nome: campoObrigatorio('Nome completo'),
  telefone: campoObrigatorio('Telefone'),
});

export const profissionalSchema = z.object({
  nome: campoObrigatorio('Nome completo'),
  especialidade: campoObrigatorio('Especialidade'),
});

export const atendimentoSchema = z.object({
  pacienteId: campoObrigatorio('Paciente'),
  profissionalId: campoObrigatorio('Profissional'),
  data: campoObrigatorio('Data'),
  horario: campoObrigatorio('Horário'),
  tipoAtendimento: campoObrigatorio('Tipo de atendimento'),
  lembreteMinutos: campoObrigatorio('Lembrete'),
});

export const atendimentoEdicaoSchema = atendimentoSchema.extend({
  status: z.enum(['agendado', 'realizado', 'cancelado', 'falta'], {
    message: 'Status é obrigatório.',
  }),
});

export type PacienteFormulario = z.infer<typeof pacienteSchema>;
export type ProfissionalFormulario = z.infer<typeof profissionalSchema>;
export type AtendimentoFormulario = z.infer<typeof atendimentoSchema>;
export type AtendimentoEdicaoFormulario = z.infer<typeof atendimentoEdicaoSchema>;

