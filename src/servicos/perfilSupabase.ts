import { File } from 'expo-file-system';

import { supabase } from '@/src/servicos/supabase';

const bucketImagemPerfil = 'imagem_perfil';

type PerfilUsuarioRow = {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string | null;
  cargo: CargoUsuario;
  avatar_url?: string | null;
  ativo: boolean;
};

type ProfissionalPerfilRow = {
  id: string;
  especialidade: string;
};

export type CargoUsuario = 'administrador' | 'atendente' | 'profissional' | 'paciente';

export type PerfilUsuarioAtual = {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone?: string;
  cargo: CargoUsuario;
  avatarUrl?: string;
  ativo: boolean;
};

export type ResumoProfissional = {
  especialidade: string;
  totalConsultasRealizadas: number;
};

export type DadosEdicaoPerfil = {
  nomeCompleto: string;
  telefone: string;
};

function mapearPerfilUsuario(row: PerfilUsuarioRow): PerfilUsuarioAtual {
  return {
    id: row.id,
    nomeCompleto: row.nome_completo,
    email: row.email,
    telefone: row.telefone ?? undefined,
    cargo: row.cargo,
    avatarUrl: row.avatar_url ?? undefined,
    ativo: row.ativo,
  };
}

function obterExtensaoImagem(uri: string) {
  const caminhoLimpo = uri.split('?')[0] ?? uri;
  const extensao = caminhoLimpo.split('.').pop()?.toLowerCase();

  if (extensao === 'png' || extensao === 'webp' || extensao === 'jpg' || extensao === 'jpeg') {
    return extensao === 'jpg' ? 'jpeg' : extensao;
  }

  return 'jpeg';
}

function obterContentType(extensao: string) {
  return `image/${extensao}`;
}

async function obterUsuarioAutenticado() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Erro ao obter usuário autenticado: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('Nenhum usuário autenticado foi encontrado.');
  }

  return data.user;
}

export async function obterPerfilUsuarioAtual() {
  const usuario = await obterUsuarioAutenticado();
  const { data, error } = await supabase
    .from('usuarios')
    .select('id,nome_completo,email,telefone,cargo,avatar_url,ativo')
    .eq('id', usuario.id)
    .single();

  if (error) {
    throw new Error(`Erro ao carregar perfil do usuário: ${error.message}`);
  }

  return mapearPerfilUsuario(data as PerfilUsuarioRow);
}

export async function obterResumoProfissionalDoUsuario(
  usuarioId: string,
): Promise<ResumoProfissional | undefined> {
  const { data: profissional, error: erroProfissional } = await supabase
    .from('profissionais')
    .select('id,especialidade')
    .eq('usuario_id', usuarioId)
    .maybeSingle();

  if (erroProfissional) {
    throw new Error(`Erro ao localizar perfil profissional: ${erroProfissional.message}`);
  }

  if (!profissional) {
    return undefined;
  }

  const { count, error: erroContagem } = await supabase
    .from('atendimentos')
    .select('id', { count: 'exact', head: true })
    .eq('profissional_id', profissional.id)
    .eq('status', 'realizado');

  if (erroContagem) {
    throw new Error(`Erro ao contar consultas realizadas: ${erroContagem.message}`);
  }

  return {
    especialidade: (profissional as ProfissionalPerfilRow).especialidade,
    totalConsultasRealizadas: count ?? 0,
  };
}

export async function atualizarPerfilUsuarioAtual(dados: DadosEdicaoPerfil) {
  const usuario = await obterUsuarioAutenticado();
  const { data, error } = await supabase
    .from('usuarios')
    .update({
      nome_completo: dados.nomeCompleto.trim(),
      telefone: dados.telefone.trim(),
    })
    .eq('id', usuario.id)
    .select('id,nome_completo,email,telefone,cargo,avatar_url,ativo')
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar perfil do usuário: ${error.message}`);
  }

  return mapearPerfilUsuario(data as PerfilUsuarioRow);
}

export async function enviarImagemPerfil(uri: string) {
  const usuario = await obterUsuarioAutenticado();
  const extensao = obterExtensaoImagem(uri);
  const contentType = obterContentType(extensao);
  const caminhoArquivo = `${usuario.id}/avatar.${extensao}`;
  const arquivoLocal = new File(uri);
  const arquivo = await arquivoLocal.arrayBuffer();

  if (arquivo.byteLength === 0) {
    throw new Error('A imagem selecionada está vazia. Escolha outra imagem e tente novamente.');
  }

  const { error: erroUpload } = await supabase.storage
    .from(bucketImagemPerfil)
    .upload(caminhoArquivo, arquivo, {
      contentType,
      upsert: true,
    });

  if (erroUpload) {
    throw new Error(`Erro ao enviar imagem de perfil: ${erroUpload.message}`);
  }

  const { data } = supabase.storage.from(bucketImagemPerfil).getPublicUrl(caminhoArquivo);
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;

  const { error: erroPerfil } = await supabase
    .from('usuarios')
    .update({ avatar_url: avatarUrl })
    .eq('id', usuario.id);

  if (erroPerfil) {
    throw new Error(`Erro ao salvar imagem no perfil: ${erroPerfil.message}`);
  }

  return avatarUrl;
}
