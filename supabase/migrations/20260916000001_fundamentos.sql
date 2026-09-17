-- Identidad, roles y grupos

create type rol_usuario as enum ('estudiante', 'docente', 'administrador');

create table perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text not null default '',
  rol        rol_usuario not null default 'estudiante',
  creado_en  timestamptz not null default now()
);

-- Lee el rol sin disparar RLS sobre perfiles (evita recursión en las políticas)
create or replace function public.rol_actual()
returns rol_usuario
language sql stable security definer set search_path = public as $$
  select rol from perfiles where id = auth.uid()
$$;

create table grupos (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  periodo    text,
  docente_id uuid not null references perfiles(id) on delete restrict,
  creado_en  timestamptz not null default now()
);

create table inscripciones_grupo (
  grupo_id      uuid references grupos(id) on delete cascade,
  estudiante_id uuid references perfiles(id) on delete cascade,
  creado_en     timestamptz not null default now(),
  primary key (grupo_id, estudiante_id)
);

create index on grupos (docente_id);
create index on inscripciones_grupo (estudiante_id);

-- Crea el perfil automáticamente al registrarse
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', ''));
  return new;
end $$;

create trigger al_crear_usuario
after insert on auth.users
for each row execute function public.crear_perfil();

-- Políticas
alter table perfiles enable row level security;
alter table grupos enable row level security;
alter table inscripciones_grupo enable row level security;

create policy "perfil propio" on perfiles
  for select using (id = auth.uid() or rol_actual() in ('docente', 'administrador'));

create policy "editar perfil propio" on perfiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "admin gestiona perfiles" on perfiles
  for all using (rol_actual() = 'administrador') with check (rol_actual() = 'administrador');

create policy "ver grupos propios" on grupos
  for select using (
    docente_id = auth.uid()
    or rol_actual() = 'administrador'
    or exists (
      select 1 from inscripciones_grupo i
      where i.grupo_id = grupos.id and i.estudiante_id = auth.uid()
    )
  );

create policy "docente gestiona sus grupos" on grupos
  for all using (docente_id = auth.uid() or rol_actual() = 'administrador')
  with check (docente_id = auth.uid() or rol_actual() = 'administrador');

create policy "ver inscripciones" on inscripciones_grupo
  for select using (
    estudiante_id = auth.uid()
    or rol_actual() = 'administrador'
    or exists (
      select 1 from grupos g
      where g.id = inscripciones_grupo.grupo_id and g.docente_id = auth.uid()
    )
  );

create policy "docente inscribe" on inscripciones_grupo
  for all using (
    rol_actual() = 'administrador'
    or exists (
      select 1 from grupos g
      where g.id = inscripciones_grupo.grupo_id and g.docente_id = auth.uid()
    )
  ) with check (
    rol_actual() = 'administrador'
    or exists (
      select 1 from grupos g
      where g.id = inscripciones_grupo.grupo_id and g.docente_id = auth.uid()
    )
  );
