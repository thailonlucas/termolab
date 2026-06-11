import { supabase } from '../supabase';
import type { DbLocation } from '../database.types';

export async function getLocations(): Promise<DbLocation[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createLocation(
  input: Omit<DbLocation, 'id' | 'created_at'>
): Promise<DbLocation> {
  const { data, error } = await supabase
    .from('locations')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLocation(
  id: string,
  patch: Partial<Omit<DbLocation, 'id' | 'created_at'>>
): Promise<DbLocation> {
  const { data, error } = await supabase
    .from('locations')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
