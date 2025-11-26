-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('admin', 'apoteker', 'kasir', 'customer')) default 'customer',
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

create policy "Admins can update any profile."
  on profiles for update
  using ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create categories table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  stock integer not null default 0,
  image_url text,
  barcode text unique,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on barcode for faster lookups
create index idx_products_barcode on public.products(barcode);
create index idx_products_category_id on public.products(category_id);

-- Enable RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- Create policies for categories
create policy "Categories are viewable by everyone."
  on categories for select
  using ( true );

create policy "Only admins can insert categories."
  on categories for insert
  with check ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can update categories."
  on categories for update
  using ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can delete categories."
  on categories for delete
  using ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create policies for products
create policy "Products are viewable by everyone."
  on products for select
  using ( true );

create policy "Only staff can insert products."
  on products for insert
  with check ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'apoteker')
    )
  );

create policy "Only staff can update products."
  on products for update
  using ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'apoteker')
    )
  );

-- Create orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  total numeric not null,
  shipping_cost numeric not null default 0,
  status text check (status in ('pending', 'paid', 'shipped', 'completed', 'cancelled')) default 'pending',
  payment_method text,
  payment_reference text,
  payment_status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on user_id for better query performance
create index idx_orders_user_id on public.orders(user_id);

-- Enable RLS
alter table public.orders enable row level security;

-- Create policies for orders
create policy "Users can view their own orders."
  on orders for select
  using ( auth.uid() = user_id );

create policy "Staff can view all orders."
  on orders for select
  using ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'kasir', 'apoteker')
    )
  );

create policy "Users can create their own orders."
  on orders for insert
  with check ( auth.uid() = user_id );

-- Create order_items table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products,
  quantity integer not null,
  price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.order_items enable row level security;

-- Create policies for order_items
create policy "Users can view their own order items."
  on order_items for select
  using ( 
    exists (
      select 1 from orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

create policy "Staff can view all order items."
  on order_items for select
  using ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'kasir', 'apoteker')
    )
  );

create policy "Users can create their own order items."
  on order_items for insert
  with check ( 
    exists (
      select 1 from orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'customer'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create settings table
create table public.settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- Create index on key for faster lookups
create index idx_settings_key on public.settings(key);

-- Enable RLS
alter table public.settings enable row level security;

-- Create policies for settings
create policy "Settings are viewable by everyone."
  on settings for select
  using ( true );

create policy "Only admins can update settings."
  on settings for update
  using ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can insert settings."
  on settings for insert
  with check ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Insert default general settings
insert into public.settings (key, value) 
values (
  'general',
  '{"storeName": "APOTIK POS", "storeEmail": "info@apotikpos.com", "storePhone": "+62 812-3456-7890", "storeAddress": "Jl. Kesehatan No. 123, Jakarta", "taxRate": "11", "currency": "IDR", "pakasirMerchantCode": "", "pakasirApiKey": "", "pakasirCallbackUrl": "", "pakasirReturnUrl": ""}'::jsonb
)
on conflict (key) do nothing;
