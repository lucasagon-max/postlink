-- 0017_horarios_pico_cliques.sql: Métricas de horários de pico e distribuição por hora de cliques

-- 1. Função para obter o resumo do horário de pico para todos os links da loja
create or replace function public.obter_resumo_horarios_links(p_dias int default 30)
returns table (
  link_id uuid,
  hora_pico int,
  cliques_pico bigint,
  total_periodo bigint
)
language sql security definer set search_path = public stable as $$
  with contagem_por_hora as (
    select
      c.link_id,
      extract(hour from c.criado_em at time zone 'America/Sao_Paulo')::int as hora,
      count(c.id) as qtd
    from cliques c
    join links l on l.id = c.link_id
    where l.loja_id = auth.uid()
      and (p_dias is null or p_dias <= 0 or c.criado_em > now() - make_interval(days => p_dias))
    group by c.link_id, 2
  ),
  ranqueado as (
    select
      link_id,
      hora,
      qtd,
      row_number() over (partition by link_id order by qtd desc, hora asc) as rn,
      sum(qtd) over (partition by link_id) as total_geral
    from contagem_por_hora
  )
  select
    l.id as link_id,
    coalesce(r.hora, -1)::int as hora_pico,
    coalesce(r.qtd, 0)::bigint as cliques_pico,
    coalesce(r.total_geral, 0)::bigint as total_periodo
  from links l
  left join ranqueado r on r.link_id = l.id and r.rn = 1
  where l.loja_id = auth.uid();
$$;

revoke all on function public.obter_resumo_horarios_links(int) from public;
grant execute on function public.obter_resumo_horarios_links(int) to authenticated;

-- 2. Função para obter o histograma completo de 24 horas (0h às 23h) de um link específico
create or replace function public.obter_horarios_cliques_link(
  p_link_id uuid,
  p_dias int default 30
)
returns table (
  hora int,
  total bigint
)
language sql security definer set search_path = public stable as $$
  with series as (
    select generate_series(0, 23) as hora
  ),
  cliques_link as (
    select
      extract(hour from c.criado_em at time zone 'America/Sao_Paulo')::int as hora,
      count(c.id) as qtd
    from cliques c
    join links l on l.id = c.link_id
    where c.link_id = p_link_id
      and l.loja_id = auth.uid()
      and (p_dias is null or p_dias <= 0 or c.criado_em > now() - make_interval(days => p_dias))
    group by 1
  )
  select
    s.hora,
    coalesce(cl.qtd, 0)::bigint as total
  from series s
  left join cliques_link cl on cl.hora = s.hora
  order by s.hora;
$$;

revoke all on function public.obter_horarios_cliques_link(uuid, int) from public;
grant execute on function public.obter_horarios_cliques_link(uuid, int) to authenticated;
