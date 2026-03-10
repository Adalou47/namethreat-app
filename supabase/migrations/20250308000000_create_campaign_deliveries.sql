-- Create campaign_deliveries table for tracking per-user email sends per campaign
create table if not exists public.campaign_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.phishing_campaigns(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  sent_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Optional: index for lookups by campaign
create index if not exists idx_campaign_deliveries_campaign_id
  on public.campaign_deliveries(campaign_id);

-- Optional: index for lookups by user
create index if not exists idx_campaign_deliveries_user_id
  on public.campaign_deliveries(user_id);
