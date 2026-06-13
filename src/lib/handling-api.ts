import { supabase } from "@/integrations/supabase/client";
import type { BoxDraft, DraftMovement } from "./session-store";

// Convert a watermarked dataURL to a Blob for upload.
function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(meta)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export async function saveHandling(
  box: BoxDraft,
  movements: DraftMovement[],
  userId: string,
  nextMaintenanceAt?: string | null,
) {
  // 1. Find existing handling for this box+user, else create
  const { data: existing, error: findErr } = await supabase
    .from("handlings")
    .select("id")
    .eq("box_id", box.box_id)
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (findErr) throw findErr;

  let handlingId: string;
  if (existing) {
    handlingId = existing.id;
    if (nextMaintenanceAt !== undefined) {
      const { error: updErr } = await supabase
        .from("handlings")
        .update({ next_session_at: nextMaintenanceAt })
        .eq("id", handlingId);
      if (updErr) throw updErr;
    }
  } else {
    const { data: ins, error: insErr } = await supabase
      .from("handlings")
      .insert({
        created_by: userId,
        box_id: box.box_id,
        destination: box.destination || "—",
        sender: box.sender || null,
        nf_key: box.nf_key || null,
        draft_doc: box.draft_doc || null,
        next_session_at: nextMaintenanceAt ?? null,
      })
      .select("id")
      .single();
    if (insErr) throw insErr;
    handlingId = ins.id;
  }

  // 2. Create handling_session (audit trail + status workflow)
  const { data: sess, error: sessErr } = await supabase
    .from("handling_sessions")
    .insert({ handling_id: handlingId, created_by: userId })
    .select("id")
    .single();
  if (sessErr) throw sessErr;
  const sessionId = sess.id as string;

  // 3. Insert movements + upload files
  let photoCount = 0;
  let finalTemp: number | null = null;
  for (const m of movements) {
    const { data: mv, error: mvErr } = await supabase
      .from("movements")
      .insert({
        session_id: sessionId,
        handling_id: handlingId,
        movement_type_id: m.movementTypeId,
        created_by: userId,
        temperature_val: m.temperature ?? null,
        notes: m.notes ?? null,
        occurred_at: m.occurredAt,
        metadata: { movement_type_name: m.movementTypeName },
      })
      .select("id")
      .single();
    if (mvErr) throw mvErr;
    if (m.temperature != null) finalTemp = m.temperature;

    if (m.photoDataUrl) {
      const blob = dataUrlToBlob(m.photoDataUrl);
      const path = `${userId}/${mv.id}/${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("handling-photos")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (upErr) throw upErr;
      const { error: fErr } = await supabase.from("movement_files").insert({
        movement_id: mv.id,
        storage_path: path,
        file_name: `${m.movementTypeName}.jpg`,
        mime_type: "image/jpeg",
      });
      if (fErr) throw fErr;
      photoCount++;
    }
  }

  return {
    handlingId,
    sessionId,
    movementCount: movements.length,
    photoCount,
    finalTemp,
  };
}

export async function getSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("handling-photos")
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
