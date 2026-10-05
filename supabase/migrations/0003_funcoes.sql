-- 0003_funcoes.sql: Funções RPC e Triggers de Integridade
create or replace function public.tocar_atualizado() returns trigger
language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

drop trigger if exists trg_links_atualizado on public.links;
create trigger trg_links_atualizado before update on public.links
for each row execute function public.tocar_atualizado();

-- Cadastro da loja + início do teste de 7 dias num único passo
create or replace function public.criar_loja(p_nome text, p_slug text) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into lojas(id, nome, slug) values (auth.uid(), p_nome, p_slug);
  insert into assinaturas(loja_id) values (auth.uid());
end $$;

-- Limites e bloqueios na criação de links
create or replace function public.checar_limites_link() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_status text;
  v_ativos int;
  v_hoje int;
begin
  select status into v_status from assinaturas where loja_id = new.loja_id;
  if v_status is null or v_status not in ('trial','ativo') then
    raise exception 'assinatura inativa ou expirada';
  end if;

  select count(*) into v_ativos from links where loja_id = new.loja_id and ativo;
  if v_ativos >= 50 then
    raise exception 'limite de links ativos atingido (máx 50)';
  end if;

  select count(*) into v_hoje from links
    where loja_id = new.loja_id and criado_em > now() - interval '1 day';
  if v_hoje >= 30 then
    raise exception 'limite diário de criação atingido (máx 30/dia)';
  end if;

  if exists (
    select 1 from destinos_bloqueados d
    where new.destino ~* ('^https://([^/]*\.)?' || replace(d.dominio, '.', '\.') || '(/|$)')
  ) then
    raise exception 'destino bloqueado por segurança';
  end if;

  return new;
end $$;

drop trigger if exists trg_checar_limites on public.links;
create trigger trg_checar_limites before insert on public.links
for each row execute function public.checar_limites_link();

-- Leitura pública do link no Edge com checagem de loja ativa/trial
create or replace function public.obter_link_publico(p_loja text, p_slug text)
returns table (
  link_id uuid,
  destino text,
  imagem_path text,
  versao int,
  titulo text,
  descricao text,
  loja_nome text,
  expirado boolean
)
language sql security definer set search_path = public stable as $$
  select
    l.id,
    l.destino,
    l.imagem_path,
    l.versao,
    l.titulo,
    l.descricao,
    lj.nome,
    (l.valido_ate is not null and l.valido_ate < now())
  from links l
  join lojas lj on lj.id = l.loja_id
  join assinaturas a on a.loja_id = lj.id
  where lj.slug = p_loja
    and l.slug = p_slug
    and l.ativo
    and a.status in ('trial','ativo','atrasado');
$$;

create or replace function public.registrar_clique(p_link uuid, p_origem text, p_dispositivo text)
returns void language sql security definer set search_path = public as $$
  insert into cliques(link_id, origem, dispositivo)
  values (
    p_link,
    left(p_origem, 100),
    case when p_dispositivo in ('mobile','desktop') then p_dispositivo end
  );
$$;

create or replace function public.denunciar_link(p_loja text, p_slug text, p_motivo text)
returns void language sql security definer set search_path = public as $$
  insert into denuncias(link_id, motivo)
  select l.id, left(p_motivo, 300)
  from links l
  join lojas lj on lj.id = l.loja_id
  where lj.slug = p_loja and l.slug = p_slug;
$$;

-- Estatísticas consolidadas para o painel do lojista
create or replace function public.estatisticas_links(p_dias int default 30)
returns table (link_id uuid, total bigint, recentes bigint)
language sql security definer set search_path = public stable as $$
  select
    l.id,
    count(c.id),
    count(c.id) filter (where c.criado_em > now() - make_interval(days => p_dias))
  from links l
  left join cliques c on c.link_id = l.id
  where l.loja_id = auth.uid()
  group by l.id;
$$;

-- Permissões explícitas de execução
revoke all on function public.criar_loja(text, text)                    from public;
revoke all on function public.obter_link_publico(text, text)           from public;
revoke all on function public.registrar_clique(uuid, text, text)       from public;
revoke all on function public.denunciar_link(text, text, text)         from public;
revoke all on function public.estatisticas_links(int)                  from public;

grant execute on function public.criar_loja(text, text)                to authenticated;
grant execute on function public.estatisticas_links(int)               to authenticated;
grant execute on function public.obter_link_publico(text, text)        to anon, authenticated;
grant execute on function public.registrar_clique(uuid, text, text)    to anon, authenticated;
grant execute on function public.denunciar_link(text, text, text)      to anon, authenticated;
