# Auditoria de telas, botões e requisitos pendentes

## Status geral

O app já possui as rotas centrais de agenda, pacientes, profissionais, autenticação, cadastro, recuperação de senha e formulários de criação/edição. As integrações principais com Supabase também já estão centralizadas em serviços.

Ainda existem pontos de produto que aparecem visualmente na interface, mas não possuem fluxo completo. Estes itens devem ser tratados antes da entrega final para evitar botões decorativos.

## Pendências de alta prioridade

### Perfil do usuário

- `Editar dados`: implementado para nome e telefone do usuário logado.
- Sincronização: a atualização 004 replica nome, telefone e avatar nos cadastros profissional/paciente vinculados.
- `Configurações` e preferências globais de `Notificações`: removidas do perfil enquanto não existe fluxo próprio.
- Estatística de consultas: mostra atendimentos realizados somente no perfil profissional; avaliação foi removida.

### Cadastro e perfil profissional

- O cadastro cria um perfil profissional básico, mas ainda não permite o usuário escolher especialidade no cadastro inicial.
- A tela de edição de profissional edita `nome` e `especialidade`, mas ainda não edita telefone, avatar ou vínculo completo com `app.usuarios`.

### Pacientes

- A tabela `app.pacientes` possui `email` e `observacoes`, mas o formulário atual usa apenas `nome` e `telefone`.
- Exclusão de paciente ainda é exclusão física. Como `pacientes` não possui coluna `ativo`, o banco pode bloquear a remoção se houver atendimentos vinculados.

## Pendências de média prioridade

### Recuperação de senha

- O cartão "Precisa de ajuda?" é visual, mas não possui ação.
- O fluxo envia e-mail pelo Supabase, mas ainda não existe tela de redefinição de senha após o usuário abrir o link.

### Cadastro público

- Textos "Termos de Uso" e "Privacidade" aparecem como destaque visual, mas não abrem documentos/telas.
- Campo CPF é coletado no cadastro, mas o schema atual do banco não possui coluna para CPF em `app.usuarios`, `app.profissionais` ou `app.pacientes`.

### Agenda

- O banco possui campo `notificacao_id`, mas o app ainda não agenda/cancela notificações locais.
- A duração do atendimento existe no banco, mas o formulário ainda não permite escolher `duracao_minutos`.
- A view `app.vw_agenda_do_dia` existe, mas o app consulta diretamente `app.atendimentos` com relacionamentos. Isso funciona, mas a view ainda não está sendo aproveitada.

## Requisitos de atividade que parecem faltar ou estar parciais

- Autenticação protegendo o app inteiro: implementado no layout raiz.
- Cadastro de pacientes: implementado, mas parcial porque falta `email` e `observacoes`.
- Cadastro de profissionais: implementado, mas parcial porque falta `telefone` e avatar.
- Agendamento de atendimento: implementado.
- Impedir conflito de horário: implementado no banco por constraint.
- Cancelar sem apagar histórico: implementado para atendimento.
- Histórico do paciente: implementado na tela de perfil do paciente.
- Controle de permissões com RLS: implementado no banco, mas precisa ser testado com usuários de cargos diferentes.
- Foto de perfil: implementação de código criada, depende de rodar `doc/atualizacao_002_storage_imagem_perfil.sql` no Supabase.
- Notificações: pendente.
- Configurações do usuário: pendente.
- Edição do perfil do usuário logado: implementada para nome e telefone; depende da atualização 004 para sincronizar vínculos.

## Ordem recomendada de execução

1. Rodar `doc/atualizacao_002_storage_imagem_perfil.sql` no Supabase.
2. Testar login, cadastro e troca de foto em um dispositivo/emulador.
3. Rodar `doc/atualizacao_004_sincronizacao_perfil_usuario.sql` no Supabase.
4. Criar tela de configurações, caso existam preferências reais a expor.
5. Criar tela/preferências globais de notificações, caso sejam necessárias além do lembrete por atendimento.
6. Expandir formulário de paciente para `email` e `observacoes`.
7. Expandir formulário de profissional para `telefone`.
8. Implementar notificações locais usando `notificacao_id`.
9. Revisar CPF: ou adicionar ao banco, ou remover do cadastro.
