# BoaConsulta

Aplicativo mobile desenvolvido com **React Native + Expo** para gerenciamento de atendimentos em uma clínica.  
O projeto permite cadastrar pacientes e profissionais, agendar consultas, acompanhar a agenda diária/semanal, cancelar ou editar atendimentos e receber lembretes por notificação local.

## Grupo

Projeto desenvolvido pela **Turma 3B Noite** do curso **JovemTech — módulo React Native**.

Integrantes:

- Israel
- Allan
- Felipe
- Vanessa

## Objetivo do Projeto

O **BoaConsulta** foi criado para simular um sistema real de recepção clínica, onde diferentes tipos de usuários acessam o aplicativo com permissões diferentes:

- **Administrador/Atendente:** gerencia pacientes, profissionais e agendamentos.
- **Profissional:** visualiza a própria agenda e seus atendimentos.
- **Paciente:** visualiza os próprios atendimentos e dados de perfil.

A proposta principal é demonstrar integração entre aplicativo mobile, banco de dados em nuvem, autenticação, controle de acesso, persistência de dados e recursos nativos do celular.

## Funcionalidades

### Funcionalidades obrigatórias

- Agendar um atendimento.
- Listar a agenda do dia.
- Filtrar agenda por profissional.
- Editar um agendamento.
- Cancelar um agendamento.
- Agendar notificação local de lembrete.
- Persistir dados no backend usando Supabase.

### Funcionalidades extras implementadas

- Bloqueio de horários conflitantes para o mesmo profissional.
- Visão semanal da agenda, além da visão diária.
- Marcação de status do atendimento:
  - Agendado
  - Realizado
  - Cancelado
  - Falta
- Cálculo de taxa de comparecimento.
- Controle de telas visíveis por cargo do usuário.
- Upload e exibição de imagem de perfil.
- Dropdown pesquisável para selecionar paciente e profissional.
- Seletores nativos de data e horário.

## Tecnologias Utilizadas

- **React Native**
- **Expo SDK 54**
- **Expo Router**
- **TypeScript**
- **Supabase**
- **PostgreSQL**
- **Row Level Security (RLS)**
- **Expo Notifications**
- **Expo Image Picker**
- **React Hook Form**
- **Zod**
- **React Native Reanimated**

## Estrutura do Projeto

```text
boaconsulta/
├── app/                         # Rotas do Expo Router
├── assets/                      # Imagens, fontes e recursos estáticos
├── doc/                         # Scripts SQL do banco de dados
├── src/
│   ├── componentes/             # Componentes reutilizáveis
│   ├── constantes/              # Tema, cores e configurações visuais
│   ├── contextos/               # Contextos globais da aplicação
│   ├── dados/                   # Dados simulados de apoio
│   ├── servicos/                # Integrações com Supabase e recursos nativos
│   ├── telas/                   # Telas principais do aplicativo
│   ├── tipos/                   # Tipagens do domínio
│   ├── utilitarios/             # Funções auxiliares
│   └── validacoes/              # Schemas de validação dos formulários
├── app.json                     # Configuração do Expo
├── package.json                 # Dependências e scripts
└── README.md
```

## Banco de Dados

O banco principal está documentado no arquivo:

```text
doc/banco.sql
```

Esse arquivo cria o schema `app`, tabelas, funções, triggers, views, índices e políticas de segurança.

### Principais tabelas

- `app.usuarios`: dados do usuário autenticado e cargo no sistema.
- `app.pacientes`: cadastro dos pacientes.
- `app.profissionais`: cadastro dos profissionais da clínica.
- `app.atendimentos`: agendamentos realizados no sistema.

### Segurança com RLS

O projeto utiliza **Row Level Security** para controlar o acesso aos dados.

Exemplos:

- Paciente só acessa dados vinculados a ele.
- Profissional vê a própria agenda.
- Atendente e administrador têm acesso às rotinas de gerenciamento.
- Apenas cargos autorizados conseguem criar, editar ou cancelar atendimentos.

### Regra de conflito de horários

Para impedir dois atendimentos no mesmo horário para o mesmo profissional, o banco usa uma constraint chamada:

```text
atendimentos_sem_conflito_horario
```

Ela fica na tabela `app.atendimentos` e impede que dois intervalos de tempo se sobreponham para o mesmo `profissional_id`, ignorando atendimentos cancelados.

Essa decisão é importante porque a regra fica protegida no banco, não apenas na interface do aplicativo.

## Atualizações SQL

Além do `doc/banco.sql`, existem arquivos incrementais para atualizar bancos que já tinham sido criados:

```text
doc/atualizacao_001_cadastro_profissional.sql
doc/atualizacao_002_storage_imagem_perfil.sql
doc/atualizacao_003_notificacoes_atendimentos.sql
doc/atualizacao_004_agenda_por_cargo.sql
doc/atualizacao_005_corrige_recursao_rls.sql
doc/atualizacao_006_avatar_pacientes.sql
doc/atualizacao_007_sincronizacao_perfil_usuario.sql
```

Use esses arquivos quando o banco já estiver em produção/desenvolvimento e não for seguro rodar o `banco.sql` inteiro novamente.

## Conexão com Supabase

A conexão com o Supabase é feita no serviço:

```text
src/servicos/supabase.ts
```

Esse arquivo centraliza o cliente Supabase, usando variáveis públicas do Expo:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

As operações da clínica ficam concentradas em:

```text
src/servicos/clinicaSupabase.ts
```

Esse serviço é responsável por:

- Buscar pacientes, profissionais e atendimentos.
- Criar pacientes e profissionais.
- Criar, editar e cancelar atendimentos.
- Salvar o identificador da notificação local.
- Mapear os nomes do banco para os nomes usados no código.

## Notificações

As notificações locais são implementadas com:

```text
src/servicos/notificacoes.ts
```

O aplicativo solicita permissão ao usuário e agenda um lembrete local com base no horário do atendimento.

Quando um atendimento é:

- **Criado:** uma notificação local é agendada.
- **Editado:** a notificação antiga é cancelada e uma nova é criada.
- **Cancelado:** a notificação antiga é cancelada.

Importante: a notificação atual é **local**, ou seja, é agendada no dispositivo pelo próprio aplicativo. Não é uma push notification enviada por servidor.

## Fluxo de Agendamento

1. O atendente/admin acessa a agenda.
2. Clica em novo agendamento.
3. Seleciona paciente e profissional usando dropdown pesquisável.
4. Escolhe data e horário usando seletores nativos.
5. Define tipo de atendimento e tempo de lembrete.
6. O app envia os dados ao Supabase.
7. O banco valida regras como horário ocupado e data passada.
8. O app agenda a notificação local.
9. O atendimento aparece na agenda.

## Perfis de Usuário

### Administrador/Atendente

- Visualiza agenda geral.
- Filtra por profissional.
- Acessa pacientes e profissionais.
- Cria, edita e cancela atendimentos.
- Visualiza visão diária e semanal.
- Acompanha taxa de comparecimento.

### Profissional

- Visualiza apenas a própria agenda.
- Acessa visão diária e semanal.
- Acompanha taxa de comparecimento dos próprios atendimentos.
- Acessa perfil.

### Paciente

- Visualiza os próprios atendimentos.
- Acessa perfil.
- Não visualiza telas administrativas.

## Como Executar

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm run start
```

Outros comandos:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

O arquivo `.env` é ignorado pelo Git para proteger as chaves locais.

## Validação e Qualidade

Durante o desenvolvimento foram usados:

```bash
npx tsc --noEmit
npm run lint
```

Esses comandos ajudam a validar tipagem TypeScript e padrões do Expo/React Native.

## Observações para Defesa

Pontos importantes para explicar na apresentação:

- O app não guarda os dados apenas localmente; tudo é persistido no Supabase.
- A regra de horário ocupado é garantida pelo banco, não somente pelo front-end.
- As permissões são controladas por cargo e reforçadas por RLS.
- As notificações são locais e dependem da permissão do dispositivo.
- A visão semanal e a taxa de comparecimento foram implementadas como desafios extras.
- A organização em serviços, contextos e componentes facilita manutenção e evolução do projeto.

## Status do Projeto

Projeto em versão acadêmica funcional, com foco em demonstrar:

- Integração mobile com backend.
- Autenticação e controle de acesso.
- CRUD completo.
- Validação de regras de negócio.
- Uso de recursos nativos do celular.
- Boas práticas de organização em React Native.
