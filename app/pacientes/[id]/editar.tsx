import { useLocalSearchParams } from 'expo-router';

import { PacienteFormulario } from '@/src/telas/PacienteFormulario/PacienteFormulario';

export default function EditarPacienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PacienteFormulario pacienteId={id} />;
}

