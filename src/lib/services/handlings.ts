import { supabase } from '../supabase';
import type { DbHandling, DbHandlingStatus } from '../database.types';

export async function createHandling(
  input: Omit<DbHandling, 'id' | 'created_at'>
): Promise<DbHandling> {
  const { data, error } = await supabase
    .from('handlings')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listHandlings(userId: string): Promise<DbHandling[]> {
  const { data, error } = await supabase
    .from('handlings')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getHandlingById(id: string): Promise<DbHandling | null> {
  const { data, error } = await supabase
    .from('handlings')
    .select('*')
    .eq('id', id)
    .single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function updateHandlingStatus(
  id: string,
  status: DbHandlingStatus,
  completedAt?: string
): Promise<DbHandling> {
  const { data, error } = await supabase
    .from('handlings')
    .update({ status, ...(completedAt ? { completed_at: completedAt } : {}) })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Find the most recent handling for a given box_id owned by this user.
export async function findHandlingByBoxId(boxId: string, userId: string): Promise<DbHandling | null> {
  const { data, error } = await supabase
    .from('handlings')
    .select('*')
    .eq('box_id', boxId)
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Count sessions for a handling — used after save to report session number.
export async function countHandlingSessions(handlingId: string): Promise<number> {
  const { count, error } = await supabase
    .from('handling_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('handling_id', handlingId);
  if (error) throw error;
  return count ?? 0;
}

// Fetches sessions with movements and photo paths for a handling — used by HistoryDetail.
export async function getHandlingSessions(handlingId: string) {
  const { data, error } = await supabase
    .from('handling_sessions')
    .select(`
      id, started_at, completed_at, notes,
      session_statuses ( status, created_at ),
      movements (
        id, temperature_val, occurred_at, metadata,
        movement_types ( name, label, requires_photo, requires_temperature ),
        movement_files ( storage_path )
      )
    `)
    .eq('handling_id', handlingId)
    .order('started_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Lightweight list for history screen — sessions with status only, no movements.
export async function listHandlingsSummary(userId: string) {
  const { data, error } = await supabase
    .from('handlings')
    .select(`
      *,
      handling_sessions (
        id, started_at,
        session_statuses ( status, created_at )
      )
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
