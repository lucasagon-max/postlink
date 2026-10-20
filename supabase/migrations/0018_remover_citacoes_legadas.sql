-- 0018_remover_citacoes_legadas.sql
-- Atualiza a função is_super_admin para conter estritamente os emails administrativos oficiais do PostLink

create or replace function public.is_super_admin()
returns boolean
language plpgsql
security definer
set search_path = public, auth
stable
as $$
declare
  v_uid uuid;
  v_email text;
begin
  v_uid := auth.uid();
  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if (v_email = '' or v_email is null) and v_uid is not null then
    select lower(email) into v_email
    from auth.users
    where id = v_uid;
  end if;

  if v_email = '' or v_email is null then
    return false;
  end if;

  return (
    v_email in ('lucas.a.gon@gmail.com', 'carmen.cattel@gmail.com')
    or exists (
      select 1 from public.administradores
      where lower(email) = v_email
    )
  );
end;
$$;

grant execute on function public.is_super_admin() to authenticated;
