-- Run this in your Supabase SQL editor

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  daily_compressions integer not null default 0,
  last_compression_date date,
  total_compressions integer not null default 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default now()
);

-- Compression history
create table public.compression_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  original text not null,
  compressed text not null,
  level text not null,
  saved_percent integer default 0,
  saved_tokens integer default 0,
  created_at timestamp with time zone default now()
);

-- Row level security
alter table public.profiles enable row level security;
alter table public.compression_history enable row level security;

-- Users can only see their own profile
create policy "users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can only see their own history
create policy "users can view own history"
  on public.compression_history for select
  using (auth.uid() = user_id);

-- Service role can do everything (for API routes)
-- (service role bypasses RLS by default)

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
