-- ============================================================================
-- Vibra Music · Función de disponibilidad del estudio
-- ----------------------------------------------------------------------------
-- Cómo usarlo:
--   1. Supabase > SQL Editor > New query.
--   2. Pega este contenido y pulsa "Run".
--
-- Devuelve SOLO qué franjas están ocupadas en una fecha (sin datos personales).
-- Es "security definer" para poder leer todas las reservas aunque RLS impida a
-- un alumno ver las de los demás.
-- ============================================================================

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

-- Fuerza a PostgREST a recargar el esquema para que detecte la función ya mismo.
notify pgrst, 'reload schema';
