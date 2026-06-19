-- =====================================================================
-- BOACONSULTA — SCHEMA DE BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- =====================================================================
-- Projeto: BoaConsulta — Agenda de Atendimentos (CajuHub · Mobile I1)
-- Autenticação: auth.users (Supabase Auth)
-- Perfis/Cargos: app.usuarios (1:1 com auth.users)
-- =====================================================================
-- COMO EXECUTAR
-- 1. Abra o SQL Editor do seu projeto Supabase.
-- 2. Cole este arquivo inteiro e rode (RUN). Ele é idempotente: pode
--    rodar de novo sem duplicar nada (usa IF NOT EXISTS / OR REPLACE).
-- 3. Schemas criados: app (tabelas) e o uso do schema nativo auth.
-- =====================================================================


-- =====================================================================
-- 0. EXTENSÕES NECESSÁRIAS (todas no início, antes de qualquer uso)
-- =====================================================================
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "btree_gist"; -- exclusion constraint com igualdade + intervalo
create extension if not exists "citext";     -- e-mail case-insensitive
create extension if not exists "pg_trgm";    -- busca textual (ex: nome do paciente) com índice GIN


-- =====================================================================
-- 1. SCHEMA DEDICADO DA APLICAÇÃO
-- =====================================================================
-- Separar do schema "public" deixa o banco mais profissional/organizado
-- e facilita permissões granulares. O schema "public" fica livre para
-- não conflitar com extensões/outros usos do Supabase.
create schema if not exists app;

comment on schema app is 'Schema da aplicação BoaConsulta: usuários, profissionais, pacientes e atendimentos.';

-- Permite que os roles padrão do Supabase consigam "ver" o schema
grant usage on schema app to anon, authenticated, service_role;


-- =====================================================================
-- 2. TIPOS ENUMERADOS (cargos e status)
-- =====================================================================
-- Cargo do usuário dentro da clínica. Centralizar aqui evita strings
-- soltas e erros de digitação ("admim", "Administrador", etc.).
do $$
begin
  if not exists (select 1 from pg_type where typname = 'cargo_usuario') then
    create type app.cargo_usuario as enum (
      'administrador',   -- gestão total da clínica
      'atendente',       -- recepção: agenda, cadastra pacientes
      'profissional',    -- médico/dentista/psicólogo etc. que atende
      'paciente'         -- acesso restrito ao próprio histórico (uso futuro)
    );
  end if;
end $$;

-- Status do atendimento. Nunca é apagado, apenas muda de status
-- (regra explícita do checklist: histórico completo é preservado).
do $$
begin
  if not exists (select 1 from pg_type where typname = 'status_atendimento') then
    create type app.status_atendimento as enum (
      'agendado',
      'realizado',
      'cancelado',
      'falta'            -- extra: presença/falta (desafio avançado)
    );
  end if;
end $$;

comment on type app.cargo_usuario is 'Papel do usuário dentro da clínica, usado para controle de acesso (RLS).';
comment on type app.status_atendimento is 'Estado atual de um atendimento. Atendimentos cancelados/realizados permanecem no histórico.';


-- =====================================================================
-- 3. FUNÇÃO UTILITÁRIA: updated_at automático
-- =====================================================================
create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function app.set_updated_at() is 'Trigger genérica que atualiza a coluna updated_at em qualquer UPDATE.';


-- =====================================================================
-- 3.1 FUNÇÃO UTILITÁRIA: normalizar telefone
-- =====================================================================
-- Remove tudo que não é dígito, para que "(79) 99999-0001", "79999990001"
-- e "79 99999 0001" sejam tratados como o mesmo telefone na hora de
-- vincular um login (auth.users) a um paciente/profissional já
-- cadastrado pela recepção.
create or replace function app.normalizar_telefone(p_telefone text)
returns text
language sql
immutable
as $$
  select case
    when p_telefone is null then null
    else regexp_replace(p_telefone, '\D', '', 'g')
  end;
$$;

comment on function app.normalizar_telefone(text) is 'Remove caracteres não numéricos do telefone, para comparações confiáveis (ex: vincular login a cadastro existente).';


-- =====================================================================
-- 4. TABELA: app.usuarios
-- =====================================================================
-- Extensão de auth.users (Supabase Auth). Aqui ficam os dados de perfil
-- e, principalmente, o CARGO do usuário — é a peça central para
-- diferenciar administrador / atendente / profissional / paciente.
--
-- Relação 1:1 com auth.users via mesma PK (id) + FK com ON DELETE CASCADE:
-- se o usuário for removido do Auth, o perfil correspondente também sai.
create table if not exists app.usuarios (
  id              uuid primary key references auth.users (id) on delete cascade,
  nome_completo   text not null check (char_length(trim(nome_completo)) > 0),
  email           citext not null,                  -- cópia útil p/ consultas; fonte da verdade é auth.users.email
  telefone        text,
  cargo           app.cargo_usuario not null default 'atendente',
  avatar_url      text,
  ativo           boolean not null default true,     -- desativar acesso sem apagar o usuário
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

comment on table app.usuarios is 'Perfil de cada usuário autenticado (auth.users) com o cargo dentro da clínica.';
comment on column app.usuarios.cargo is 'Controla permissões via RLS: administrador, atendente, profissional ou paciente.';
comment on column app.usuarios.ativo is 'Soft-disable: bloqueia acesso do usuário sem precisar excluir o registro.';

drop trigger if exists trg_usuarios_updated_at on app.usuarios;
create trigger trg_usuarios_updated_at
  before update on app.usuarios
  for each row
  execute function app.set_updated_at();

create index if not exists idx_usuarios_cargo on app.usuarios (cargo);
create unique index if not exists idx_usuarios_email on app.usuarios (email);


-- (A função e o trigger que criam o perfil automaticamente ao cadastrar
-- no Auth ficam definidos mais abaixo, na seção 8.1 — depois das
-- tabelas app.profissionais e app.pacientes existirem, porque o
-- vínculo automático por telefone/e-mail consulta essas duas tabelas.)

-- =====================================================================
-- 5. FUNÇÕES AUXILIARES DE AUTORIZAÇÃO (usadas pelas policies de RLS)
-- =====================================================================
-- Retorna o cargo do usuário autenticado na requisição atual.
create or replace function app.cargo_atual()
returns app.cargo_usuario
language sql
stable
security definer
set search_path = app, public
as $$
  select cargo from app.usuarios where id = auth.uid();
$$;

comment on function app.cargo_atual() is 'Retorna o cargo do usuário logado (auth.uid()). Usado nas policies de RLS.';

-- Atalhos booleanos para deixar as policies mais legíveis.
create or replace function app.eh_administrador()
returns boolean language sql stable security definer set search_path = app, public as $$
  select app.cargo_atual() = 'administrador';
$$;

create or replace function app.eh_administrador_ou_atendente()
returns boolean language sql stable security definer set search_path = app, public as $$
  select app.cargo_atual() in ('administrador', 'atendente');
$$;

create or replace function app.eh_staff_clinica()
returns boolean language sql stable security definer set search_path = app, public as $$
  -- "Staff" = todo mundo que trabalha na clínica (não é o paciente final)
  select app.cargo_atual() in ('administrador', 'atendente', 'profissional');
$$;

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


-- =====================================================================
-- 6. TABELA: app.profissionais
-- =====================================================================
-- Profissional da clínica (médico, dentista, psicólogo, etc.).
-- Vínculo opcional com um usuário do sistema (caso o profissional
-- também faça login no app para ver a própria agenda).
create table if not exists app.profissionais (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid references app.usuarios (id) on delete set null,
  nome            text not null check (char_length(trim(nome)) > 0),
  especialidade   text not null,                -- ex: cardiologia, ortopedia, dermatologia
  telefone        text,
  avatar_url      text,
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

comment on table app.profissionais is 'Profissionais que atendem na clínica (médicos, dentistas, etc).';
comment on column app.profissionais.usuario_id is 'Liga o profissional a um login do app, se ele também acessar o sistema.';
comment on column app.profissionais.ativo is 'Desativa o profissional sem apagar histórico de atendimentos já vinculados a ele.';

drop trigger if exists trg_profissionais_updated_at on app.profissionais;
create trigger trg_profissionais_updated_at
  before update on app.profissionais
  for each row
  execute function app.set_updated_at();

create index if not exists idx_profissionais_especialidade on app.profissionais (especialidade);
create index if not exists idx_profissionais_ativo on app.profissionais (ativo);


-- =====================================================================
-- 7. TABELA: app.pacientes
-- =====================================================================
create table if not exists app.pacientes (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid references app.usuarios (id) on delete set null, -- uso futuro: paciente logado
  nome            text not null check (char_length(trim(nome)) > 0),
  telefone        text not null,
  email           citext,
  avatar_url      text,
  observacoes     text,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

comment on table app.pacientes is 'Pacientes cadastrados pela recepção. Vínculo com usuario_id é opcional (uso futuro de login do paciente).';

drop trigger if exists trg_pacientes_updated_at on app.pacientes;
create trigger trg_pacientes_updated_at
  before update on app.pacientes
  for each row
  execute function app.set_updated_at();

create index if not exists idx_pacientes_nome on app.pacientes using gin (nome gin_trgm_ops);
create index if not exists idx_pacientes_telefone on app.pacientes (telefone);

-- Índices de apoio para localizar rapidamente um cadastro "órfão"
-- (sem usuario_id ainda) por telefone normalizado ou e-mail, no
-- momento em que a pessoa cria login pela primeira vez.
create index if not exists idx_pacientes_telefone_norm
  on app.pacientes (app.normalizar_telefone(telefone))
  where usuario_id is null;

create index if not exists idx_pacientes_email_pendente
  on app.pacientes (email)
  where usuario_id is null and email is not null;

create index if not exists idx_profissionais_telefone_norm
  on app.profissionais (app.normalizar_telefone(telefone))
  where usuario_id is null;


-- =====================================================================
-- 7.1 FUNÇÃO + TRIGGER: criar perfil ao cadastrar no Auth, com VÍNCULO
-- AUTOMÁTICO a um paciente/profissional já cadastrado pela recepção
-- =====================================================================
-- Cenário que esta função resolve:
--   1. O atendente cadastra um paciente (ou profissional) direto em
--      app.pacientes / app.profissionais, com telefone e/ou e-mail.
--      Nesse momento NÃO existe login — é só um registro de cadastro.
--   2. Essa mesma pessoa, depois, cria uma conta no app (signUp) usando
--      o mesmo telefone ou e-mail que o atendente já cadastrou.
--   3. Esta função, disparada em AFTER INSERT em auth.users, procura
--      um registro "órfão" (usuario_id ainda nulo) com o mesmo
--      telefone normalizado ou e-mail e faz o vínculo automaticamente,
--      além de ajustar o cargo do novo usuário para bater com o que
--      foi encontrado (paciente → cargo paciente; profissional → cargo
--      profissional). Se nada for encontrado, segue o fluxo padrão.
--
-- Exemplo no app (Supabase JS):
-- supabase.auth.signUp({
--   email, password,
--   options: { data: { nome_completo, telefone, cargo: 'atendente' } }
-- })
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
  -- 1) Procura um PACIENTE já cadastrado pela recepção, ainda sem login,
  --    pelo mesmo telefone (normalizado) ou pelo mesmo e-mail.
  select id into v_paciente_id
  from app.pacientes
  where usuario_id is null
    and (
      (v_telefone_norm is not null and app.normalizar_telefone(telefone) = v_telefone_norm)
      or (email is not null and email = new.email::citext)
    )
  order by criado_em asc
  limit 1;

  -- 2) Se não achou paciente, procura um PROFISSIONAL nas mesmas condições.
  if v_paciente_id is null then
    select id into v_profissional_id
    from app.profissionais
    where usuario_id is null
      and v_telefone_norm is not null
      and app.normalizar_telefone(telefone) = v_telefone_norm
    order by criado_em asc
    limit 1;
  end if;

  -- 3) Define o cargo final: se encontrou vínculo, o cargo do
  --    cadastro existente tem prioridade sobre o que veio no metadata
  --    (evita que alguém se autodeclare "administrador" só porque
  --    preencheu o campo errado no app).
  if v_paciente_id is not null then
    v_cargo_final := 'paciente';
  elsif v_profissional_id is not null then
    v_cargo_final := 'profissional';
  end if;

  -- 4) Cria o perfil em app.usuarios.
  insert into app.usuarios (id, nome_completo, email, telefone, cargo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome_completo', split_part(new.email, '@', 1)),
    new.email,
    v_telefone_meta,
    v_cargo_final
  )
  on conflict (id) do nothing;

  -- 5) Efetiva o vínculo nas tabelas de negócio, se encontrado.
  if v_paciente_id is not null then
    update app.pacientes set usuario_id = new.id where id = v_paciente_id;
  elsif v_profissional_id is not null then
    update app.profissionais set usuario_id = new.id where id = v_profissional_id;
  end if;

  return new;
end;
$$;

comment on function app.handle_new_auth_user() is 'Cria o perfil em app.usuarios ao registrar no Auth e vincula automaticamente a um paciente/profissional pré-cadastrado pela recepção (mesmo telefone ou e-mail).';

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row
  execute function app.handle_new_auth_user();


-- =====================================================================
-- 8. TABELA: app.atendimentos
-- =====================================================================
-- Núcleo do sistema. Cada atendimento liga 1 paciente + 1 profissional
-- em uma data/hora específica.
create table if not exists app.atendimentos (
  id                  uuid primary key default gen_random_uuid(),
  paciente_id         uuid not null references app.pacientes (id) on delete restrict,
  profissional_id     uuid not null references app.profissionais (id) on delete restrict,
  criado_por          uuid references app.usuarios (id) on delete set null, -- quem agendou (auditoria)
  data_atendimento    date not null,
  hora_atendimento    time not null,
  duracao_minutos     integer not null default 30 check (duracao_minutos > 0),
  lembrete_minutos     integer not null default 30 check (lembrete_minutos > 0),
  tipo_atendimento    text not null,             -- ex: consulta, retorno, exame
  status              app.status_atendimento not null default 'agendado',
  observacoes         text,
  notificacao_id      text,                      -- identificador da notificação local (expo-notifications) no dispositivo
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),

  -- Colunas calculadas (NÃO são "generated column" do Postgres):
  -- juntam data + hora num único timestamptz, usadas pela exclusion
  -- constraint de conflito de horário (item 9). Não usamos
  -- "GENERATED ALWAYS AS" aqui porque "at time zone 'America/Sao_Paulo'"
  -- depende de regras de fuso/horário de verão e por isso o Postgres
  -- classifica essa expressão como STABLE, não IMMUTABLE — e colunas
  -- geradas exigem IMMUTABLE (erro 42P17). Em vez disso, preenchemos
  -- estes dois campos via trigger (ver app.preparar_atendimento
  -- mais abaixo), o que tem o mesmo efeito prático.
  inicio_em           timestamptz,
  fim_em              timestamptz
);

comment on table app.atendimentos is 'Agendamentos da clínica. Nunca são excluídos: o cancelamento apenas altera o status.';
comment on column app.atendimentos.notificacao_id is 'ID retornado pelo expo-notifications no dispositivo, para permitir cancelar/reagendar o lembrete local.';
comment on column app.atendimentos.criado_por is 'Usuário (recepção/atendente) que criou o agendamento — auditoria.';

drop trigger if exists trg_atendimentos_updated_at on app.atendimentos;
create trigger trg_atendimentos_updated_at
  before update on app.atendimentos
  for each row
  execute function app.set_updated_at();


-- =====================================================================
-- 8.1 FUNÇÃO + TRIGGER: calcular inicio_em/fim_em e validar data/hora
-- =====================================================================
-- Substitui a "generated column" que não pôde ser usada, porque
-- "at time zone 'America/Sao_Paulo'" depende de regras de fuso/horário
-- de verão e por isso o Postgres a classifica como STABLE, não
-- IMMUTABLE — e colunas geradas exigem IMMUTABLE (erro 42P17).
--
-- Em vez disso, um único trigger BEFORE INSERT/UPDATE preenche
-- inicio_em/fim_em e, na sequência, já valida que um atendimento
-- "agendado" não fique no passado. Unificar as duas coisas num só
-- trigger evita depender da ordem de execução entre triggers.
create or replace function app.preparar_atendimento()
returns trigger
language plpgsql
as $$
begin
  new.inicio_em := (new.data_atendimento + new.hora_atendimento) at time zone 'America/Sao_Paulo';
  new.fim_em     := new.inicio_em + (new.duracao_minutos || ' minutes')::interval;

  if new.status = 'agendado' and new.inicio_em < now() then
    raise exception 'Não é possível agendar um atendimento em data/hora passada.';
  end if;

  return new;
end;
$$;

comment on function app.preparar_atendimento() is 'Preenche inicio_em/fim_em a partir de data_atendimento, hora_atendimento e duracao_minutos, e impede agendar no passado.';

drop trigger if exists trg_preparar_atendimento on app.atendimentos;
create trigger trg_preparar_atendimento
  before insert or update on app.atendimentos
  for each row
  execute function app.preparar_atendimento();


-- =====================================================================
-- 9. REGRA DE NEGÓCIO CRÍTICA: impedir conflito de horário
-- =====================================================================
-- "Impedir agendamento em horário já ocupado para o mesmo profissional"
-- é a regra mais importante do projeto. Em vez de confiar só no
-- backend, garantimos isso TAMBÉM no banco com uma EXCLUSION
-- CONSTRAINT: o Postgres recusa o INSERT/UPDATE se dois atendimentos
-- do MESMO profissional tiverem intervalos de tempo que se sobrepõem
-- — e somente quando o status não é 'cancelado' (atendimento cancelado
-- libera o horário, conforme pedido no checklist).
alter table app.atendimentos
  drop constraint if exists atendimentos_sem_conflito_horario;

alter table app.atendimentos
  add constraint atendimentos_sem_conflito_horario
  exclude using gist (
    profissional_id with =,
    tstzrange(inicio_em, fim_em, '[)') with &&
  )
  where (status <> 'cancelado');

comment on constraint atendimentos_sem_conflito_horario on app.atendimentos is
  'Impede dois atendimentos com horários sobrepostos para o mesmo profissional (ignora atendimentos cancelados).';

-- Índices de apoio (consultas mais comuns do app: agenda do dia,
-- filtro por profissional, filtro por paciente — exigidos no checklist).
create index if not exists idx_atendimentos_data on app.atendimentos (data_atendimento);
create index if not exists idx_atendimentos_profissional on app.atendimentos (profissional_id);
create index if not exists idx_atendimentos_paciente on app.atendimentos (paciente_id);
create index if not exists idx_atendimentos_status on app.atendimentos (status);
create index if not exists idx_atendimentos_data_profissional on app.atendimentos (data_atendimento, profissional_id);


-- =====================================================================
-- 10. VIEW: agenda do dia (facilita o "Listar agenda do dia")
-- =====================================================================
create or replace view app.vw_agenda_do_dia as
select
  a.id,
  a.data_atendimento,
  a.hora_atendimento,
  a.tipo_atendimento,
  a.status,
  a.duracao_minutos,
  p.id   as paciente_id,
  p.nome as paciente_nome,
  p.telefone as paciente_telefone,
  pr.id   as profissional_id,
  pr.nome as profissional_nome,
  pr.especialidade as profissional_especialidade
from app.atendimentos a
join app.pacientes p     on p.id = a.paciente_id
join app.profissionais pr on pr.id = a.profissional_id;

comment on view app.vw_agenda_do_dia is 'View de leitura simplificada para a tela "Agenda do dia", já com nomes de paciente e profissional.';


-- =====================================================================
-- 11. VIEW: taxa de comparecimento (desafio extra avançado)
-- =====================================================================
create or replace view app.vw_taxa_comparecimento as
select
  pr.id as profissional_id,
  pr.nome as profissional_nome,
  count(*) filter (where a.status in ('realizado', 'falta')) as total_concluidos,
  count(*) filter (where a.status = 'realizado') as total_realizados,
  case
    when count(*) filter (where a.status in ('realizado', 'falta')) = 0 then 0
    else round(
      100.0 * count(*) filter (where a.status = 'realizado')
      / count(*) filter (where a.status in ('realizado', 'falta')),
      2
    )
  end as taxa_comparecimento_pct
from app.profissionais pr
left join app.atendimentos a on a.profissional_id = pr.id
group by pr.id, pr.nome;

comment on view app.vw_taxa_comparecimento is 'Calcula a taxa de comparecimento (realizados / concluídos) por profissional — desafio extra do checklist.';


-- =====================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =====================================================================
-- Habilita RLS em todas as tabelas. Sem nenhuma policy, o acesso fica
-- bloqueado por padrão — depois liberamos exatamente o necessário.
alter table app.usuarios       enable row level security;
alter table app.profissionais  enable row level security;
alter table app.pacientes      enable row level security;
alter table app.atendimentos   enable row level security;

-- ---------------------------------------------------------------------
-- 12.1 app.usuarios
-- ---------------------------------------------------------------------
drop policy if exists "usuarios_select_proprio_ou_staff" on app.usuarios;
create policy "usuarios_select_proprio_ou_staff"
  on app.usuarios for select
  to authenticated
  using (
    id = auth.uid()
    or app.eh_administrador_ou_atendente()
  );

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

drop policy if exists "usuarios_admin_gerencia_tudo" on app.usuarios;
create policy "usuarios_admin_gerencia_tudo"
  on app.usuarios for all
  to authenticated
  using (app.eh_administrador())
  with check (app.eh_administrador());

-- ---------------------------------------------------------------------
-- 12.2 app.profissionais — qualquer membro autenticado da clínica lê;
-- só administrador/atendente cadastram e editam.
-- ---------------------------------------------------------------------
drop policy if exists "profissionais_select_staff" on app.profissionais;
create policy "profissionais_select_staff"
  on app.profissionais for select
  to authenticated
  using (
    app.eh_staff_clinica()
    or app.usuario_pode_ler_profissional(id)
  );

drop policy if exists "profissionais_insert_admin_atendente" on app.profissionais;
create policy "profissionais_insert_admin_atendente"
  on app.profissionais for insert
  to authenticated
  with check (app.eh_administrador_ou_atendente());

drop policy if exists "profissionais_insert_proprio_cadastro" on app.profissionais;
create policy "profissionais_insert_proprio_cadastro"
  on app.profissionais for insert
  to authenticated
  with check (
    usuario_id = auth.uid()
    and app.cargo_atual() = 'profissional'
  );

drop policy if exists "profissionais_update_admin_atendente" on app.profissionais;
create policy "profissionais_update_admin_atendente"
  on app.profissionais for update
  to authenticated
  using (app.eh_administrador_ou_atendente())
  with check (app.eh_administrador_ou_atendente());

drop policy if exists "profissionais_delete_admin" on app.profissionais;
create policy "profissionais_delete_admin"
  on app.profissionais for delete
  to authenticated
  using (app.eh_administrador());

-- ---------------------------------------------------------------------
-- 12.3 app.pacientes — staff da clínica gerencia; paciente logado
-- (uso futuro) só vê o próprio cadastro.
-- ---------------------------------------------------------------------
drop policy if exists "pacientes_select_staff_ou_proprio" on app.pacientes;
create policy "pacientes_select_staff_ou_proprio"
  on app.pacientes for select
  to authenticated
  using (
    app.eh_staff_clinica()
    or usuario_id = auth.uid()
  );

drop policy if exists "pacientes_insert_staff" on app.pacientes;
create policy "pacientes_insert_staff"
  on app.pacientes for insert
  to authenticated
  with check (app.eh_staff_clinica());

drop policy if exists "pacientes_update_staff" on app.pacientes;
create policy "pacientes_update_staff"
  on app.pacientes for update
  to authenticated
  using (app.eh_staff_clinica())
  with check (app.eh_staff_clinica());

drop policy if exists "pacientes_delete_admin" on app.pacientes;
create policy "pacientes_delete_admin"
  on app.pacientes for delete
  to authenticated
  using (app.eh_administrador());

-- ---------------------------------------------------------------------
-- 12.4 app.atendimentos — staff gerencia; profissional vê a própria
-- agenda; paciente logado (uso futuro) vê apenas os próprios atendimentos.
-- ---------------------------------------------------------------------
drop policy if exists "atendimentos_select_staff" on app.atendimentos;
create policy "atendimentos_select_staff"
  on app.atendimentos for select
  to authenticated
  using (
    app.eh_administrador_ou_atendente()
    or app.usuario_eh_profissional_do_atendimento(profissional_id)
    or app.usuario_eh_paciente_do_atendimento(paciente_id)
  );

drop policy if exists "atendimentos_insert_staff" on app.atendimentos;
create policy "atendimentos_insert_staff"
  on app.atendimentos for insert
  to authenticated
  with check (app.eh_administrador_ou_atendente());

drop policy if exists "atendimentos_update_staff" on app.atendimentos;
create policy "atendimentos_update_staff"
  on app.atendimentos for update
  to authenticated
  using (app.eh_administrador_ou_atendente())
  with check (app.eh_administrador_ou_atendente());

-- Cancelamento/exclusão física nunca é permitida via policy de DELETE:
-- a regra do projeto é "não apagar atendimentos, apenas mudar status".
-- Por isso, propositalmente NÃO criamos policy de DELETE para staff;
-- apenas administrador pode remover em caso excepcional (ex: erro de
-- cadastro), via policy isolada abaixo.
drop policy if exists "atendimentos_delete_somente_admin" on app.atendimentos;
create policy "atendimentos_delete_somente_admin"
  on app.atendimentos for delete
  to authenticated
  using (app.eh_administrador());


-- =====================================================================
-- 13. GRANTS DE SCHEMA (necessário pois RLS substitui, não acumula,
-- os privilégios de tabela do Postgres)
-- =====================================================================
grant select, insert, update, delete on all tables in schema app to authenticated;
grant select on app.vw_agenda_do_dia, app.vw_taxa_comparecimento to authenticated;
grant usage on all sequences in schema app to authenticated;

-- service_role (usado pelo backend/admin) tem acesso irrestrito por
-- padrão no Supabase e ignora RLS — nenhuma grant extra é necessária.


-- =====================================================================
-- 14. DADOS DE REFERÊNCIA (opcional) — exemplo de seed para dev/teste
-- =====================================================================
-- Descomente para popular dados de exemplo em ambiente de desenvolvimento.
--
-- insert into app.profissionais (nome, especialidade, telefone) values
--   ('Dra. Ana Souza',   'cardiologia',   '(79) 99999-0001'),
--   ('Dr. Bruno Lima',   'ortopedia',     '(79) 99999-0002'),
--   ('Dra. Carla Dias',  'dermatologia',  '(79) 99999-0003');
--
-- insert into app.pacientes (nome, telefone) values
--   ('João Pereira', '(79) 98888-1111'),
--   ('Maria Santos',  '(79) 98888-2222');


-- =====================================================================
-- FIM DO SCHEMA
-- =====================================================================
