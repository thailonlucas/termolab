import { supabase } from '../supabase';

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

export async function uploadHandlingPhoto(
  dataUrl: string,
  handlingId: string,
  movementId: string,
  stepId: string
): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const path = `${handlingId}/${movementId}/${stepId}.jpg`;
  const { error } = await supabase.storage
    .from('handling-photos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return path;
}

export async function uploadProtocolFile(
  file: File,
  protocolId: string
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${protocolId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('protocol-files')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

export async function getSignedUrl(
  bucket: 'handling-photos' | 'protocol-files',
  path: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteFile(
  bucket: 'handling-photos' | 'protocol-files',
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
