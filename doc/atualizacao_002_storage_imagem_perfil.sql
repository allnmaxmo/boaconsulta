-- =====================================================================
-- BOACONSULTA — ATUALIZAÇÃO 002
-- Configuração do bucket imagem_perfil no Supabase Storage
-- =====================================================================
-- Use este arquivo se o bucket "imagem_perfil" já foi criado no painel.
-- Ele ajusta configurações do bucket e cria policies para uso pelo app.
-- =====================================================================


-- =====================================================================
-- 1. Garante configuração esperada do bucket
-- =====================================================================
-- Motivo:
-- - O app exibe a imagem usando uma URL pública.
-- - O limite de 5 MB evita uploads pesados demais para foto de perfil.
-- - Os MIME types limitam o bucket a formatos de imagem comuns.
update storage.buckets
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'imagem_perfil';


-- =====================================================================
-- 2. Leitura pública das imagens do bucket
-- =====================================================================
-- Motivo:
-- - Avatares precisam aparecer no app via Image usando URL pública.
-- - A escrita continua protegida pelas policies seguintes.
drop policy if exists "imagem_perfil_select_publico" on storage.objects;
create policy "imagem_perfil_select_publico"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'imagem_perfil');


-- =====================================================================
-- 3. Upload somente na própria pasta
-- =====================================================================
-- Motivo:
-- - O app salva arquivos como: {auth.uid()}/avatar.jpeg.
-- - Cada usuário só pode inserir imagem dentro da própria pasta.
drop policy if exists "imagem_perfil_insert_proprio_usuario" on storage.objects;
create policy "imagem_perfil_insert_proprio_usuario"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'imagem_perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- =====================================================================
-- 4. Atualização somente na própria pasta
-- =====================================================================
-- Motivo:
-- - O app usa upsert para substituir avatar antigo pelo novo.
-- - A policy impede sobrescrever imagem de outro usuário.
drop policy if exists "imagem_perfil_update_proprio_usuario" on storage.objects;
create policy "imagem_perfil_update_proprio_usuario"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'imagem_perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'imagem_perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- =====================================================================
-- 5. Remoção somente na própria pasta
-- =====================================================================
-- Motivo:
-- - Fica preparado para uma futura função "remover foto".
-- - Mantém a mesma regra: usuário só mexe nos próprios arquivos.
drop policy if exists "imagem_perfil_delete_proprio_usuario" on storage.objects;
create policy "imagem_perfil_delete_proprio_usuario"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'imagem_perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- =====================================================================
-- FIM DA ATUALIZAÇÃO 002
-- =====================================================================
