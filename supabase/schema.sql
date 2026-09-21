-- ============================================================================
-- Vibra Music · Esquema de base de datos (Fase 0)
-- ----------------------------------------------------------------------------
-- Cómo usarlo:
--   1. Entra en tu proyecto de Supabase.
--   2. Abre "SQL Editor" > "New query".
--   3. Pega TODO el contenido de este fichero y pulsa "Run".
--
-- Es seguro ejecutarlo más de una vez (es idempotente).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) PERFILES
--    Una fila por usuario registrado. El "role" decide quién es admin.
--    (Se crea antes que is_admin() porque esa función lo consulta.)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ----------------------------------------------------------------------------
-- 2) Utilidad: ¿el usuario que consulta es administrador?
--    Se declara "security definer" para poder leer profiles sin chocar con
--    sus propias políticas RLS (evita recursión).
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Crea el perfil automáticamente al registrarse en Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3) RESERVAS DEL ESTUDIO
--    La restricción única (date, slot) impide reservar dos veces la misma
--    franja, a nivel global para todos los usuarios.
-- ----------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  slot text not null,
  service text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint bookings_unique_slot unique (date, slot)
);

alter table public.bookings enable row level security;

drop policy if exists "bookings_select_own_or_admin" on public.bookings;
create policy "bookings_select_own_or_admin"
  on public.bookings for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
  on public.bookings for insert
  with check (user_id = auth.uid());

drop policy if exists "bookings_delete_own_or_admin" on public.bookings;
create policy "bookings_delete_own_or_admin"
  on public.bookings for delete
  using (user_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- 4) MENSAJES DE CONTACTO
--    Cualquiera (incluso sin cuenta) puede enviarlos. Cada usuario ve los
--    suyos (por usuario o por email) y el admin los ve todos.
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "messages_insert_anyone" on public.messages;
create policy "messages_insert_anyone"
  on public.messages for insert
  with check (true);

drop policy if exists "messages_select_own_or_admin" on public.messages;
create policy "messages_select_own_or_admin"
  on public.messages for select
  using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_admin()
  );

drop policy if exists "messages_update_admin" on public.messages;
create policy "messages_update_admin"
  on public.messages for update
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5) PERMISOS
--    RLS filtra las filas; los GRANT permiten a los roles llegar a la tabla.
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, delete on public.bookings to authenticated;
grant select, insert, update on public.messages to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 6) DISPONIBILIDAD DEL ESTUDIO
--    Los alumnos no pueden leer las reservas de otros (RLS), así que esta
--    función "security definer" devuelve SOLO qué franjas están ocupadas en
--    una fecha, sin ningún dato personal.
-- ----------------------------------------------------------------------------
create or replace function public.get_booked_slots(p_date date)
returns table (slot text)
language sql
security definer
set search_path = public
stable
as $$
  select slot from public.bookings where date = p_date;
$$;

grant execute on function public.get_booked_slots(date) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 7) HACERTE ADMINISTRADOR
--    Después de registrarte en la web, descomenta la línea, pon tu email
--    y vuelve a ejecutar SOLO ese update.
-- ----------------------------------------------------------------------------
-- update public.profiles set role = 'admin' where email = 'TU_EMAIL@EJEMPLO.COM';
