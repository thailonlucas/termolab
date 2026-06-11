import { supabase } from '../supabase';
import type { DbOwner } from '../database.types';

export async function getOwners(): Promise<DbOwner[]> {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getOwnerById(id: string): Promise<DbOwner | null> {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('id', id)
    .single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function createOwner(
  input: Omit<DbOwner, 'id' | 'created_at'>
): Promise<DbOwner> {
  const { data, error } = await supabase
    .from('owners')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOwner(
  id: string,
  patch: Partial<Omit<DbOwner, 'id' | 'created_at'>>
): Promise<DbOwner> {
  const { data, error } = await supabase
    .from('owners')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
