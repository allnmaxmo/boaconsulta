# Material de estudo - BoaConsulta

Este arquivo é um guia local para estudo e apresentação técnica do projeto. Ele não deve subir para o GitHub.

## 1. Visão geral do projeto

O BoaConsulta é um aplicativo Expo/React Native para gestão de uma clínica. O app organiza pacientes, profissionais e atendimentos, usando Expo Router para navegação, React Context para estado em memória e Supabase como backend/banco de dados.

Principais áreas do app:

- Agenda do dia: lista atendimentos por data e permite filtrar por profissional.
- Pacientes: cadastro, edição, exclusão e perfil com histórico.
- Profissionais: cadastro, edição e exclusão.
- Agendamentos: criação, edição, status e cancelamento.
- Perfil: aba protegida por login com Supabase Auth.
- Autenticação: login, cadastro, recuperação de senha e persistência de sessão.

Arquivos importantes:

- `app/`: rotas do Expo Router.
- `app/(tabs)/_layout.tsx`: menu inferior.
- `app/(tabs)/perfil.tsx`: decide se mostra login ou perfil.
- `src/contextos/DadosClinicaContexto.tsx`: estado central da clínica.
- `src/servicos/clinicaSupabase.ts`: leitura e escrita dos dados no Supabase.
- `src/servicos/supabase.ts`: configuração do cliente Supabase.
- `src/tipos/dominio.ts`: modelos principais do domínio.
- `src/validacoes/formularios.ts`: validações dos formulários no app.

## 2. Funcionalidades principais

Agenda:

- Busca atendimentos carregados do Supabase.
- Filtra atendimentos pela data atual.
- Permite filtrar por profissional.
- Abre detalhes/edição de atendimento.
- Abre perfil do paciente a partir do atendimento.

Pacientes:

- Lista pacientes.
- Cria, edita e exclui pacientes.
- Exibe perfil do paciente.
- Exibe histórico de atendimentos do paciente.

Profissionais:

- Lista profissionais ativos.
- Cria, edita e exclui profissionais.
- Usa especialidade para identificar o atendimento do profissional.

Atendimentos:

- Cria atendimento ligando paciente, profissional, data, horário e tipo.
- Edita atendimento existente.
- Permite alterar status: `agendado`, `realizado`, `cancelado`, `falta`.
- Cancela atendimento sem apagar o registro.

Perfil e autenticação:

- A aba Perfil verifica a sessão com `supabase.auth.getSession()`.
- Se não houver sessão, mostra `TelaLogin`.
- Se houver sessão, mostra `PerfilUsuario`.
- Login usa `signInWithPassword`.
- Cadastro usa `signUp`.
- Recuperação de senha usa `resetPasswordForEmail`.
- Logout usa `signOut`.
- A sessão é persistida via `AsyncStorage`.

## 3. Como os dados são persistidos

Os dados principais ficam persistidos no Supabase, que usa PostgreSQL por baixo.

O app consulta e grava dados por meio de `src/servicos/clinicaSupabase.ts`. Esse arquivo traduz os nomes do banco para os tipos usados no app:

- Banco: `paciente_id`, `profissional_id`, `data_atendimento`, `hora_atendimento`.
- App: `pacienteId`, `profissionalId`, `dataHora`.

Durante o uso, os dados também ficam em memória no `DadosClinicaProvider`.

Fluxo simplificado:

1. O app inicia.
2. `DadosClinicaProvider` chama `listarDadosClinicaSupabase()`.
3. Supabase retorna pacientes, profissionais e atendimentos.
4. O contexto guarda tudo em estado React.
5. As telas consomem esse contexto.
6. Ao criar/editar/cancelar, o app grava no Supabase e atualiza o estado local.

A sessão de login é persistida separadamente em `AsyncStorage`, configurado em `src/servicos/supabase.ts`.

## 4. Relacionamento entre paciente, profissional e atendimento

O atendimento é a entidade que conecta paciente e profissional.

Modelo conceitual:

- Um paciente pode ter vários atendimentos.
- Um profissional pode ter vários atendimentos.
- Um atendimento pertence a um paciente.
- Um atendimento pertence a um profissional.

No app, `Atendimento` tem:

- `pacienteId`
- `profissionalId`
- `dataHora`
- `tipoAtendimento`
- `status`
- `duracaoMinutos`
- `observacoes`

No Supabase, o serviço usa:

- `paciente_id`
- `profissional_id`
- `data_atendimento`
- `hora_atendimento`
- `tipo_atendimento`
- `status`

Em `clinicaSupabase.ts`, o select de atendimentos traz os dados relacionados:

- `pacientes:paciente_id(...)`
- `profissionais:profissional_id(...)`

Depois disso, o app monta um `AtendimentoComRelacionamentos`, que inclui:

- dados do atendimento;
- dados do paciente, quando encontrado;
- dados do profissional, quando encontrado.

## 5. Como funciona o histórico do paciente

O histórico aparece no perfil do paciente.

Fluxo:

1. A tela `PerfilPaciente` pega o `id` da rota.
2. Usa `listarHistoricoDoPaciente(id)` do contexto.
3. O contexto chama a função de serviço em `src/servicos/atendimentos/index.ts`.
4. Essa função filtra todos os atendimentos por `pacienteId`.
5. Depois ordena do mais recente para o mais antigo.
6. A tela renderiza cada item com `ItemHistoricoAtendimento`.

Importante: atendimentos cancelados continuam aparecendo no histórico, porque cancelamento muda o status, não apaga o registro.

## 6. Como funciona o cancelamento de atendimento

Cancelamento não deleta o atendimento.

No app:

- A tela de formulário chama `cancelarAtendimento(atendimentoId)`.
- O contexto chama `cancelarAtendimentoSupabase(atendimentoId)`.
- O Supabase atualiza o campo `status` para `cancelado`.
- O app substitui o atendimento antigo pelo atendimento atualizado no estado local.

Por que não deletar?

- Mantém histórico do paciente.
- Mantém rastreabilidade.
- Evita perda de informação operacional.
- Permite diferenciar atendimento cancelado de atendimento que nunca existiu.

## 7. Como o app evita dois atendimentos no mesmo horário para o mesmo profissional

Ponto importante para a equipe explicar:

O bloqueio definitivo deve ficar no backend/banco de dados, não apenas no app.

No código atual do aplicativo, não existe uma validação forte no frontend que garanta sozinha que dois atendimentos não sejam criados no mesmo horário para o mesmo profissional. O app envia `profissionalId`, `data_atendimento` e `hora_atendimento` para o Supabase.

A regra correta deve ser garantida no banco com uma restrição de unicidade ou regra equivalente, por exemplo:

- mesmo `profissional_id`;
- mesma `data_atendimento`;
- mesma `hora_atendimento`;
- considerando apenas atendimentos ativos/agendados, se a regra permitir ignorar cancelados.

Por que isso precisa estar no backend?

- Dois usuários podem tentar agendar ao mesmo tempo.
- O app pode estar desatualizado localmente.
- Alguém pode chamar a API diretamente.
- Validação de frontend melhora a experiência, mas não protege o dado.

Resposta curta para apresentação:

"O app pode avisar o usuário, mas quem impede de verdade duplicidade de horário é o backend/Supabase, por meio de regra no banco. Isso evita corrida entre usuários e garante integridade dos dados."

## 8. Por que a validação principal fica no backend

A validação no app é importante para UX, mas não é suficiente para segurança e integridade.

Validação no frontend:

- Mostra erros rapidamente.
- Evita chamadas desnecessárias.
- Ajuda o usuário a preencher corretamente.
- Pode ser burlada.

Validação no backend:

- Protege o banco de dados.
- Funciona para qualquer cliente: app, web, script, API.
- Evita conflito em acessos simultâneos.
- Centraliza as regras reais de negócio.

No projeto, `src/validacoes/formularios.ts` usa Zod para validar campos obrigatórios no app. Mas regras como "não permitir dois atendimentos no mesmo horário para o mesmo profissional" devem ser reforçadas no Supabase.

## 9. Onde a notificação local é agendada

No estado atual do projeto, não há implementação de notificação local.

Não foram encontrados arquivos ou chamadas para:

- `expo-notifications`;
- agendamento local de notificações;
- registro de token push;
- cancelamento de lembretes.

Onde faria sentido implementar:

- criar um serviço dedicado, por exemplo `src/servicos/notificacoes.ts`;
- agendar lembrete após `criarAtendimentoSupabase`;
- reagendar lembrete após `editarAtendimentoSupabase`, se data/hora mudar;
- cancelar lembrete quando o atendimento for cancelado;
- salvar o identificador local da notificação se for necessário cancelar depois.

Resposta curta para apresentação:

"Hoje o app ainda não agenda notificações locais. Quando essa funcionalidade entrar, o ponto certo será um serviço de notificações chamado após criar, editar ou cancelar atendimentos."

## 10. Diferença entre notificação local e notificação enviada pelo backend

Notificação local:

- É agendada pelo próprio app no aparelho.
- Depende do app ter criado o lembrete localmente.
- O sistema operacional dispara no horário agendado.
- Não precisa de servidor no momento do disparo.
- É útil para lembretes pessoais já conhecidos pelo app.

Notificação enviada pelo backend:

- É disparada por um servidor.
- Pode acontecer mesmo que o app não tenha agendado nada localmente.
- Normalmente usa token push do dispositivo.
- Permite regras centralizadas, como lembrar todos os pacientes de amanhã.
- Depende de infraestrutura de push e permissões do usuário.

Exemplo:

- Local: ao agendar consulta, o app agenda um lembrete para 1 hora antes.
- Backend: o servidor roda todo dia às 8h e envia push para consultas do dia seguinte.

## 11. O que acontece com o lembrete se o app estiver fechado

Como notificações locais ainda não estão implementadas neste projeto, hoje não há lembrete local para disparar.

Quando notificação local for implementada corretamente:

- se o app estiver fechado, o sistema operacional pode exibir a notificação no horário agendado;
- o app não precisa estar aberto no momento do disparo;
- se o usuário revogar permissão de notificação, o lembrete não aparece;
- se o app for desinstalado, os lembretes somem;
- se o atendimento for cancelado, o app precisa cancelar também a notificação local agendada.

Ponto de atenção:

Se a notificação for apenas local e o usuário trocar de aparelho, o lembrete antigo não acompanha automaticamente. Para isso, seria necessário backend/push.

## 12. Por que escolher Supabase como banco de dados

Supabase é uma boa escolha para este projeto porque combina banco de dados, autenticação e API pronta.

Principais motivos:

- Usa PostgreSQL, banco relacional forte para pacientes, profissionais e atendimentos.
- Relacionamentos e constraints fazem sentido para a regra de agenda.
- Tem Supabase Auth, usado no login/cadastro/perfil.
- Gera uma API simples de consumir pelo app.
- Permite Row Level Security, importante para proteger dados por usuário/clínica.
- Funciona bem com TypeScript e React Native.
- Reduz a necessidade de criar um backend completo do zero no início do projeto.

Ponto que a equipe deve saber explicar:

"Escolhemos Supabase porque o domínio é relacional. Paciente, profissional e atendimento precisam de relacionamento, histórico e consistência. Supabase entrega PostgreSQL, autenticação e API pronta, reduzindo tempo de desenvolvimento sem abrir mão de integridade."

## 13. Pontos que a equipe precisa saber explicar

Checklist principal:

- Qual problema o BoaConsulta resolve.
- Como a navegação por abas e rotas funciona.
- Como o app carrega dados do Supabase.
- Como o contexto distribui dados para as telas.
- Por que atendimento conecta paciente e profissional.
- Como o histórico do paciente é calculado.
- Por que cancelamento muda status em vez de deletar.
- Por que validação crítica fica no backend.
- Como evitar conflito de horário no banco.
- O que já existe e o que ainda falta em notificações.
- Como login e persistência de sessão funcionam.
- Por que Supabase foi escolhido.

## 14. Perguntas extras para estudo

Arquitetura:

1. Qual a responsabilidade da pasta `app/`?
2. Qual a responsabilidade da pasta `src/telas/`?
3. Por que existe um `DadosClinicaProvider`?
4. O que aconteceria se cada tela buscasse diretamente os dados sem contexto?
5. Qual a diferença entre estado em memória e persistência no banco?

Supabase:

1. O que o arquivo `supabase.ts` configura?
2. Por que as variáveis usam prefixo `EXPO_PUBLIC_`?
3. O que significa usar schema `app`?
4. Como o app transforma campos do banco para campos do domínio?
5. O que é Row Level Security e por que seria importante aqui?

Agenda:

1. Quais campos definem um atendimento?
2. Como a agenda do dia filtra os atendimentos?
3. Por que a ordenação por horário importa?
4. O que muda quando filtra por profissional?
5. Como o app deveria reagir a um erro de conflito de horário vindo do backend?

Paciente e histórico:

1. Por que o histórico fica no perfil do paciente?
2. O histórico deve mostrar atendimentos cancelados? Por quê?
3. Qual a diferença entre excluir paciente e cancelar atendimento?
4. Como o app lida com um atendimento cujo paciente foi removido?

Autenticação:

1. Como o app decide mostrar login ou perfil?
2. Onde a sessão de login é persistida?
3. O que acontece quando o usuário faz logout?
4. Qual a diferença entre autenticar e autorizar?

Notificações:

1. O que falta para implementar notificação local?
2. Onde guardar o identificador da notificação agendada?
3. Como cancelar um lembrete se o atendimento for cancelado?
4. Quando usar notificação local e quando usar push pelo backend?
5. Quais permissões precisam ser solicitadas ao usuário?

Qualidade e segurança:

1. Por que não confiar apenas no frontend?
2. Que validações precisam estar no banco?
3. Que erros precisam ser tratados pelo app?
4. Como testar conflito de horário com dois usuários ao mesmo tempo?
5. Como garantir que um usuário veja apenas dados da sua clínica?

## 15. Respostas curtas para apresentação

Como os dados persistem?

"Os dados da clínica ficam no Supabase/PostgreSQL. O app carrega esses dados no contexto React para uso nas telas. A sessão de login fica no AsyncStorage."

Como funciona o relacionamento?

"Atendimento é a tabela central: ele guarda paciente, profissional, data, hora, tipo e status. Paciente e profissional podem ter muitos atendimentos."

Como funciona o histórico?

"O histórico filtra todos os atendimentos pelo paciente e ordena do mais recente para o mais antigo."

Como funciona o cancelamento?

"Cancelar não apaga. O app atualiza o status para `cancelado`, mantendo o registro no histórico."

Como evitar dois horários iguais?

"A regra definitiva deve estar no banco, com constraint ou validação backend para bloquear o mesmo profissional na mesma data e hora."

Onde está a notificação local?

"Ainda não está implementada. Deve entrar em um serviço de notificações chamado após criar, editar ou cancelar atendimentos."

Por que Supabase?

"Porque ele entrega PostgreSQL, autenticação, API e segurança com RLS, combinando bem com um app de agenda clínica que precisa de relacionamentos e integridade."