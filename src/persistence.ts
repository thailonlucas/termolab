import type { Session, HistoryEntry, LocalMovement } from './types';
import {
  createHandling,
  findHandlingByBoxId,
  countHandlingSessions,
  listHandlingsSummary,
} from './lib/services/handlings';
import { createSession, submitSession } from './lib/services/sessions';
import { createMovement, createMovementFile } from './lib/services/movements';
import { uploadHandlingPhoto } from './lib/services/storage';

// ── Save a completed wizard session to Supabase ──────────────────────────────

export async function saveHandling(
  session: Session,
  userId: string
): Promise<HistoryEntry> {
  const completedAt = new Date();

  // Reuse existing handling for this box if one exists, otherwise create new.
  const existingHandling = await findHandlingByBoxId(session.boxId, userId);

  const handling = existingHandling ?? await createHandling({
    created_by: userId,
    box_id: session.boxId,
    medication: session.medication,
    lot: session.lot,
    origin: session.origem,
    destination: session.destino,
    sender: session.remetente || null,
    nf_key: session.chaveNF || null,
    draft_doc: session.docMinuta || null,
    owner_id: null,
    protocol_id: null,
    location_id: null,
    status: 'completed',
    metadata: session.operator ? { operator: session.operator } : {},
    started_at: session.startedAt.toISOString(),
    completed_at: completedAt.toISOString(),
  });

  const dbSession = await createSession({
    handling_id: handling.id,
    created_by: userId,
    location_id: null,
    notes: null,
    metadata: {},
    started_at: session.startedAt.toISOString(),
    completed_at: completedAt.toISOString(),
  });

  for (const mov of session.movements) {
    const tempVal = mov.temperature ? parseFloat(mov.temperature) : null;

    const dbMovement = await createMovement({
      session_id: dbSession.id,
      handling_id: handling.id,
      movement_type_id: mov.movementTypeId,
      created_by: userId,
      location_id: null,
      temperature_val: tempVal !== null && !isNaN(tempVal) ? tempVal : null,
      notes: null,
      metadata: { movement_type_name: mov.movementTypeName },
      occurred_at: mov.occurredAt.toISOString(),
    });

    if (mov.photo?.dataUrl) {
      try {
        const path = await uploadHandlingPhoto(
          mov.photo.dataUrl,
          handling.id,
          dbMovement.id,
          mov.movementTypeName,
        );
        await createMovementFile({
          movement_id: dbMovement.id,
          storage_path: path,
          file_name: `${mov.movementTypeName}.jpg`,
          mime_type: 'image/jpeg',
          caption: null,
        });
      } catch (err) {
        console.warn(`[TermoLab] Photo upload failed for "${mov.movementTypeName}":`, err);
      }
    }
  }

  await submitSession(dbSession.id, userId);

  const sessionCount = await countHandlingSessions(handling.id);

  return {
    id: handling.id,
    boxId: session.boxId,
    medication: session.medication,
    lot: session.lot,
    origem: session.origem,
    destino: session.destino,
    remetente: session.remetente,
    chaveNF: session.chaveNF,
    docMinuta: session.docMinuta,
    startedAt: new Date(handling.started_at),
    completedAt,
    operator: session.operator,
    handlingStatus: 'completed',
    sessionCount,
    latestSessionStatus: 'submitted',
  };
}

// ── Load all handlings for a user from Supabase ──────────────────────────────

export async function loadHandlings(userId: string): Promise<HistoryEntry[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await listHandlingsSummary(userId) as any[];

  return rows.map(h => {
    const sessions: Array<{
      id: string;
      started_at: string;
      session_statuses: Array<{ status: string; created_at: string }>;
    }> = h.handling_sessions ?? [];

    const latestSession = sessions
      .slice()
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];

    const latestStatus = (latestSession?.session_statuses ?? [])
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.status ?? 'submitted';

    return {
      id: h.id,
      boxId: h.box_id,
      medication: h.medication,
      lot: h.lot,
      origem: h.origin,
      destino: h.destination,
      remetente: h.sender ?? '',
      chaveNF: h.nf_key ?? '',
      docMinuta: h.draft_doc ?? '',
      startedAt: new Date(h.started_at),
      completedAt: new Date(h.completed_at ?? h.created_at),
      operator: (h.metadata as Record<string, string> | null)?.operator,
      handlingStatus: h.status ?? 'completed',
      sessionCount: sessions.length,
      latestSessionStatus: latestStatus,
    } satisfies HistoryEntry;
  });
}

// Re-export LocalMovement so callers that imported it from here continue to work.
export type { LocalMovement };
