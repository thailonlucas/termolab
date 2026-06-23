RLS (Row Level Security)

# locations
auth read locations — SELECT — role: authenticated — USING: true
admin manage locations — ALL — role: authenticated — USING/Check: get_my_role() = 'admin'::text

# movement_types
auth read movement_types — SELECT — role: authenticated — USING: true
admin manage movement_types — ALL — role: authenticated — USING/Check: get_my_role() = 'admin'::text

# owners
auth read owners — SELECT — role: authenticated — USING: true
admin manage owners — ALL — role: authenticated — USING/Check: get_my_role() = 'admin'::text

# protocols
auth read protocols — SELECT — role: authenticated — USING: true
admin manage protocols — ALL — role: authenticated — USING/Check: get_my_role() = 'admin'::text

# protocol_files
auth read protocol_files — SELECT — role: authenticated — USING: true
admin manage protocol_files — ALL — role: authenticated — USING/Check: get_my_role() = 'admin'::text

# profiles (usuário)
users read own profile — SELECT — role: authenticated — USING: (id = auth.uid()) OR (get_my_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]))
users update own profile — UPDATE — role: authenticated — USING: id = auth.uid() — WITH CHECK: id = auth.uid()
profiles (admin)
admin manage profiles — ALL — role: authenticated — USING/Check: get_my_role() = 'admin'::text

# handlings
auth read handlings — SELECT — role: authenticated — USING: get_my_role() = 'admin'::text (policy “admin full handlings” abaixo cobre o resto)
admin full handlings — ALL — role: authenticated — USING/Check: get_my_role() = 'admin'::text
supervisor read handlings — SELECT — role: authenticated — USING: get_my_role() = 'supervisor'::text
user own handlings — ALL — role: authenticated — USING/Check: get_my_role() = ANY (ARRAY['user'::text, 'driver'::text]) AND created_by = auth.uid()

# handling_sessions
admin full sessions — ALL — role: authenticated — USING/Check: get_my_role() = 'admin'::text
supervisor read sessions — SELECT — role: authenticated — USING: get_my_role() = 'supervisor'::text
user own sessions — ALL — role: authenticated — USING/Check:
get_my_role() = ANY (ARRAY['user'::text, 'driver'::text]) AND EXISTS (SELECT 1 FROM handlings h WHERE h.id = handling_sessions.handling_id AND h.created_by = auth.uid())

# movements
admin full movements — ALL — role: authenticated — USING/Check: get_my_role() = 'admin'::text
supervisor read movements — SELECT — role: authenticated — USING: get_my_role() = 'supervisor'::text
user own movements — ALL — role: authenticated — USING/Check:
get_my_role() = ANY (ARRAY['user'::text, 'driver'::text]) AND EXISTS (SELECT 1 FROM handlings h WHERE h.id = movements.handling_id AND h.created_by = auth.uid())

# movement_files
admin full movement_files — ALL — role: authenticated — USING/Check: get_my_role() = 'admin'::text
supervisor read movement_files — SELECT — role: authenticated — USING: get_my_role() = 'supervisor'::text
user own movement_files — ALL — role: authenticated — USING/Check:
get_my_role() = ANY (ARRAY['user'::text, 'driver'::text]) AND EXISTS (SELECT 1 FROM (movements m JOIN handlings h ON h.id = m.handling_id) WHERE m.id = movement_files.movement_id AND h.created_by = auth.uid())
storage.objects (bucket/arquivos)

# Bucket handling-photos:

auth upload handling photos — INSERT — role: authenticated — WITH CHECK: bucket_id = 'handling-photos'::text
auth read handling photos — SELECT — role: authenticated — USING: bucket_id = 'handling-photos'::text
auth delete own handling photos — DELETE — role: authenticated — USING:
(bucket_id = 'handling-photos'::text) AND (auth.uid())::text = (storage.foldername(name))[1]

# Bucket protocol-files:

auth read protocol files — SELECT — role: authenticated — USING: bucket_id = 'protocol-files'::text
admin upload protocol files — INSERT — role: authenticated — WITH CHECK:
(bucket_id = 'protocol-files'::text) AND (get_my_role() = 'admin'::text)