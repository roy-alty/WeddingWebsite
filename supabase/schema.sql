-- Wedding site database schema for Supabase (Postgres).
--
-- HOW TO USE:
--   1. Create a free project at https://supabase.com.
--   2. Open the SQL Editor in your project dashboard, paste this whole
--      file in, and click "Run". It creates the three tables below plus
--      the security rules that control who can read/write what.
--   3. Create yourself an admin login: Authentication → Users → Add user
--      (email + password). That's the login for admin.html.
--   4. Copy your Project URL and anon/public key from Settings → API
--      into supabase-config.js (see that file's comments).
--
-- SECURITY MODEL (Row Level Security, enabled on every table):
--   - rsvps:          anyone (your wedding guests) can INSERT a row via
--                      the public RSVP form. Only a logged-in admin can
--                      read, edit, or delete rows.
--   - seating:        admin-only for read/write. Guests never touch this.
--   - contributions:  admin-only for read/write. You log gifts/money
--                      here yourself after seeing them arrive via
--                      Zelle/Cash App — guests don't submit to this table.

-- ---------- RSVPs ----------
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  attending text not null,
  guest_count int not null default 1,
  message text,
  created_at timestamptz not null default now()
);

alter table rsvps enable row level security;

create policy "Anyone can submit an RSVP"
  on rsvps for insert
  to anon
  with check (true);

create policy "Only admins can read RSVPs"
  on rsvps for select
  to authenticated
  using (true);

create policy "Only admins can edit RSVPs"
  on rsvps for update
  to authenticated
  using (true);

create policy "Only admins can delete RSVPs"
  on rsvps for delete
  to authenticated
  using (true);

-- ---------- Seating arrangement ----------
create table if not exists seating (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  table_number text not null,
  seat_count int not null default 1,
  notes text,
  created_at timestamptz not null default now()
);

alter table seating enable row level security;

create policy "Only admins can access seating"
  on seating for all
  to authenticated
  using (true)
  with check (true);

-- ---------- Contributions / money tracking ----------
create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  giver_name text not null,
  amount numeric(10, 2) not null,
  method text not null default 'Other',
  note text,
  received_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table contributions enable row level security;

create policy "Only admins can access contributions"
  on contributions for all
  to authenticated
  using (true)
  with check (true);
