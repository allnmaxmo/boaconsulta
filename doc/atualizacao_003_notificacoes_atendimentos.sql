-- =====================================================================
-- BOACONSULTA — ATUALIZAÇÃO 003
-- Preferência de lembrete para notificações locais de atendimentos
-- =====================================================================
-- Use este arquivo se o schema principal já foi executado.
-- Ele adiciona apenas a coluna necessária para guardar a escolha do usuário.
-- =====================================================================


-- =====================================================================
-- 1. Guarda quantos minutos antes o lembrete deve tocar
-- =====================================================================
-- Motivo:
-- - app.atendimentos já possui notificacao_id para cancelar/reagendar.
-- - faltava guardar a preferência do usuário, exemplo: 30 minutos antes.
-- - a coluna tem default 30 para manter comportamento previsível.
alter table app.atendimentos
  add column if not exists lembrete_minutos integer not null default 30
  check (lembrete_minutos > 0);

comment on column app.atendimentos.lembrete_minutos is
  'Quantidade de minutos antes do atendimento em que a notificação local deve ser disparada.';


-- =====================================================================
-- FIM DA ATUALIZAÇÃO 003
-- =====================================================================
