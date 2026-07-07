-- Create dispatches table for short-form blog posts ("Dispatches")
create table if not exists public.dispatches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  lens text not null check (lens in ('health', 'philosophy', 'politics')),
  excerpt text not null,
  body text not null,
  author text not null default 'The Chairman',
  cover_image text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Index for listing (newest-first)
create index if not exists idx_dispatches_published_at
  on public.dispatches (published_at desc);

-- Enable RLS (read-only public access)
alter table public.dispatches enable row level security;
create policy "Dispatches are publicly readable"
  on public.dispatches for select
  using (true);
