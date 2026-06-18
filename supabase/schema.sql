-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists wallet (
  id int primary key default 1 check (id = 1),
  balance numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

insert into wallet (id, balance)
values (1, 0)
on conflict (id) do nothing;

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  amount numeric(12, 2) not null,
  description text not null default '',
  category text not null check (category in ('Food', 'Bills', 'Transport', 'Income')),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table wallet enable row level security;
alter table transactions enable row level security;

create policy "Allow public read wallet"
  on wallet for select using (true);

create policy "Allow public update wallet"
  on wallet for update using (true) with check (true);

create policy "Allow public read transactions"
  on transactions for select using (true);

create policy "Allow public insert transactions"
  on transactions for insert with check (true);

create policy "Allow public delete transactions"
  on transactions for delete using (true);
