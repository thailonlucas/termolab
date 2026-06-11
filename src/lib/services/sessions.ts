import { supabase } from '../supabase';
import type { DbHandlingSession, DbSessionStatusRow, DbSessionStatus } from '../database.types';

export async function createSession(
  input: Omit<DbHandlingSession, 'id' | 'created_at'>
): Promise<DbHandlingSession> {
  const { data, error } = await supabase
    .from('handling_sessions')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
  // Trigger on_session_created auto-inserts 'in_progress' into session_statuses
}

export async function getSessionsByHandling(handlingId: string): Promise<DbHandlingSession[]> {
  const { data, error } = await supabase
    .from('handling_sessions')
    .select('*')
    .eq('handling_id', handlingId)
    .order('started_at');
  if (error) throw error;
  return data ?? [];
}

export async function submitSession(sessionId: string, userId: string): Promise<DbSessionStatusRow> {
  return insertSessionStatus(sessionId, 'submitted', userId);
}

export async function approveSession(
  sessionId: string,
  userId: string,
  notes?: string
): Promise<DbSessionStatusRow> {
  return insertSessionStatus(sessionId, 'approved', userId, notes);
}

export async function rejectSession(
  sessionId: string,
  userId: string,
  notes: string
): Promise<DbSessionStatusRow> {
  return insertSessionStatus(sessionId, 'rejected', userId, notes);
}

export async function cancelSession(sessionId: string, userId: string): Promise<DbSessionStatusRow> {
  return insertSessionStatus(sessionId, 'cancelled', userId);
}

export async function getSessionStatusHistory(sessionId: string): Promise<DbSessionStatusRow[]> {
  const { data, error } = await supabase
    .from('session_statuses')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getSessionCurrentStatus(sessionId: string): Promise<DbSessionStatus | null> {
  const { data, error } = await supabase
    .from('sessions_current_status')
    .select('status')
    .eq('session_id', sessionId)
    .single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data?.status ?? null;
}

async function insertSessionStatus(
  sessionId: string,
  status: DbSessionStatus,
  userId: string,
  notes?: string
): Promise<DbSessionStatusRow> {
  const { data, error } = await supabase
    .from('session_statuses')
    .insert({ session_id: sessionId, status, created_by: userId, notes: notes ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}
