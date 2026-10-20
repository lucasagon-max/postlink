-- 0014_perfil_lojista_e_expectativas.sql
-- Adiciona campos de perfil do cliente, contato comercial e alinhamento de expectativas

ALTER TABLE public.lojas
  ADD COLUMN IF NOT EXISTS responsavel_nome text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS cidade text,
  ADD COLUMN IF NOT EXISTS estado text,
  ADD COLUMN IF NOT EXISTS ramo_atividade text,
  ADD COLUMN IF NOT EXISTS expectativa text,
  ADD COLUMN IF NOT EXISTS expectativa_detalhes text;

-- Atualiza a função criar_loja para receber os novos campos de onboarding
CREATE OR REPLACE FUNCTION public.criar_loja(
  p_nome text,
  p_slug text,
  p_responsavel_nome text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_cidade text DEFAULT NULL,
  p_estado text DEFAULT NULL,
  p_ramo_atividade text DEFAULT NULL,
  p_expectativa text DEFAULT NULL,
  p_expectativa_detalhes text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO lojas(
    id,
    nome,
    slug,
    responsavel_nome,
    whatsapp,
    cidade,
    estado,
    ramo_atividade,
    expectativa,
    expectativa_detalhes
  )
  VALUES (
    auth.uid(),
    p_nome,
    p_slug,
    NULLIF(TRIM(p_responsavel_nome), ''),
    NULLIF(TRIM(p_whatsapp), ''),
    NULLIF(TRIM(p_cidade), ''),
    NULLIF(UPPER(TRIM(p_estado)), ''),
    NULLIF(TRIM(p_ramo_atividade), ''),
    NULLIF(TRIM(p_expectativa), ''),
    NULLIF(TRIM(p_expectativa_detalhes), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    slug = EXCLUDED.slug,
    responsavel_nome = COALESCE(EXCLUDED.responsavel_nome, lojas.responsavel_nome),
    whatsapp = COALESCE(EXCLUDED.whatsapp, lojas.whatsapp),
    cidade = COALESCE(EXCLUDED.cidade, lojas.cidade),
    estado = COALESCE(EXCLUDED.estado, lojas.estado),
    ramo_atividade = COALESCE(EXCLUDED.ramo_atividade, lojas.ramo_atividade),
    expectativa = COALESCE(EXCLUDED.expectativa, lojas.expectativa),
    expectativa_detalhes = COALESCE(EXCLUDED.expectativa_detalhes, lojas.expectativa_detalhes);

  INSERT INTO assinaturas(loja_id)
  VALUES (auth.uid())
  ON CONFLICT (loja_id) DO NOTHING;
END $$;

GRANT EXECUTE ON FUNCTION public.criar_loja(text, text, text, text, text, text, text, text, text) TO authenticated;

-- Atualiza a função admin_obter_lojas para retornar os novos dados para o Painel Administrativo
CREATE OR REPLACE FUNCTION public.admin_obter_lojas(
  p_termo text default null,
  p_status text default 'todos',
  p_limite int default 50,
  p_offset int default 0
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE AS $$
DECLARE
  v_res json;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Acesso negado: privilégios de administrador necessários';
  END IF;

  SELECT coalesce(json_agg(t), '[]'::json)
  INTO v_res
  FROM (
    SELECT
      lj.id as loja_id,
      coalesce(u.email::text, 'sem-email') as email,
      lj.nome::text as nome,
      lj.slug::text as slug,
      lj.responsavel_nome::text as responsavel_nome,
      lj.whatsapp::text as whatsapp,
      lj.cidade::text as cidade,
      lj.estado::text as estado,
      lj.ramo_atividade::text as ramo_atividade,
      lj.expectativa::text as expectativa,
      lj.expectativa_detalhes::text as expectativa_detalhes,
      lj.criado_em,
      CASE
        WHEN a.status = 'trial' and a.trial_ate < now() THEN 'expirado'
        ELSE coalesce(a.status, 'trial')
      END::text as status_assinatura,
      a.trial_ate,
      greatest(0, ceil(extract(epoch from (coalesce(a.trial_ate, now()) - now())) / 86400)::int) as dias_trial_restantes,
      coalesce(count(distinct l.id), 0)::bigint as total_links,
      coalesce(count(c.id), 0)::bigint as total_cliques,
      coalesce(max(l.versao), 1)::int as max_versao
    FROM public.lojas lj
    LEFT JOIN auth.users u ON u.id = lj.id
    LEFT JOIN public.assinaturas a ON a.loja_id = lj.id
    LEFT JOIN public.links l ON l.loja_id = lj.id
    LEFT JOIN public.cliques c ON c.link_id = l.id
    WHERE
      (p_termo IS NULL OR p_termo = '' OR
       lj.nome ILIKE '%' || p_termo || '%' OR
       lj.slug ILIKE '%' || p_termo || '%' OR
       coalesce(lj.responsavel_nome, '') ILIKE '%' || p_termo || '%' OR
       coalesce(lj.whatsapp, '') ILIKE '%' || p_termo || '%' OR
       coalesce(lj.cidade, '') ILIKE '%' || p_termo || '%' OR
       coalesce(lj.ramo_atividade, '') ILIKE '%' || p_termo || '%' OR
       u.email ILIKE '%' || p_termo || '%')
      AND
      (p_status = 'todos' OR
       (p_status = 'ativo' and a.status = 'ativo') OR
       (p_status = 'trial' and a.status = 'trial' and a.trial_ate >= now()) OR
       (p_status = 'expirado' and ((a.status = 'expirado') or (a.status = 'trial' and a.trial_ate < now()))) OR
       (p_status = 'cancelado' and a.status in ('cancelado', 'suspenso')))
    GROUP BY lj.id, u.email, a.status, a.trial_ate
    ORDER BY lj.criado_em DESC
    LIMIT p_limite OFFSET p_offset
  ) t;

  RETURN v_res;
END;
$$;
