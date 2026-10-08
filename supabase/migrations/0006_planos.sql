-- 0006_planos.sql: Suporte a múltiplos planos de assinatura no PostLink
-- Planos disponíveis:
--   - starter: Básico (até 5 links ativos)
--   - pro: Negócio / Ilimitado (links ilimitados)
--   - agencia: Escala / Multi-marcas (múltiplas lojas, links ilimitados)

alter table public.assinaturas
  add column if not exists plano text not null default 'pro'
  check (plano in ('starter', 'pro', 'agencia'));

-- Comentário explicativo
comment on column public.assinaturas.plano is 'Identificador do plano contratado: starter (Básico), pro (Negócio) ou agencia (Escala)';
