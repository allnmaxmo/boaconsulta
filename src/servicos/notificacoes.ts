import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { AtendimentoComRelacionamentos } from '@/src/tipos/dominio';

const canalAtendimentos = 'lembretes-atendimentos';
const nomeClinica = 'BoaConsulta';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const opcoesLembreteAtendimento = [
  { rotulo: '1 min antes', valor: '1', detalhe: 'Bom para testar' },
  { rotulo: '5 min antes', valor: '5' },
  { rotulo: '10 min antes', valor: '10' },
  { rotulo: '30 min antes', valor: '30' },
  { rotulo: '1 h antes', valor: '60' },
  { rotulo: '24 h antes', valor: '1440' },
];

export async function configurarNotificacoes() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(canalAtendimentos, {
      name: 'Lembretes de atendimentos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#004ac6',
    });
  }
}

export async function solicitarPermissaoNotificacoes() {
  await configurarNotificacoes();

  const permissaoAtual = await Notifications.getPermissionsAsync();
  let statusFinal = permissaoAtual.status;

  if (statusFinal !== 'granted') {
    const novaPermissao = await Notifications.requestPermissionsAsync();
    statusFinal = novaPermissao.status;
  }

  return statusFinal === 'granted';
}

export async function cancelarNotificacaoAtendimento(notificacaoId?: string | null) {
  if (!notificacaoId) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificacaoId);
}

export async function agendarNotificacaoAtendimento(
  atendimento: AtendimentoComRelacionamentos,
  lembreteMinutos = 30,
) {
  if (atendimento.status !== 'agendado') {
    return null;
  }

  const temPermissao = await solicitarPermissaoNotificacoes();

  if (!temPermissao) {
    return null;
  }

  const dataAtendimento = new Date(atendimento.dataHora);
  const dataNotificacao = new Date(dataAtendimento.getTime() - lembreteMinutos * 60 * 1000);

  if (dataNotificacao.getTime() <= Date.now()) {
    return null;
  }

  const horario = dataAtendimento.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const nomeProfissional = atendimento.profissional?.nome ?? 'profissional da clínica';
  const tipoAtendimento = atendimento.tipoAtendimento;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${nomeClinica}: atendimento próximo`,
      body: `Seu atendimento de ${tipoAtendimento} será às ${horario} com ${nomeProfissional}.`,
      data: {
        atendimentoId: atendimento.id,
        url: `/agendamento/${atendimento.id}`,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dataNotificacao,
      channelId: canalAtendimentos,
    },
  });
}
