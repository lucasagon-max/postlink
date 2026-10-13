-- 0009_denuncias_e_seguranca.sql: Aperfeiçoamento da governança, denúncias e segurança

-- 1. Habilitar RLS em administradores para fechar brecha de segurança
alter table public.administradores enable row level security;

-- 2. Expandir colunas da tabela de denúncias
alter table public.denuncias add column if not exists url_denunciada text;
alter table public.denuncias add column if not exists descricao text;
alter table public.denuncias add column if not exists email_denunciante text;
alter table public.denuncias add column if not exists status text not null default 'pendente';
alter table public.denuncias add column if not exists resolvido_em timestamptz;

-- 3. Função pública aprimorada para registrar denúncia
create or replace function public.denunciar_link(
  p_url text,
  p_motivo text,
  p_descricao text default null,
  p_email text default null
)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_link_id uuid;
  v_loja_slug text;
  v_link_slug text;
  v_match text[];
begin
  -- Tenta extrair slug da loja e do link da URL
  v_match := regexp_matches(p_url, '(?:https?://[^/]+/)?([a-z0-9_-]+)/([a-z0-9_-]+)', 'i');
  if v_match is not null and array_length(v_match, 1) >= 2 then
    v_loja_slug := lower(v_match[1]);
    v_link_slug := lower(v_match[2]);

    select l.id into v_link_id
    from public.links l
    join public.lojas lj on lj.id = l.loja_id
    where lj.slug = v_loja_slug and l.slug = v_link_slug
    limit 1;
  end if;

  insert into public.denuncias(link_id, motivo, url_denunciada, descricao, email_denunciante, status)
  values (v_link_id, left(p_motivo, 100), left(p_url, 500), left(p_descricao, 1000), left(p_email, 200), 'pendente');

  return json_build_object('sucesso', true, 'mensagem', 'Denúncia registrada com sucesso.');
end;
$$;

-- 4. RPC Administrativa: Obter denúncias com filtros
create or replace function public.admin_obter_denuncias(
  p_status text default 'todas',
  p_limite int default 50
)
returns json
language plpgsql security definer set search_path = public stable as $$
declare
  v_res json;
begin
  if not public.is_super_admin() then
    raise exception 'Acesso negado: privilégios de administrador necessários';
  end if;

  select coalesce(json_agg(t), '[]'::json)
  into v_res
  from (
    select
      d.id as denuncia_id,
      d.url_denunciada,
      d.motivo,
      d.descricao,
      d.email_denunciante,
      d.status,
      d.criado_em,
      d.link_id,
      l.slug as link_slug,
      l.destino,
      l.ativo as link_ativo,
      lj.id as loja_id,
      lj.nome as loja_nome,
      lj.slug as loja_slug,
      a.status as status_assinatura
    from public.denuncias d
    left join public.links l on l.id = d.link_id
    left join public.lojas lj on lj.id = l.loja_id
    left join public.assinaturas a on a.loja_id = lj.id
    where (p_status = 'todas' or d.status = p_status)
    order by d.criado_em desc
    limit p_limite
  ) t;

  return v_res;
end;
$$;

-- 5. RPC Administrativa: Agir sobre denúncia (Bloquear link, Banir loja, Descartar)
create or replace function public.admin_resolver_denuncia(
  p_denuncia_id bigint,
  p_acao text
)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_link_id uuid;
  v_loja_id uuid;
begin
  if not public.is_super_admin() then
    raise exception 'Acesso negado: privilégios de administrador necessários';
  end if;

  select d.link_id, l.loja_id
  into v_link_id, v_loja_id
  from public.denuncias d
  left join public.links l on l.id = d.link_id
  where d.id = p_denuncia_id;

  if p_acao = 'bloquear_link' and v_link_id is not null then
    update public.links set ativo = false, atualizado_em = now() where id = v_link_id;
    update public.denuncias set status = 'bloqueado', resolvido_em = now() where id = p_denuncia_id;
  elsif p_acao = 'banir_loja' and v_loja_id is not null then
    update public.links set ativo = false, atualizado_em = now() where loja_id = v_loja_id;
    update public.assinaturas set status = 'suspenso', atualizado_em = now() where loja_id = v_loja_id;
    update public.denuncias set status = 'banido', resolvido_em = now() where id = p_denuncia_id;
  elsif p_acao = 'descartar' then
    update public.denuncias set status = 'descartado', resolvido_em = now() where id = p_denuncia_id;
  else
    raise exception 'Ação inválida: %', p_acao;
  end if;

  return json_build_object('sucesso', true, 'acao', p_acao, 'denuncia_id', p_denuncia_id);
end;
$$;

-- 6. Permissões
revoke all on function public.denunciar_link(text, text, text, text) from public;
revoke all on function public.admin_obter_denuncias(text, int) from public;
revoke all on function public.admin_resolver_denuncia(bigint, text) from public;

grant execute on function public.denunciar_link(text, text, text, text) to anon, authenticated;
grant execute on function public.admin_obter_denuncias(text, int) to authenticated;
grant execute on function public.admin_resolver_denuncia(bigint, text) to authenticated;
