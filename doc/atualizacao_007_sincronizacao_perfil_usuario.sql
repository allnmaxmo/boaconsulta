-- =====================================================================
-- BOACONSULTA — ATUALIZAÇÃO 004
-- Sincronização do perfil do usuário com cadastros vinculados
-- =====================================================================
-- Use este arquivo se o schema principal e a atualização 001 já foram
-- executados. Ele mantém app.usuarios como fonte do perfil do usuário
-- logado sem deixar nome, telefone ou avatar divergirem nas tabelas de
-- negócio vinculadas.
-- =====================================================================


-- =====================================================================
-- 1. Sincroniza dados editáveis do perfil
-- =====================================================================
-- A atualização de app.usuarios já é protegida por RLS. A função usa
-- SECURITY DEFINER somente para conseguir refletir a alteração nas
-- tabelas vinculadas, que não permitem edição direta pelo próprio
-- profissional ou paciente.
create or replace function app.sincronizar_perfil_usuario_vinculado()
returns trigger
language plpgsql
security definer
set search_path = app, public
as $$
begin
  update app.profissionais
  set
    nome = new.nome_completo,
    telefone = new.telefone,
    avatar_url = new.avatar_url
  where usuario_id = new.id;

  update app.pacientes
  set
    nome = new.nome_completo,
    telefone = coalesce(nullif(trim(new.telefone), ''), telefone)
  where usuario_id = new.id;

  return new;
end;
$$;

comment on function app.sincronizar_perfil_usuario_vinculado() is
  'Replica nome, telefone e avatar do perfil do usuário para o cadastro profissional ou paciente vinculado.';


-- =====================================================================
-- 2. Executa somente quando dados sincronizados forem alterados
-- =====================================================================
drop trigger if exists trg_sincronizar_perfil_usuario_vinculado on app.usuarios;
create trigger trg_sincronizar_perfil_usuario_vinculado
  after update of nome_completo, telefone, avatar_url on app.usuarios
  for each row
  when (
    old.nome_completo is distinct from new.nome_completo
    or old.telefone is distinct from new.telefone
    or old.avatar_url is distinct from new.avatar_url
  )
  execute function app.sincronizar_perfil_usuario_vinculado();


-- =====================================================================
-- FIM DA ATUALIZAÇÃO 004
-- =====================================================================
