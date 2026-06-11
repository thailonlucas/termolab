import { supabase } from '../supabase';
import type { DbMovement, DbMovementFile, DbMovementStatusRow, DbMovementStatus } from '../database.types';

export async function createMovement(
  input: Omit<DbMovement, 'id' | 'created_at'>
): Promise<DbMovement> {
  const { data, error } = await supabase
    .from('movements')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
  // Trigger on_movement_created auto-inserts 'pending' into movement_statuses
}

export async function getMovementsBySession(sessionId: string): Promise<DbMovement[]> {
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .eq('session_id', sessionId)
    .order('occurred_at');
  if (error) throw error;
  return data ?? [];
}

export async function getMovementsByHandling(handlingId: string): Promise<DbMovement[]> {
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .eq('handling_id', handlingId)
    .order('occurred_at');
  if (error) throw error;
  return data ?? [];
}

// ── Movement files ───────────────────────────────────────────────────────────

export async function createMovementFile(
  input: Omit<DbMovementFile, 'id' | 'created_at'>
): Promise<DbMovementFile> {
  const { data, error } = await supabase
    .from('movement_files')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMovementFiles(movementId: string): Promise<DbMovementFile[]> {
  const { data, error } = await supabase
    .from('movement_files')
    .select('*')
    .eq('movement_id', movementId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

// ── Movement statuses ────────────────────────────────────────────────────────

export async function doneMovement(movementId: string, userId: string): Promise<DbMovementStatusRow> {
  return insertMovementStatus(movementId, 'done', userId);
}

export async function approveMovement(
  movementId: string,
  userId: string,
  notes?: string
): Promise<DbMovementStatusRow> {
  return insertMovementStatus(movementId, 'approved', userId, notes);
}

export async function rejectMovement(
  movementId: string,
  userId: string,
  notes: string
): Promise<DbMovementStatusRow> {
  return insertMovementStatus(movementId, 'rejected', userId, notes);
}

export async function getMovementStatusHistory(movementId: string): Promise<DbMovementStatusRow[]> {
  const { data, error } = await supabase
    .from('movement_statuses')
    .select('*')
    .eq('movement_id', movementId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMovementCurrentStatus(movementId: string): Promise<DbMovementStatus | null> {
  const { data, error } = await supabase
    .from('movements_current_status')
    .select('status')
    .eq('movement_id', movementId)
    .single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data?.status ?? null;
}

async function insertMovementStatus(
  movementId: string,
  status: DbMovementStatus,
  userId: string,
  notes?: string
): Promise<DbMovementStatusRow> {
  const { data, error } = await supabase
    .from('movement_statuses')
    .insert({ movement_id: movementId, status, created_by: userId, notes: notes ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}
