-- Normativa y base de criterios versionada

drop type if exists nivel_riesgo;
create type nivel_riesgo as enum ('bajo', 'medio', 'alto');
create type estado_norma as enum ('verificada', 'marco', 'verificar', 'no_usar');

create table normas (
  id                  uuid primary key default gen_random_uuid(),
  tipo                text not null,
  numero              text not null,
  anio                int  not null,
  titulo              text not null,
  estado              estado_norma not null default 'verificar',
  enlace              text,
  fecha_verificacion  date,
  unique (tipo, numero, anio)
);

create table versiones_criterios (
  id         text primary key,             -- '2026.09'
  fecha      date not null,
  activa     boolean not null default false,
  notas      text
);

create unique index una_version_activa
  on versiones_criterios (activa) where activa;

create table criterios (
  id                 uuid primary key default gen_random_uuid(),
  version_id         text not null references versiones_criterios(id) on delete cascade,
  codigo             text not null,
  estandar           text not null,
  leccion            text,
  descripcion        text not null,
  evidencia_esperada text not null,
  riesgo             nivel_riesgo not null,
  norma_id           uuid references normas(id),
  cruza_con          text[] not null default '{}',
  aplica_a           jsonb  not null default '{}',
  unique (version_id, codigo)
);

create index on criterios (version_id, estandar);
create index on criterios (riesgo);

alter table normas enable row level security;
alter table versiones_criterios enable row level security;
alter table criterios enable row level security;

create policy "lectura de normas" on normas
  for select to authenticated using (true);
create policy "admin gestiona normas" on normas
  for all using (rol_actual() = 'administrador') with check (rol_actual() = 'administrador');

create policy "lectura de versiones" on versiones_criterios
  for select to authenticated using (true);
create policy "admin gestiona versiones" on versiones_criterios
  for all using (rol_actual() = 'administrador') with check (rol_actual() = 'administrador');

create policy "lectura de criterios" on criterios
  for select to authenticated using (true);
create policy "admin gestiona criterios" on criterios
  for all using (rol_actual() = 'administrador') with check (rol_actual() = 'administrador');
