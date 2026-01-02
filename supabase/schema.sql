-- Create table pages
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  content jsonb not null default '{"blocks": []}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade
);

-- Indexes
create index if not exists idx_pages_user_id on pages(user_id);
create index if not exists idx_pages_updated_at on pages(updated_at desc);
create index if not exists idx_pages_title on pages using gin(to_tsvector('english', title));

-- Function for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
drop trigger if exists update_pages_updated_at on pages;
create trigger update_pages_updated_at
  before update on pages
  for each row
  execute function update_updated_at_column();

-- Enable RLS
alter table pages enable row level security;

-- Policies
create policy "Users can view their own pages"
  on pages for select
  using (auth.uid() = user_id);

create policy "Users can create their own pages"
  on pages for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own pages"
  on pages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own pages"
  on pages for delete
  using (auth.uid() = user_id);
