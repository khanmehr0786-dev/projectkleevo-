-- KLEEVO schema. Review existing project objects before applying to an existing database.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_kleevo on auth.users;
create trigger on_auth_user_created_kleevo after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  size_ml integer not null default 500 check (size_ml > 0),
  price_inr numeric(10,2) not null check (price_inr > 0),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  is_active boolean not null default true,
  image_url text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade the user's already-created products table safely if it has the earlier minimal columns.
alter table public.products add column if not exists description text;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists updated_at timestamptz not null default now();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  items jsonb not null,
  total_inr numeric(12,2) not null check (total_inr > 0),
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_status text not null default 'created' check (payment_status in ('created','paid','failed','refunded')),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists shipping_address jsonb;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  user_id uuid not null references auth.users(id),
  razorpay_payment_id text unique not null,
  razorpay_order_id text not null,
  status text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Profiles readable by owner" on public.profiles;
create policy "Profiles readable by owner" on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
drop policy if exists "Users update own basic profile" on public.profiles;
create policy "Users update own basic profile" on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid() and role='customer');
drop policy if exists "Active products public read" on public.products;
create policy "Active products public read" on public.products for select to anon,authenticated using (is_active or public.is_admin());
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders" on public.orders for select to authenticated using (user_id=auth.uid() or public.is_admin());
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Customers read own payments" on public.payments;
create policy "Customers read own payments" on public.payments for select to authenticated using (user_id=auth.uid() or public.is_admin());

-- No client insert/update policies for orders/payments: Netlify Functions use service role
-- after authenticating the user and validating product prices on the server.

insert into public.products (sku,name,description,size_ml,price_inr,stock_qty,is_active,category)
values
('KLV-DW-500','KLEEVO Dish Wash','Cuts through everyday grease for sparkling utensils.',500,100,0,true,'Kitchen'),
('KLV-CD-500','KLEEVO Cloth Detergent','A fresh clean for everyday fabrics.',500,110,0,true,'Laundry'),
('KLV-FW-500','KLEEVO Floor Wash','A refreshing clean for everyday floor care.',500,110,0,true,'Home'),
('KLV-TC-500','KLEEVO Toilet Cleaner','Targeted cleaning for toilet surfaces.',500,100,0,true,'Bathroom'),
('KLV-BC-500','KLEEVO Bathroom Cleaner','Everyday bathroom surface cleaning.',500,100,0,true,'Bathroom'),
('KLV-CW-500','KLEEVO Car Wash','Car shampoo for your vehicle care routine. Shake well before use.',500,210,0,true,'Vehicle'),
('KLV-GC-500','KLEEVO Glass Cleaner','Streak-free shine for glass surfaces.',500,110,0,true,'Home')
on conflict (sku) do update set
 name=excluded.name,description=excluded.description,size_ml=excluded.size_ml,
 price_inr=excluded.price_inr,category=excluded.category;

-- Admin assignment: after registering the owner account, run manually in SQL Editor:
-- update public.profiles set role='admin'
-- where id=(select id from auth.users where email='YOUR_OWNER_EMAIL');
