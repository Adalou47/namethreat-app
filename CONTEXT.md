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
## Employee Import — COMPLETED March 9 2026

Three import methods:
1. Microsoft Entra sync — built, tested with 
   real tenant pending
   Files: src/app/api/integrations/entra/
2. Google Workspace — placeholder, coming soon
3. CSV import — working
   Files: src/app/api/employees/import-csv/route.ts
   Template: public/employee-template.csv

Imported employees have:
- role: 'employee'
- is_imported: true
- clerk_user_id: 'imported:{email}' for CSV
- clerk_user_id: 'imported:{entra_id}' for Entra