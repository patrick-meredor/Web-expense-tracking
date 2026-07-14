-- 1. Add user_id column mapped to auth.users.id with default auth.uid()
alter table transactions add column if not exists user_id uuid references auth.users(id) default auth.uid();
alter table upcoming_expenses add column if not exists user_id uuid references auth.users(id) default auth.uid();

-- 2. Drop existing public RLS policies on transactions
drop policy if exists "Allow public read transactions" on transactions;
drop policy if exists "Allow public insert transactions" on transactions;
drop policy if exists "Allow public delete transactions" on transactions;

-- 3. Create new user-restricted RLS policies on transactions
create policy "Allow users to read their own transactions"
  on transactions for select using (auth.uid() = user_id);

create policy "Allow users to insert their own transactions"
  on transactions for insert with check (auth.uid() = user_id);

create policy "Allow users to update their own transactions"
  on transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Allow users to delete their own transactions"
  on transactions for delete using (auth.uid() = user_id);

-- 4. Drop existing public RLS policies on upcoming_expenses
drop policy if exists "Allow public read upcoming_expenses" on upcoming_expenses;
drop policy if exists "Allow public insert upcoming_expenses" on upcoming_expenses;
drop policy if exists "Allow public update upcoming_expenses" on upcoming_expenses;
drop policy if exists "Allow public delete upcoming_expenses" on upcoming_expenses;

-- 5. Create new user-restricted RLS policies on upcoming_expenses
create policy "Allow users to read their own upcoming_expenses"
  on upcoming_expenses for select using (auth.uid() = user_id);

create policy "Allow users to insert their own upcoming_expenses"
  on upcoming_expenses for insert with check (auth.uid() = user_id);

create policy "Allow users to update their own upcoming_expenses"
  on upcoming_expenses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Allow users to delete their own upcoming_expenses"
  on upcoming_expenses for delete using (auth.uid() = user_id);

-- 6. Backfill existing legacy records to the first authenticated user (if any exists)
do $$
declare
  first_user_id uuid;
begin
  select id into first_user_id from auth.users limit 1;
  if first_user_id is not null then
    update transactions set user_id = first_user_id where user_id is null;
    update upcoming_expenses set user_id = first_user_id where user_id is null;
  end if;
end $$;
