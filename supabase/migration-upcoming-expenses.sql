-- 1. Create upcoming_expenses table
create table if not exists upcoming_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  details text not null default '',
  amount numeric(12, 2) not null,
  date date not null,
  wallet_id int references wallet(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 2. Enable row level security
alter table upcoming_expenses enable row level security;

-- 3. Create policies for public access (similar to other tables)
create policy "Allow public read upcoming_expenses"
  on upcoming_expenses for select using (true);

create policy "Allow public insert upcoming_expenses"
  on upcoming_expenses for insert with check (true);

create policy "Allow public update upcoming_expenses"
  on upcoming_expenses for update using (true) with check (true);

create policy "Allow public delete upcoming_expenses"
  on upcoming_expenses for delete using (true);
