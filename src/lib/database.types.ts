// Raw DB row types — mirror the SQL schema exactly.
// Use these for service functions; use the richer app types in components.

export type DbRole           = 'admin' | 'supervisor' | 'user' | 'driver';
export type DbHandlingStatus = 'in_progress' | 'completed' | 'cancelled';
export type DbSessionStatus  = 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'cancelled';
export type DbMovementStatus = 'pending' | 'done' | 'approved' | 'rejected' | 'cancelled';
export type DbLocationType   = 'headquarters' | 'branch' | 'dock' | 'warehouse';

// ── Lookup & reference ──────────────────────────────────────────────────────

export interface DbLocation {
  id: string;
  name: string;
  type: DbLocationType | null;
  address: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface DbOwner {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DbProtocol {
  id: string;
  owner_id: string;
  medication: string;
  instructions: string | null;
  ice_model: string | null;
  min_temp: number | null;
  max_temp: number | null;
  cold_storage_days: number | null;
  ice_change_interval_hours: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DbProtocolFile {
  id: string;
  protocol_id: string;
  storage_path: string;
  file_name: string | null;
  mime_type: string | null;
  caption: string | null;
  created_at: string;
}

export interface DbMovementType {
  id: string;
  name: string;
  label: string;
  description: string | null;
  requires_photo: boolean;
  requires_temperature: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// ── Users / profiles ────────────────────────────────────────────────────────

export interface DbProfile {
  id: string;
  full_name: string | null;
  role: DbRole;
  created_at: string;
}

// ── Handlings ───────────────────────────────────────────────────────────────

export interface DbHandling {
  id: string;
  created_by: string | null;
  owner_id: string | null;
  protocol_id: string | null;
  location_id: string | null;
  box_id: string;
  medication: string;
  lot: string;
  origin: string;
  destination: string;
  sender: string | null;
  nf_key: string | null;
  draft_doc: string | null;
  status: DbHandlingStatus;
  metadata: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export interface DbHandlingSession {
  id: string;
  handling_id: string;
  created_by: string | null;
  location_id: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface DbSessionStatusRow {
  id: string;
  session_id: string;
  status: DbSessionStatus;
  created_by: string | null;
  notes: string | null;
  created_at: string;
}

// ── Movements ────────────────────────────────────────────────────────────────

export interface DbMovement {
  id: string;
  session_id: string;
  handling_id: string;
  movement_type_id: string;
  created_by: string | null;
  location_id: string | null;
  temperature_val: number | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}

export interface DbMovementFile {
  id: string;
  movement_id: string;
  storage_path: string;
  file_name: string | null;
  mime_type: string | null;
  caption: string | null;
  created_at: string;
}

export interface DbMovementStatusRow {
  id: string;
  movement_id: string;
  status: DbMovementStatus;
  created_by: string | null;
  notes: string | null;
  created_at: string;
}

// ── View row types ───────────────────────────────────────────────────────────

export interface DbSessionCurrentStatusRow {
  session_id: string;
  status: DbSessionStatus;
  created_by: string | null;
  notes: string | null;
  status_updated_at: string;
}

export interface DbMovementCurrentStatusRow {
  movement_id: string;
  status: DbMovementStatus;
  created_by: string | null;
  notes: string | null;
  status_updated_at: string;
}

// ── Supabase Database type (for typed createClient) ──────────────────────────

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: DbLocation;
        Insert: Omit<DbLocation, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbLocation, 'id' | 'created_at'>>;
      };
      owners: {
        Row: DbOwner;
        Insert: Omit<DbOwner, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbOwner, 'id' | 'created_at'>>;
      };
      protocols: {
        Row: DbProtocol;
        Insert: Omit<DbProtocol, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<DbProtocol, 'id' | 'created_at'>>;
      };
      protocol_files: {
        Row: DbProtocolFile;
        Insert: Omit<DbProtocolFile, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbProtocolFile, 'id' | 'created_at'>>;
      };
      movement_types: {
        Row: DbMovementType;
        Insert: Omit<DbMovementType, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbMovementType, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: DbProfile;
        Insert: Omit<DbProfile, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<DbProfile, 'id' | 'created_at'>>;
      };
      handlings: {
        Row: DbHandling;
        Insert: Omit<DbHandling, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbHandling, 'id' | 'created_at'>>;
      };
      handling_sessions: {
        Row: DbHandlingSession;
        Insert: Omit<DbHandlingSession, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbHandlingSession, 'id' | 'created_at'>>;
      };
      session_statuses: {
        Row: DbSessionStatusRow;
        Insert: Omit<DbSessionStatusRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbSessionStatusRow, 'id' | 'created_at'>>;
      };
      movements: {
        Row: DbMovement;
        Insert: Omit<DbMovement, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbMovement, 'id' | 'created_at'>>;
      };
      movement_files: {
        Row: DbMovementFile;
        Insert: Omit<DbMovementFile, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbMovementFile, 'id' | 'created_at'>>;
      };
      movement_statuses: {
        Row: DbMovementStatusRow;
        Insert: Omit<DbMovementStatusRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbMovementStatusRow, 'id' | 'created_at'>>;
      };
    };
    Views: {
      sessions_current_status: { Row: DbSessionCurrentStatusRow };
      movements_current_status: { Row: DbMovementCurrentStatusRow };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
