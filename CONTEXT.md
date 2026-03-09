## RLS Policies — COMPLETED March 9 2026

All 27 tables have RLS enabled with policies written.
Helper function: public.get_namethreat_user()
Returns: user_id, organisation_id, msp_id, role

Access rules:
- employee: own data only
- org_admin: full org data
- org_viewer: full org data read only
- msp_admin: all client orgs data via msp_id

Application uses service role key (bypasses RLS).
RLS is a safety net for direct database access.