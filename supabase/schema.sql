-- ZP Command v3.0 Supabase schema (run in SQL editor)

create table if not exists kpi_daily (
  id bigserial primary key,
  date date not null,
  brand_id text default 'default',
  channel text,
  visits int, clicks int, carts int, orders int,
  revenue numeric, ad_cost numeric, returns int,
  reviews int, freq numeric,
  created_at timestamp with time zone default now()
);

create table if not exists ledger (
  id bigserial primary key,
  date date not null,
  brand_id text default 'default',
  quest_id text, type text,
  stable_amt numeric default 0,
  edge_amt numeric default 0,
  lock_until date,
  proof_url text,
  created_at timestamp with time zone default now()
);

create table if not exists commerce_items (
  id bigserial primary key,
  date date, order_id text, sku text, qty int,
  price numeric, discount numeric, source text, kind text, amount numeric,
  created_at timestamp with time zone default now()
);

create table if not exists returns (
  id bigserial primary key,
  order_id text, sku text, reason text, date date,
  created_at timestamp with time zone default now()
);

create table if not exists rewards_rules (
  id bigserial primary key,
  cap_ratio numeric default 0.10,
  edge_min numeric default 0.15,
  edge_max numeric default 0.30,
  stable_days int default 7,
  edge_days int default 30,
  created_at timestamp with time zone default now()
);

-- Basic RLS: read for anon, write for authenticated
alter table kpi_daily enable row level security;
alter table ledger enable row level security;
alter table commerce_items enable row level security;
alter table returns enable row level security;
alter table rewards_rules enable row level security;

create policy "read_public" on kpi_daily for select using (true);
create policy "write_auth" on kpi_daily for insert with check (auth.role() = 'authenticated');

create policy "read_public_l" on ledger for select using (true);
create policy "write_auth_l" on ledger for insert with check (auth.role() = 'authenticated');

create policy "read_public_c" on commerce_items for select using (true);
create policy "write_auth_c" on commerce_items for insert with check (auth.role() = 'authenticated');

create policy "read_public_r" on returns for select using (true);
create policy "write_auth_r" on returns for insert with check (auth.role() = 'authenticated');

create policy "read_public_rules" on rewards_rules for select using (true);
create policy "write_auth_rules" on rewards_rules for insert with check (auth.role() = 'authenticated');
