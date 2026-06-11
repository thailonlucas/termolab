import { supabase } from '../supabase';
import type { DbMovementType } from '../database.types';

let cache: DbMovementType[] | null = null;

export async function getMovementTypes(activeOnly = true): Promise<DbMovementType[]> {
  if (cache) return activeOnly ? cache.filter(t => t.is_active) : cache;

  const { data, error } = await supabase
    .from('movement_types')
    .select('*')
    .order('sort_order');
  if (error) throw error;

  cache = data ?? [];
  return activeOnly ? cache.filter(t => t.is_active) : cache;
}

export function invalidateMovementTypesCache(): void {
  cache = null;
}

export async function createMovementType(
  input: Omit<DbMovementType, 'id' | 'created_at'>
): Promise<DbMovementType> {
  invalidateMovementTypesCache();
  const { data, error } = await supabase
    .from('movement_types')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMovementType(
  id: string,
  patch: Partial<Omit<DbMovementType, 'id' | 'created_at'>>
): Promise<DbMovementType> {
  invalidateMovementTypesCache();
  const { data, error } = await supabase
    .from('movement_types')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
