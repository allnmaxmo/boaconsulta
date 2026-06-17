const formatadorDataLonga = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});

const formatadorDataCurta = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function dataISOHoje() {
  const hoje = new Date();
  return hoje.toISOString().slice(0, 10);
}

export function montarDataHora(data: string, horario: string) {
  return `${data}T${horario}:00`;
}

export function obterData(dataHora: string) {
  return dataHora.slice(0, 10);
}

export function obterHorario(dataHora: string) {
  return dataHora.slice(11, 16);
}

export function formatarDataLonga(data: Date) {
  const texto = formatadorDataLonga.format(data);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatarDataCurta(dataHora: string) {
  return formatadorDataCurta.format(new Date(dataHora));
}

export function compararMaisRecentePrimeiro(a: string, b: string) {
  return new Date(b).getTime() - new Date(a).getTime();
}

