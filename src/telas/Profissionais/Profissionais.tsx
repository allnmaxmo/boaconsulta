import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BotaoAcaoFlutuante } from '@/src/componentes/interface/BotaoAcaoFlutuante';
import { Cabecalho } from '@/src/componentes/interface/Cabecalho';
import { CampoTexto } from '@/src/componentes/interface/CampoTexto';
import { ContainerTela } from '@/src/componentes/interface/ContainerTela';
import { EstadoCarregamento } from '@/src/componentes/interface/EstadoCarregamento';
import { EstadoVazio } from '@/src/componentes/interface/EstadoVazio';
import { ModalConfirmacao } from '@/src/componentes/interface/ModalConfirmacao';
import { CartaoProfissional } from '@/src/componentes/profissionais/CartaoProfissional';
import { useDadosClinica } from '@/src/contextos/DadosClinicaContexto';
import { Profissional } from '@/src/tipos/dominio';
import { rotaApp } from '@/src/utilitarios/rotas';

export function Profissionais() {
  const router = useRouter();
  const { profissionais, excluirProfissional, carregando, erro } = useDadosClinica();
  const [busca, setBusca] = useState('');
  const [profissionalParaExcluir, setProfissionalParaExcluir] = useState<Profissional | null>(null);

  const profissionaisFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    if (!termo) {
      return profissionais;
    }

    return profissionais.filter(
      (profissional) =>
        profissional.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
        profissional.especialidade.toLocaleLowerCase('pt-BR').includes(termo),
    );
  }, [busca, profissionais]);

  return (
    <View style={styles.tela}>
      <ContainerTela>
        <Cabecalho titulo="Profissionais" subtitulo="Equipe disponível para agendamentos" />
        <CampoTexto
          rotulo="Buscar"
          placeholder="Nome ou especialidade"
          value={busca}
          onChangeText={setBusca}
        />

        {carregando ? (
          <EstadoCarregamento />
        ) : erro ? (
          <EstadoVazio titulo="Não foi possível carregar profissionais" descricao={erro} icone="cloud-off" />
        ) : profissionaisFiltrados.length === 0 ? (
          <EstadoVazio
            titulo={busca ? 'Nenhum profissional encontrado' : 'Nenhum profissional cadastrado'}
            descricao="Cadastre profissionais para vinculá-los aos agendamentos."
            icone="badge"
          />
        ) : (
          <View style={styles.lista}>
            {profissionaisFiltrados.map((profissional, indice) => (
              <CartaoProfissional
                key={profissional.id}
                profissional={profissional}
                indice={indice}
                onEditar={() =>
                  router.push(rotaApp({
                    pathname: '/profissionais/[id]',
                    params: { id: profissional.id },
                  }))
                }
                onExcluir={() => setProfissionalParaExcluir(profissional)}
              />
            ))}
          </View>
        )}
      </ContainerTela>

      <BotaoAcaoFlutuante
        acessibilidade="Cadastrar novo profissional"
        onPress={() => router.push(rotaApp('/profissionais/novo'))}
      />

      <ModalConfirmacao
        visivel={Boolean(profissionalParaExcluir)}
        titulo="Excluir profissional?"
        descricao={`O cadastro de ${profissionalParaExcluir?.nome ?? 'profissional'} será removido do banco.`}
        textoConfirmar="Excluir"
        onCancelar={() => setProfissionalParaExcluir(null)}
        onConfirmar={async () => {
          if (profissionalParaExcluir) {
            await excluirProfissional(profissionalParaExcluir.id);
          }
          setProfissionalParaExcluir(null);
        }}
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
