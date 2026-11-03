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

-- El nombre se puede editar desde la API: acota su longitud. "not valid" evita
-- fallar si ya hubiera filas antiguas más largas; se aplica a inserts/updates.
alter table public.profiles drop constraint if exists profiles_name_length;
alter table public.profiles
  add constraint profiles_name_length check (char_length(name) <= 120) not valid;

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
  values (
    new.id,
    left(btrim(coalesce(new.raw_user_meta_data ->> 'name', '')), 120),
    lower(new.email)
  )
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

-- Valida las reservas en servidor: no acepta fechas pasadas ni textos
-- desmedidos aunque alguien llame a la API directamente sin pasar por la web.
create or replace function public.validate_booking()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.notes := btrim(coalesce(new.notes, ''));

  if new.date < (now() at time zone 'Europe/Madrid')::date then
    raise exception 'No se pueden reservar fechas pasadas';
  end if;
  if char_length(new.slot) = 0 or char_length(new.slot) > 40 then
    raise exception 'Franja horaria no válida';
  end if;
  if char_length(new.service) = 0 or char_length(new.service) > 80 then
    raise exception 'Servicio no válido';
  end if;
  if char_length(new.notes) > 1000 then
    raise exception 'Las notas son demasiado largas';
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_before_insert on public.bookings;
create trigger bookings_before_insert
  before insert on public.bookings
  for each row execute function public.validate_booking();

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

-- Normaliza el mensaje antes de insertarlo: recorta espacios, pasa el email a
-- minúsculas, fuerza read=false/created_at=now() y evita que una sesión firme
-- un mensaje con el user_id de otra cuenta.
create or replace function public.normalize_message()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.id := gen_random_uuid();
  new.name := btrim(new.name);
  new.email := lower(btrim(new.email));
  new.message := btrim(new.message);
  new.read := false;
  new.created_at := now();

  if new.user_id is not null and new.user_id is distinct from auth.uid() then
    raise exception 'user_id no coincide con la sesión';
  end if;

  return new;
end;
$$;

drop trigger if exists messages_before_insert on public.messages;
create trigger messages_before_insert
  before insert on public.messages
  for each row execute function public.normalize_message();

-- Cualquiera puede enviar un mensaje, pero no puede falsear su autoría, marcar
-- el mensaje como leído ni enviar campos vacíos o gigantes.
drop policy if exists "messages_insert_anyone" on public.messages;
create policy "messages_insert_anyone"
  on public.messages for insert
  to anon, authenticated
  with check (
    read = false
    and (user_id is null or user_id = auth.uid())
    and char_length(name) between 1 and 120
    and char_length(email) between 5 and 254
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(message) between 1 and 5000
  );

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

-- El autor (por usuario o por email) puede borrar sus mensajes; el admin, todos.
drop policy if exists "messages_delete_own_or_admin" on public.messages;
create policy "messages_delete_own_or_admin"
  on public.messages for delete
  using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- 5) PERMISOS
--    RLS filtra las filas; los GRANT permiten a los roles llegar a la tabla.
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

-- Perfiles: el usuario solo puede cambiar su nombre. Sin privilegios sobre
-- "role" ni "email" para que no pueda ascenderse a admin desde la API.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;

-- Reservas: nada para anónimos; los usuarios autenticados leen/crean/borran
-- según RLS. No hay update.
revoke all on public.bookings from anon, authenticated;
grant select, insert, delete on public.bookings to authenticated;

-- Mensajes: los anónimos solo insertan (y RLS limita lo que pueden leer). El
-- update queda para autenticados y RLS lo restringe al admin. El delete solo
-- para autenticados (los anónimos no tienen identidad).
revoke all on public.messages from anon, authenticated;
grant select, insert on public.messages to anon, authenticated;
-- El admin solo necesita marcar como leído; no puede reescribir el mensaje.
grant update (read) on public.messages to authenticated;
grant delete on public.messages to authenticated;

-- Índices para los filtros y la paginación del panel.
create index if not exists bookings_date_idx on public.bookings (date);
create index if not exists messages_created_at_idx on public.messages (created_at desc);
create index if not exists messages_read_idx on public.messages (read) where read = false;

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

-- ----------------------------------------------------------------------------
-- 8) RELLENAR LOS NOMBRES QUE SE QUEDARON VACÍOS
--    El trigger de la sección 1 solo copia el nombre si la cuenta se creó desde
--    el registro de la web. Las cuentas creadas directamente desde el panel de
--    Supabase (o anteriores a ese campo) se quedaron con profiles.name = ''.
--    Con el nombre vacío, el avatar de la cabecera muestra "?" en lugar de la
--    inicial, y el enlace de usuario se queda sin nombre accesible.
--    Es idempotente: solo toca filas cuyo nombre está en blanco.
--    Prioridad: nombre del registro -> parte del email anterior a "@".
-- ----------------------------------------------------------------------------
update public.profiles p
set name = left(
  coalesce(
    nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
    initcap(regexp_replace(split_part(p.email, '@', 1), '[._-]+', ' ', 'g'))
  ),
  120
)
from auth.users u
where u.id = p.id
  and btrim(coalesce(p.name, '')) = ''
  and coalesce(
    nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
    initcap(regexp_replace(split_part(p.email, '@', 1), '[._-]+', ' ', 'g'))
  ) is not null;
