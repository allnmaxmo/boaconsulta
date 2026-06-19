-- =====================================================================
-- BOACONSULTA - ATUALIZACAO 005
-- Correcao de recursao infinita nas policies de RLS
-- =====================================================================
-- Use este arquivo se a atualizacao 004 causou:
-- "infinite recursion detected in policy for relation profissionais".
--
-- Motivo da correcao:
-- - A policy de profissionais consultava atendimentos.
-- - A policy de atendimentos consultava profissionais.
-- - Isso criava um ciclo de RLS.
--
-- Decisao:
-- - Criamos funcoes security definer para checar vinculos internos.
-- - Assim a policy chama uma funcao simples em vez de consultar outra
--   tabela protegida por RLS dentro da propria policy.
-- =====================================================================

create or replace function app.usuario_eh_profissional_do_atendimento(p_profissional_id uuid)
returns boolean
language sql
stable
security definer
set search_path = app, public
as $$
  select exists (
    select 1
    from app.profissionais pr
    where pr.id = p_profissional_id
      and pr.usuario_id = auth.uid()
  );
$$;

create or replace function app.usuario_eh_paciente_do_atendimento(p_paciente_id uuid)
returns boolean
language sql
stable
security definer
set search_path = app, public
as $$
  select exists (
    select 1
    from app.pacientes p
    where p.id = p_paciente_id
      and p.usuario_id = auth.uid()
  );
$$;

create or replace function app.usuario_pode_ler_profissional(p_profissional_id uuid)
returns boolean
language sql
stable
security definer
set search_path = app, public
as $$
  select exists (
    select 1
    from app.atendimentos a
    join app.pacientes p on p.id = a.paciente_id
    where a.profissional_id = p_profissional_id
      and p.usuario_id = auth.uid()
  );
$$;

drop policy if exists "profissionais_select_staff" on app.profissionais;

create policy "profissionais_select_staff"
  on app.profissionais for select
  to authenticated
  using (
    app.eh_staff_clinica()
    or app.usuario_pode_ler_profissional(id)
  );

drop policy if exists "atendimentos_select_staff" on app.atendimentos;

create policy "atendimentos_select_staff"
  on app.atendimentos for select
  to authenticated
  using (
    app.eh_administrador_ou_atendente()
    or app.usuario_eh_profissional_do_atendimento(profissional_id)
    or app.usuario_eh_paciente_do_atendimento(paciente_id)
  );

-- =====================================================================
-- FIM DA ATUALIZACAO 005
-- =====================================================================
