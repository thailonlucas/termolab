import { supabase } from '../supabase';
import type { DbProtocol, DbProtocolFile } from '../database.types';

export async function getProtocols(): Promise<DbProtocol[]> {
  const { data, error } = await supabase
    .from('protocols')
    .select('*')
    .order('medication');
  if (error) throw error;
  return data ?? [];
}

export async function getProtocolsByOwner(ownerId: string): Promise<DbProtocol[]> {
  const { data, error } = await supabase
    .from('protocols')
    .select('*')
    .eq('owner_id', ownerId)
    .order('medication');
  if (error) throw error;
  return data ?? [];
}

export async function getProtocolById(id: string): Promise<DbProtocol | null> {
  const { data, error } = await supabase
    .from('protocols')
    .select('*')
    .eq('id', id)
    .single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function createProtocol(
  input: Omit<DbProtocol, 'id' | 'created_at' | 'updated_at'>
): Promise<DbProtocol> {
  const { data, error } = await supabase
    .from('protocols')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProtocol(
  id: string,
  patch: Partial<Omit<DbProtocol, 'id' | 'created_at'>>
): Promise<DbProtocol> {
  const { data, error } = await supabase
    .from('protocols')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProtocolFiles(protocolId: string): Promise<DbProtocolFile[]> {
  const { data, error } = await supabase
    .from('protocol_files')
    .select('*')
    .eq('protocol_id', protocolId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function createProtocolFile(
  input: Omit<DbProtocolFile, 'id' | 'created_at'>
): Promise<DbProtocolFile> {
  const { data, error } = await supabase
    .from('protocol_files')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProtocolFile(id: string): Promise<void> {
  const { error } = await supabase.from('protocol_files').delete().eq('id', id);
  if (error) throw error;
}
