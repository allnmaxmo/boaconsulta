import { File } from 'expo-file-system';

import { supabase } from '@/src/servicos/supabase';

const bucketImagemPerfil = 'imagem_perfil';

type PerfilUsuarioRow = {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string | null;
  cargo?: string | null;
  avatar_url?: string | null;
};

export type PerfilUsuarioAtual = {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone?: string;
  cargo?: string;
  avatarUrl?: string;
};

function mapearPerfilUsuario(row: PerfilUsuarioRow): PerfilUsuarioAtual {
  return {
    id: row.id,
    nomeCompleto: row.nome_completo,
    email: row.email,
    telefone: row.telefone ?? undefined,
    cargo: row.cargo ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
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
    .select('id,nome_completo,email,telefone,cargo,avatar_url')
    .eq('id', usuario.id)
    .single();

  if (error) {
    throw new Error(`Erro ao carregar perfil do usuário: ${error.message}`);
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
