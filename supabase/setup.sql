create extension if not exists "pgcrypto";
create table if not exists public.products(
 id uuid primary key default gen_random_uuid(),
 code text not null,
 name text not null,
 category text not null,
 price numeric(12,2) not null,
 description text,
 image_url text,
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.products enable row level security;
drop policy if exists "public active products" on public.products;
create policy "public active products" on public.products for select using(is_active=true);
drop policy if exists "auth read products" on public.products;
create policy "auth read products" on public.products for select to authenticated using(true);
drop policy if exists "auth insert products" on public.products;
create policy "auth insert products" on public.products for insert to authenticated with check(true);
drop policy if exists "auth update products" on public.products;
create policy "auth update products" on public.products for update to authenticated using(true) with check(true);
insert into storage.buckets(id,name,public) values('sarees','sarees',true) on conflict(id) do nothing;
drop policy if exists "public saree images" on storage.objects;
create policy "public saree images" on storage.objects for select using(bucket_id='sarees');
drop policy if exists "auth upload saree images" on storage.objects;
create policy "auth upload saree images" on storage.objects for insert to authenticated with check(bucket_id='sarees');
drop policy if exists "auth update saree images" on storage.objects;
create policy "auth update saree images" on storage.objects for update to authenticated using(bucket_id='sarees') with check(bucket_id='sarees');
