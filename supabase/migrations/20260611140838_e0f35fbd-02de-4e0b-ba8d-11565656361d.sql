
-- =====================================================================
-- ROLES
-- =====================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor', 'user', 'driver');

-- =====================================================================
-- PROFILES
-- =====================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- =====================================================================
-- USER ROLES (separate table — security best practice)
-- =====================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =====================================================================
-- AUTO-CREATE PROFILE + DEFAULT ROLE ON SIGNUP
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- MOVEMENT TYPES
-- =====================================================================
CREATE TABLE public.movement_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  requires_photo BOOLEAN NOT NULL DEFAULT false,
  requires_temperature BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.movement_types TO authenticated;
GRANT ALL ON public.movement_types TO service_role;
ALTER TABLE public.movement_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Movement types readable by auth" ON public.movement_types
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage movement types" ON public.movement_types
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.movement_types (name, label, description, requires_photo, requires_temperature, sort_order) VALUES
  ('open_box',                 'Abertura da caixa',          'Documente o estado inicial da caixa.', true,  false, 10),
  ('remove_ice_layer',         'Retirada da camada de gelo', 'Remova e fotografe o gelo antigo.',   true,  false, 20),
  ('add_ice',                  'Adição de gelo',             'Adicione novo gelo conforme protocolo.', true, false, 30),
  ('temperature_reading',      'Leitura de temperatura',     'Registre a temperatura interna.',     false, true,  40),
  ('place_in_cold_chamber',    'Colocação na câmara fria',   '',                                    true,  false, 50),
  ('remove_from_cold_chamber', 'Retirada da câmara fria',    '',                                    true,  false, 60),
  ('seal_box',                 'Fechamento da caixa',        '',                                    true,  false, 70),
  ('approval',                 'Assinatura / Aprovação',     'Assinatura do operador.',             true,  false, 80);

-- =====================================================================
-- OWNERS
-- =====================================================================
CREATE TABLE public.owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.owners TO authenticated;
GRANT ALL ON public.owners TO service_role;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners readable by auth" ON public.owners
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage owners" ON public.owners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- LOCATIONS
-- =====================================================================
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locations TO authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locations readable by auth" ON public.locations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage locations" ON public.locations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- PROTOCOLS
-- =====================================================================
CREATE TABLE public.protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  medication TEXT NOT NULL,
  instructions TEXT,
  ice_model TEXT,
  min_temp NUMERIC(5,2),
  max_temp NUMERIC(5,2),
  cold_storage_days INTEGER,
  ice_change_interval_hours INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.protocols TO authenticated;
GRANT ALL ON public.protocols TO service_role;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Protocols readable by auth" ON public.protocols
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage protocols" ON public.protocols
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.protocol_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.protocol_files TO authenticated;
GRANT ALL ON public.protocol_files TO service_role;
ALTER TABLE public.protocol_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Protocol files readable by auth" ON public.protocol_files
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage protocol files" ON public.protocol_files
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- HANDLINGS
-- =====================================================================
CREATE TABLE public.handlings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
  protocol_id UUID REFERENCES public.protocols(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  box_id TEXT NOT NULL,
  medication TEXT NOT NULL,
  lot TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  sender TEXT,
  nf_key TEXT,
  draft_doc TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_handlings_box_owner ON public.handlings (box_id, created_by);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.handlings TO authenticated;
GRANT ALL ON public.handlings TO service_role;
ALTER TABLE public.handlings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own handlings" ON public.handlings
  FOR SELECT TO authenticated USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Users insert own handlings" ON public.handlings
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users update own handlings" ON public.handlings
  FOR UPDATE TO authenticated USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'admin')
  );

-- =====================================================================
-- HANDLING SESSIONS
-- =====================================================================
CREATE TABLE public.handling_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handling_id UUID NOT NULL REFERENCES public.handlings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_handling ON public.handling_sessions (handling_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.handling_sessions TO authenticated;
GRANT ALL ON public.handling_sessions TO service_role;
ALTER TABLE public.handling_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sessions" ON public.handling_sessions
  FOR SELECT TO authenticated USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Users insert own sessions" ON public.handling_sessions
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users update own sessions" ON public.handling_sessions
  FOR UPDATE TO authenticated USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'admin')
  );

-- =====================================================================
-- SESSION STATUSES (append-only)
-- =====================================================================
CREATE TABLE public.session_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.handling_sessions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('in_progress','submitted','approved','rejected','cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_session_statuses_session_created ON public.session_statuses (session_id, created_at DESC);
GRANT SELECT, INSERT ON public.session_statuses TO authenticated;
GRANT ALL ON public.session_statuses TO service_role;
ALTER TABLE public.session_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Statuses readable to involved" ON public.session_statuses
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.handling_sessions s
      WHERE s.id = session_id
      AND (s.created_by = auth.uid()
           OR public.has_role(auth.uid(), 'supervisor')
           OR public.has_role(auth.uid(), 'admin'))
    )
  );
CREATE POLICY "Owners and supervisors insert statuses" ON public.session_statuses
  FOR INSERT TO authenticated WITH CHECK (
    created_by = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM public.handling_sessions s WHERE s.id = session_id AND s.created_by = auth.uid())
      OR public.has_role(auth.uid(), 'supervisor')
      OR public.has_role(auth.uid(), 'admin')
    )
  );

-- Auto-insert 'in_progress' status on session create
CREATE OR REPLACE FUNCTION public.on_session_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.session_statuses (session_id, status, created_by)
  VALUES (NEW.id, 'in_progress', NEW.created_by);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_on_session_created
  AFTER INSERT ON public.handling_sessions
  FOR EACH ROW EXECUTE FUNCTION public.on_session_created();

-- Current status view
CREATE VIEW public.sessions_current_status AS
SELECT DISTINCT ON (session_id) session_id, status, created_at, created_by, notes
FROM public.session_statuses
ORDER BY session_id, created_at DESC;
GRANT SELECT ON public.sessions_current_status TO authenticated;

-- =====================================================================
-- MOVEMENTS
-- =====================================================================
CREATE TABLE public.movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.handling_sessions(id) ON DELETE CASCADE,
  handling_id UUID NOT NULL REFERENCES public.handlings(id) ON DELETE CASCADE,
  movement_type_id UUID NOT NULL REFERENCES public.movement_types(id),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  temperature_val NUMERIC(5,2),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_movements_session ON public.movements (session_id);
CREATE INDEX idx_movements_handling ON public.movements (handling_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movements TO authenticated;
GRANT ALL ON public.movements TO service_role;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own movements" ON public.movements
  FOR SELECT TO authenticated USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Users insert own movements" ON public.movements
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users delete own movements" ON public.movements
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- =====================================================================
-- MOVEMENT FILES
-- =====================================================================
CREATE TABLE public.movement_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID NOT NULL REFERENCES public.movements(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_movement_files_movement ON public.movement_files (movement_id);
GRANT SELECT, INSERT, DELETE ON public.movement_files TO authenticated;
GRANT ALL ON public.movement_files TO service_role;
ALTER TABLE public.movement_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view files of own movements" ON public.movement_files
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.movements m
      WHERE m.id = movement_id
      AND (m.created_by = auth.uid()
           OR public.has_role(auth.uid(), 'supervisor')
           OR public.has_role(auth.uid(), 'admin'))
    )
  );
CREATE POLICY "Users insert files into own movements" ON public.movement_files
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.movements m
      WHERE m.id = movement_id AND m.created_by = auth.uid()
    )
  );
CREATE POLICY "Users delete files of own movements" ON public.movement_files
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.movements m
      WHERE m.id = movement_id AND m.created_by = auth.uid()
    )
  );
