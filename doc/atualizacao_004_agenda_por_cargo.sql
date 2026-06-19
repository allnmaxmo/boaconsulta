-- =====================================================================
-- BOACONSULTA - ATUALIZACAO 004
-- Ajuste de leitura de profissionais para agenda do paciente
-- =====================================================================
-- Use este arquivo se o schema principal ja foi executado.
-- Ele permite que o paciente leia apenas profissionais vinculados aos
-- proprios atendimentos.
-- =====================================================================

drop policy if exists "profissionais_select_staff" on app.profissionais;

create policy "profissionais_select_staff"
  on app.profissionais for select
  to authenticated
  using (
    app.eh_staff_clinica()
    or exists (
      select 1
      from app.atendimentos a
      join app.pacientes p on p.id = a.paciente_id
      where a.profissional_id = app.profissionais.id
        and p.usuario_id = auth.uid()
    )
  );

-- =====================================================================
-- FIM DA ATUALIZACAO 004
-- =====================================================================
