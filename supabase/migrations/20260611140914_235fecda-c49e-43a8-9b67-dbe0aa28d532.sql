
-- Fix linter: revoke EXECUTE on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_session_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
-- has_role stays callable by authenticated (used in client-callable contexts is harmless; RLS uses it definer-side)
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Recreate view with security_invoker so it respects caller's RLS
DROP VIEW IF EXISTS public.sessions_current_status;
CREATE VIEW public.sessions_current_status
WITH (security_invoker = true) AS
SELECT DISTINCT ON (session_id) session_id, status, created_at, created_by, notes
FROM public.session_statuses
ORDER BY session_id, created_at DESC;
GRANT SELECT ON public.sessions_current_status TO authenticated;

-- =====================================================================
-- STORAGE POLICIES: handling-photos (private)
-- Path convention: {auth.uid()}/{movement_id}/{filename}
-- =====================================================================
CREATE POLICY "Users upload own handling photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'handling-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users read own handling photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'handling-photos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'supervisor')
      OR public.has_role(auth.uid(), 'admin')
    )
  );
CREATE POLICY "Users delete own handling photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'handling-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- STORAGE POLICIES: protocol-files (private, admin-managed)
-- =====================================================================
CREATE POLICY "Auth users read protocol files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'protocol-files');
CREATE POLICY "Admins write protocol files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'protocol-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete protocol files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'protocol-files' AND public.has_role(auth.uid(), 'admin'));
