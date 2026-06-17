import { useLocalSearchParams } from 'expo-router';

import { AgendamentoFormulario } from '@/src/telas/AgendamentoFormulario/AgendamentoFormulario';

export default function EditarAgendamentoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <AgendamentoFormulario atendimentoId={id} />;
}

