-- TermoLab — Initial Schema
-- Run this in Supabase SQL Editor or via scripts/setup-db.mjs

-- ================================================
-- LOCATIONS
-- ================================================
CREATE TABLE IF NOT EXISTS locations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  type        TEXT        CHECK (type IN ('headquarters', 'branch', 'dock', 'warehouse')),
  address     TEXT,
  metadata    JSONB       NOT NULL DEFAULT '{}',
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- OWNERS
-- ================================================
CREATE TABLE IF NOT EXISTS owners (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  contact_email  TEXT,
  contact_phone  TEXT,
  metadata       JSONB       NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- PROTOCOLS
-- ================================================
CREATE TABLE IF NOT EXISTS protocols (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id                  UUID        NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  medication                TEXT        NOT NULL,
  instructions              TEXT,
  ice_model                 TEXT,
  min_temp                  NUMERIC(5,2),
  max_temp                  NUMERIC(5,2),
  cold_storage_days         INTEGER,
  ice_change_interval_hours INTEGER,
  metadata                  JSONB       NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protocols_updated_at ON protocols;
CREATE TRIGGER protocols_updated_at
  BEFORE UPDATE ON protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- PROTOCOL FILES
-- ================================================
CREATE TABLE IF NOT EXISTS protocol_files (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id   UUID        NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  storage_path  TEXT        NOT NULL,
  file_name     TEXT,
  mime_type     TEXT,
  caption       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================
-- MOVEMENT TYPES (admin-managed lookup)
-- ================================================
CREATE TABLE IF NOT EXISTS movement_types (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT        UNIQUE NOT NULL,
  label                 TEXT        NOT NULL,
  description           TEXT,
  requires_photo        BOOLEAN     NOT NULL DEFAULT false,
  requires_temperature  BOOLEAN     NOT NULL DEFAULT false,
  sort_order            INTEGER     NOT NULL DEFAULT 0,
  is_active             BOOLEAN     NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO movement_types (name, label, requires_photo, requires_temperature, sort_order) VALUES
  ('open_box',                 'Open Box',                  true,  false, 1),
  ('remove_ice_layer',         'Remove Ice Layer',          true,  false, 2),
  ('add_ice',                  'Add Ice',                   true,  false, 3),
  ('place_in_cold_chamber',    'Place in Cold Chamber',     true,  false, 4),
  ('remove_from_cold_chamber', 'Remove from Cold Chamber',  true,  false, 5),
  ('temperature_reading',      'Temperature Reading',       false, true,  6),
  ('seal_box',                 'Seal Box',                  true,  false, 7),
  ('approval',                 'Approval / Signature',      true,  false, 8)
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- PROFILES (extends auth.users)
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT        NOT NULL DEFAULT 'user'
              CHECK (role IN ('admin', 'supervisor', 'user', 'driver')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================
-- HANDLINGS
-- ================================================
CREATE TABLE IF NOT EXISTS handlings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_id      UUID        REFERENCES owners(id) ON DELETE SET NULL,
  protocol_id   UUID        REFERENCES protocols(id) ON DELETE SET NULL,
  location_id   UUID        REFERENCES locations(id) ON DELETE SET NULL,
  box_id        TEXT        NOT NULL,
  medication    TEXT        NOT NULL,
  lot           TEXT        NOT NULL,
  origin        TEXT        NOT NULL,
  destination   TEXT        NOT NULL,
  sender        TEXT,
  nf_key        TEXT,
  draft_doc     TEXT,
  status        TEXT        NOT NULL DEFAULT 'in_progress'
                CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  metadata      JSONB       NOT NULL DEFAULT '{}',
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS handlings_created_by_idx ON handlings (created_by);
CREATE INDEX IF NOT EXISTS handlings_owner_id_idx    ON handlings (owner_id);
CREATE INDEX IF NOT EXISTS handlings_status_idx      ON handlings (status);

-- ================================================
-- HANDLING SESSIONS
-- ================================================
CREATE TABLE IF NOT EXISTS handling_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  handling_id   UUID        NOT NULL REFERENCES handlings(id) ON DELETE CASCADE,
  created_by    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  location_id   UUID        REFERENCES locations(id) ON DELETE SET NULL,
  notes         TEXT,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_handling_id_idx ON handling_sessions (handling_id);
CREATE INDEX IF NOT EXISTS sessions_created_by_idx  ON handling_sessions (created_by);

-- ================================================
-- SESSION STATUSES (append-only)
-- ================================================
CREATE TABLE IF NOT EXISTS session_statuses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        NOT NULL REFERENCES handling_sessions(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL
              CHECK (status IN ('in_progress', 'submitted', 'approved', 'rejected', 'cancelled')),
  created_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_statuses_session_id_idx ON session_statuses (session_id, created_at DESC);

CREATE OR REPLACE FUNCTION handle_new_session()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO session_statuses (session_id, status, created_by)
  VALUES (NEW.id, 'in_progress', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_session_created ON handling_sessions;
CREATE TRIGGER on_session_created
  AFTER INSERT ON handling_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_new_session();

CREATE OR REPLACE VIEW sessions_current_status AS
SELECT DISTINCT ON (session_id)
  session_id,
  status,
  created_by,
  notes,
  created_at AS status_updated_at
FROM session_statuses
ORDER BY session_id, created_at DESC;

-- ================================================
-- MOVEMENTS
-- ================================================
CREATE TABLE IF NOT EXISTS movements (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID        NOT NULL REFERENCES handling_sessions(id) ON DELETE CASCADE,
  handling_id       UUID        NOT NULL REFERENCES handlings(id) ON DELETE CASCADE,
  movement_type_id  UUID        NOT NULL REFERENCES movement_types(id),
  created_by        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  location_id       UUID        REFERENCES locations(id) ON DELETE SET NULL,
  temperature_val   NUMERIC(5,2),
  notes             TEXT,
  metadata          JSONB       NOT NULL DEFAULT '{}',
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS movements_session_id_idx  ON movements (session_id);
CREATE INDEX IF NOT EXISTS movements_handling_id_idx ON movements (handling_id);
CREATE INDEX IF NOT EXISTS movements_created_by_idx  ON movements (created_by);

-- ================================================
-- MOVEMENT FILES
-- ================================================
CREATE TABLE IF NOT EXISTS movement_files (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id   UUID        NOT NULL REFERENCES movements(id) ON DELETE CASCADE,
  storage_path  TEXT        NOT NULL,
  file_name     TEXT,
  mime_type     TEXT,
  caption       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS movement_files_movement_id_idx ON movement_files (movement_id);

-- ================================================
-- MOVEMENT STATUSES (append-only)
-- ================================================
CREATE TABLE IF NOT EXISTS movement_statuses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID        NOT NULL REFERENCES movements(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL
              CHECK (status IN ('pending', 'done', 'approved', 'rejected', 'cancelled')),
  created_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS movement_statuses_movement_id_idx ON movement_statuses (movement_id, created_at DESC);

CREATE OR REPLACE FUNCTION handle_new_movement()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO movement_statuses (movement_id, status, created_by)
  VALUES (NEW.id, 'pending', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_movement_created ON movements;
CREATE TRIGGER on_movement_created
  AFTER INSERT ON movements
  FOR EACH ROW EXECUTE FUNCTION handle_new_movement();

CREATE OR REPLACE VIEW movements_current_status AS
SELECT DISTINCT ON (movement_id)
  movement_id,
  status,
  created_by,
  notes,
  created_at AS status_updated_at
FROM movement_statuses
ORDER BY movement_id, created_at DESC;

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

ALTER TABLE locations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners           ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols        ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_files   ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_types   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE handlings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE handling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_files   ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_statuses ENABLE ROW LEVEL SECURITY;

-- ---- locations ----
CREATE POLICY "auth read locations"   ON locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage locations" ON locations FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- ---- movement_types ----
CREATE POLICY "auth read movement_types"   ON movement_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage movement_types" ON movement_types FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- ---- owners ----
CREATE POLICY "auth read owners"   ON owners FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage owners" ON owners FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- ---- protocols ----
CREATE POLICY "auth read protocols"   ON protocols FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage protocols" ON protocols FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- ---- protocol_files ----
CREATE POLICY "auth read protocol_files"   ON protocol_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage protocol_files" ON protocol_files FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- ---- profiles ----
CREATE POLICY "users read own profile"     ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR get_my_role() IN ('admin', 'supervisor'));
CREATE POLICY "users update own profile"   ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "admin manage profiles"      ON profiles FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- ---- handlings ----
CREATE POLICY "admin full handlings"      ON handlings FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "supervisor read handlings" ON handlings FOR SELECT TO authenticated
  USING (get_my_role() = 'supervisor');
CREATE POLICY "user own handlings"        ON handlings FOR ALL    TO authenticated
  USING (get_my_role() IN ('user', 'driver') AND created_by = auth.uid())
  WITH CHECK (get_my_role() IN ('user', 'driver') AND created_by = auth.uid());

-- ---- handling_sessions ----
CREATE POLICY "admin full sessions"      ON handling_sessions FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "supervisor read sessions" ON handling_sessions FOR SELECT TO authenticated
  USING (get_my_role() = 'supervisor');
CREATE POLICY "user own sessions"        ON handling_sessions FOR ALL    TO authenticated
  USING (
    get_my_role() IN ('user', 'driver') AND
    EXISTS (SELECT 1 FROM handlings h WHERE h.id = handling_id AND h.created_by = auth.uid())
  )
  WITH CHECK (
    get_my_role() IN ('user', 'driver') AND
    EXISTS (SELECT 1 FROM handlings h WHERE h.id = handling_id AND h.created_by = auth.uid())
  );

-- ---- session_statuses ----
CREATE POLICY "admin full session_statuses"         ON session_statuses FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "supervisor approve sessions"         ON session_statuses FOR ALL    TO authenticated
  USING (get_my_role() = 'supervisor')
  WITH CHECK (get_my_role() = 'supervisor' AND status IN ('approved', 'rejected', 'cancelled'));
CREATE POLICY "user read own session_statuses"      ON session_statuses FOR SELECT TO authenticated
  USING (
    get_my_role() IN ('user', 'driver') AND
    EXISTS (
      SELECT 1 FROM handling_sessions hs
      JOIN handlings h ON h.id = hs.handling_id
      WHERE hs.id = session_id AND h.created_by = auth.uid()
    )
  );
CREATE POLICY "user insert own session_statuses"    ON session_statuses FOR INSERT TO authenticated
  WITH CHECK (
    get_my_role() IN ('user', 'driver') AND
    status IN ('in_progress', 'submitted', 'cancelled') AND
    EXISTS (
      SELECT 1 FROM handling_sessions hs
      JOIN handlings h ON h.id = hs.handling_id
      WHERE hs.id = session_id AND h.created_by = auth.uid()
    )
  );

-- ---- movements ----
CREATE POLICY "admin full movements"      ON movements FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "supervisor read movements" ON movements FOR SELECT TO authenticated
  USING (get_my_role() = 'supervisor');
CREATE POLICY "user own movements"        ON movements FOR ALL    TO authenticated
  USING (
    get_my_role() IN ('user', 'driver') AND
    EXISTS (SELECT 1 FROM handlings h WHERE h.id = handling_id AND h.created_by = auth.uid())
  )
  WITH CHECK (
    get_my_role() IN ('user', 'driver') AND
    EXISTS (SELECT 1 FROM handlings h WHERE h.id = handling_id AND h.created_by = auth.uid())
  );

-- ---- movement_files ----
CREATE POLICY "admin full movement_files"      ON movement_files FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "supervisor read movement_files" ON movement_files FOR SELECT TO authenticated
  USING (get_my_role() = 'supervisor');
CREATE POLICY "user own movement_files"        ON movement_files FOR ALL    TO authenticated
  USING (
    get_my_role() IN ('user', 'driver') AND
    EXISTS (
      SELECT 1 FROM movements m
      JOIN handlings h ON h.id = m.handling_id
      WHERE m.id = movement_id AND h.created_by = auth.uid()
    )
  )
  WITH CHECK (
    get_my_role() IN ('user', 'driver') AND
    EXISTS (
      SELECT 1 FROM movements m
      JOIN handlings h ON h.id = m.handling_id
      WHERE m.id = movement_id AND h.created_by = auth.uid()
    )
  );

-- ---- movement_statuses ----
CREATE POLICY "admin full movement_statuses"      ON movement_statuses FOR ALL    TO authenticated
  USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "supervisor manage movement_statuses" ON movement_statuses FOR ALL  TO authenticated
  USING (get_my_role() = 'supervisor')
  WITH CHECK (get_my_role() = 'supervisor' AND status IN ('approved', 'rejected', 'cancelled'));
CREATE POLICY "user read own movement_statuses"   ON movement_statuses FOR SELECT TO authenticated
  USING (
    get_my_role() IN ('user', 'driver') AND
    EXISTS (
      SELECT 1 FROM movements m
      JOIN handlings h ON h.id = m.handling_id
      WHERE m.id = movement_id AND h.created_by = auth.uid()
    )
  );
CREATE POLICY "user insert own movement_statuses" ON movement_statuses FOR INSERT TO authenticated
  WITH CHECK (
    get_my_role() IN ('user', 'driver') AND
    status IN ('pending', 'done', 'cancelled') AND
    EXISTS (
      SELECT 1 FROM movements m
      JOIN handlings h ON h.id = m.handling_id
      WHERE m.id = movement_id AND h.created_by = auth.uid()
    )
  );

-- ================================================
-- STORAGE BUCKETS
-- ================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('handling-photos', 'handling-photos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('protocol-files', 'protocol-files', false)
ON CONFLICT (id) DO NOTHING;

-- handling-photos: any authenticated user can upload/read
CREATE POLICY "auth upload handling photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'handling-photos');

CREATE POLICY "auth read handling photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'handling-photos');

CREATE POLICY "auth delete own handling photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'handling-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- protocol-files: all authenticated users can read; only admins upload
CREATE POLICY "auth read protocol files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'protocol-files');

CREATE POLICY "admin upload protocol files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'protocol-files' AND get_my_role() = 'admin');
