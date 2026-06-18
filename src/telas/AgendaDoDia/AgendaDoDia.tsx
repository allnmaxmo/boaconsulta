import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CartaoAtendimento } from '@/src/componentes/agenda/CartaoAtendimento';
import { Botao } from '@/src/componentes/interface/Botao';
import { BotaoAcaoFlutuante } from '@/src/componentes/interface/BotaoAcaoFlutuante';
import { Cabecalho } from '@/src/componentes/interface/Cabecalho';
import { ContainerTela } from '@/src/componentes/interface/ContainerTela';
import { EstadoCarregamento } from '@/src/componentes/interface/EstadoCarregamento';
import { EstadoVazio } from '@/src/componentes/interface/EstadoVazio';
import { Seletor } from '@/src/componentes/interface/Seletor';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';
import { dataISOHoje, formatarDataLonga } from '@/src/utilitarios/data';
import { rotaApp } from '@/src/utilitarios/rotas';

export function AgendaDoDia() {
  const router = useRouter();
  const { profissionais, listarAtendimentosDoDia, carregando, erro } = useDadosClinica();
  const [profissionalFiltro, setProfissionalFiltro] = useState('todos');
  const dataHoje = dataISOHoje();

  const atendimentos = listarAtendimentosDoDia(
    dataHoje,
    profissionalFiltro === 'todos' ? undefined : profissionalFiltro,
  );

  const opcoesProfissionais = useMemo(
    () => [
      { rotulo: 'Todos', valor: 'todos' },
      ...profissionais.map((profissional) => ({
        rotulo: profissional.nome,
        valor: profissional.id,
        detalhe: profissional.especialidade,
      })),
    ],
    [profissionais],
  );

  return (
    <View style={styles.tela}>
      <ContainerTela>
        <Cabecalho
          titulo="BoaConsulta"
          subtitulo={formatarDataLonga(new Date())}
          acao={<Botao titulo="Novo" icone="add" onPress={() => router.push(rotaApp('/agendamento/novo'))} />}
        />

        <Seletor
          rotulo="Filtrar por profissional"
          valor={profissionalFiltro}
          opcoes={opcoesProfissionais}
          onChange={setProfissionalFiltro}
          horizontal
        />

        {carregando ? (
          <EstadoCarregamento />
        ) : erro ? (
          <EstadoVazio titulo="Não foi possível carregar a agenda" descricao={erro} icone="cloud-off" />
        ) : atendimentos.length === 0 ? (
          <EstadoVazio
            titulo={
              profissionalFiltro === 'todos'
                ? 'Nenhum atendimento para hoje'
                : 'Nenhum atendimento neste filtro'
            }
            descricao="Quando novos agendamentos forem criados, eles aparecerão organizados por horário."
          />
        ) : (
          <View style={styles.lista}>
            {atendimentos.map((atendimento, indice) => (
              <CartaoAtendimento
                key={atendimento.id}
                atendimento={atendimento}
                indice={indice}
                onPress={() =>
                  router.push(rotaApp({ pathname: '/agendamento/[id]', params: { id: atendimento.id } }))
                }
                onPacientePress={
                  atendimento.paciente
                    ? () =>
                        router.push(rotaApp({
                          pathname: '/pacientes/[id]',
                          params: { id: atendimento.pacienteId },
                        }))
                    : undefined
                }
              />
            ))}
          </View>
        )}
      </ContainerTela>

      <BotaoAcaoFlutuante
        acessibilidade="Criar novo agendamento"
        onPress={() => router.push(rotaApp('/agendamento/novo'))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  lista: {
    gap: 14,
  },
});
