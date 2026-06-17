import { useLocalSearchParams } from 'expo-router';

import { ProfissionalFormulario } from '@/src/telas/ProfissionalFormulario/ProfissionalFormulario';

export default function EditarProfissionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ProfissionalFormulario profissionalId={id} />;
}

