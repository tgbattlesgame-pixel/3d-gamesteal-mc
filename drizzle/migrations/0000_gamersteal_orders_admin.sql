-- Order roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can read own roles"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- First account created becomes the owner-admin
create or replace function public.handle_first_user_admin()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles) then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_first_user_admin();

-- Orders (buyers need no account; they track by unguessable order code)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  mc_username text not null,
  email text not null,
  edition text not null default 'java',
  items jsonb not null,
  total numeric not null,
  proof_path text,
  status text not null default 'pending' check (status in ('pending','verified','rejected','delivered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert on public.orders to anon;
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;

alter table public.orders enable row level security;

create policy "Anyone can create an order"
  on public.orders for insert to anon, authenticated
  with check (status = 'pending' and proof_path is null);

create policy "Anyone can track an order by code"
  on public.orders for select to anon using (true);

create policy "Admins can view all orders"
  on public.orders for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage orders"
  on public.orders for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete orders"
  on public.orders for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_order_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_order_updated_at();

-- Chat per order
create table public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_code text not null references public.orders(code) on delete cascade,
  sender text not null check (sender in ('buyer','admin')),
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

grant select, insert on public.order_messages to anon;
grant select, insert, delete on public.order_messages to authenticated;
grant all on public.order_messages to service_role;

alter table public.order_messages enable row level security;

create policy "Anyone can read a chat thread"
  on public.order_messages for select to anon using (true);

create policy "Buyers can post to a chat thread"
  on public.order_messages for insert to anon, authenticated
  with check (sender = 'buyer');

create policy "Admins can read all chats"
  on public.order_messages for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can reply in chats"
  on public.order_messages for insert to authenticated
  with check (sender = 'admin' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete chat messages"
  on public.order_messages for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Payment proof uploads (private bucket created via tooling)
create policy "Buyers can upload payment proofs"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = 'proofs'
  );

create policy "Admins can view payment proofs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and public.has_role(auth.uid(), 'admin')
  );
