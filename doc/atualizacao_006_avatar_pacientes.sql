-- =====================================================================
-- BOACONSULTA - ATUALIZACAO 006
-- Adiciona imagem de perfil tambem na tabela de pacientes
-- =====================================================================
-- Motivo:
-- - A tela de pacientes agora exibe miniatura ao lado do nome.
-- - Profissionais ja possuem avatar_url.
-- - Pacientes precisam da mesma coluna para manter a interface consistente.
-- =====================================================================

alter table app.pacientes
  add column if not exists avatar_url text;

-- =====================================================================
-- FIM DA ATUALIZACAO 006
-- =====================================================================
