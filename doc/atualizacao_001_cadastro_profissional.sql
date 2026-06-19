-- =====================================================================
-- BOACONSULTA — ATUALIZAÇÃO 001
-- Correções de cadastro, vínculo de profissional e segurança de cargo
-- =====================================================================
-- Use este arquivo se o schema principal (doc/banco.sql) já foi executado.
-- Ele aplica apenas as mudanças incrementais necessárias.
-- =====================================================================


-- =====================================================================
-- 1. Atualiza trigger de criação de perfil no Supabase Auth
-- =====================================================================
-- Motivo:
-- - O app agora envia "nome_completo", "telefone" e "cargo".
-- - O banco não deve aceitar qualquer cargo vindo do cliente.
-- - Apenas "paciente" e "profissional" podem vir do cadastro público.
-- - "administrador" e "atendente" devem ser definidos por gestão interna.
create or replace function app.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = app, public
as $$
declare
  v_telefone_meta   text := new.raw_user_meta_data ->> 'telefone';
  v_telefone_norm   text := app.normalizar_telefone(v_telefone_meta);
  v_cargo_meta      app.cargo_usuario := case
    when new.raw_user_meta_data ->> 'cargo' in ('paciente', 'profissional')
      then (new.raw_user_meta_data ->> 'cargo')::app.cargo_usuario
    else 'profissional'
  end;
  v_cargo_final     app.cargo_usuario := v_cargo_meta;
  v_paciente_id     uuid;
  v_profissional_id uuid;
begin
  select id into v_paciente_id
  from app.pacientes
  where usuario_id is null
    and (
      (v_telefone_norm is not null and app.normalizar_telefone(telefone) = v_telefone_norm)
      or (email is not null and email = new.email::citext)
    )
  order by criado_em asc
  limit 1;

  if v_paciente_id is null then
    select id into v_profissional_id
    from app.profissionais
    where usuario_id is null
      and v_telefone_norm is not null
      and app.normalizar_telefone(telefone) = v_telefone_norm
    order by criado_em asc
    limit 1;
  end if;

  if v_paciente_id is not null then
    v_cargo_final := 'paciente';
  elsif v_profissional_id is not null then
    v_cargo_final := 'profissional';
  end if;

  insert into app.usuarios (id, nome_completo, email, telefone, cargo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome_completo', split_part(new.email, '@', 1)),
    new.email,
    v_telefone_meta,
    v_cargo_final
  )
  on conflict (id) do nothing;

  if v_paciente_id is not null then
    update app.pacientes set usuario_id = new.id where id = v_paciente_id;
  elsif v_profissional_id is not null then
    update app.profissionais set usuario_id = new.id where id = v_profissional_id;
  end if;

  return new;
end;
$$;

comment on function app.handle_new_auth_user() is
  'Cria perfil em app.usuarios ao registrar no Auth, limita cargo vindo do cliente e vincula automaticamente paciente/profissional pré-cadastrado.';


-- =====================================================================
-- 2. Protege update do próprio usuário
-- =====================================================================
-- Motivo:
-- - O usuário pode atualizar o próprio perfil.
-- - Mas não pode alterar o próprio cargo nem se reativar sozinho.
drop policy if exists "usuarios_update_proprio_perfil" on app.usuarios;
create policy "usuarios_update_proprio_perfil"
  on app.usuarios for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and cargo = app.cargo_atual()
    and ativo = true
  );


-- =====================================================================
-- 3. Permite cadastro do próprio perfil profissional
-- =====================================================================
-- Motivo:
-- - A tela pública de cadastro cria um login no Supabase Auth.
-- - Depois, o app precisa criar o registro em app.profissionais.
-- - A policy permite isso somente quando usuario_id é o próprio auth.uid().
-- - Assim o usuário não consegue criar perfil em nome de outra conta.
drop policy if exists "profissionais_insert_proprio_cadastro" on app.profissionais;
create policy "profissionais_insert_proprio_cadastro"
  on app.profissionais for insert
  to authenticated
  with check (
    usuario_id = auth.uid()
    and app.cargo_atual() = 'profissional'
  );


-- =====================================================================
-- FIM DA ATUALIZAÇÃO 001
-- =====================================================================
