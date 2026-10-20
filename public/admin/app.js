// public/admin/app.js - Painel Administrativo Executivo do PostLink
import { getSupabase } from '/assets/js/supabase-config.js';
import { comprimirImagem } from '/assets/js/compressao.js';

const sb = getSupabase();

// Estado Global do Admin
const state = {
  user: null,
  dashboard: null,
  lojistas: [],
  topLinks: [],
  denuncias: [],
  lojistaSelecionado: null,
  filtroStatus: 'todos',
  termoBusca: '',
  abaAtiva: 'visao-geral',
  subabaSiteAtiva: 'landing', // 'landing' | 'oficial'
  siteConfig: null,
  // 1. Imagem de Exemplo da Vitrine (Landing Page)
  siteBannerBlob: null,
  siteBannerPreviewUrl: '',
  siteBannerRemovido: false,
  // 2. Imagem Oficial (Link de Compartilhamento postlink.com.br)
  siteOficialBlob: null,
  siteOficialPreviewUrl: '',
  siteOficialRemovido: false,
};

// Mapeamento de Elementos do DOM
const el = {
  viewLoading: document.getElementById('view-loading'),
  viewNaoAutorizado: document.getElementById('view-nao-autorizado'),
  viewAdmin: document.getElementById('view-admin'),
  emailNegado: document.getElementById('email-negado'),
  adminUserEmail: document.getElementById('admin-user-email'),
  btnLogout: document.getElementById('btn-logout'),
  btnLogoutNegado: document.getElementById('btn-logout-negado'),
  btnAtualizarDados: document.getElementById('btn-atualizar-dados'),

  // Abas
  tabBtns: document.querySelectorAll('.admin-tab-btn'),
  paneVisaoGeral: document.getElementById('tab-pane-visao-geral'),
  paneLojistas: document.getElementById('tab-pane-lojistas'),
  paneTopLinks: document.getElementById('tab-pane-top-links'),
  paneDenuncias: document.getElementById('tab-pane-denuncias'),
  paneSiteOficial: document.getElementById('tab-pane-site-oficial'),
  tabelaDenunciasBody: document.getElementById('tabela-denuncias-body'),
  badgeDenuncias: document.getElementById('badge-denuncias-pendentes'),
  btnRecarregarDenuncias: document.getElementById('btn-recarregar-denuncias'),

  // Métricas Faturamento
  valMrr: document.getElementById('val-mrr'),
  valProjecaoAnual: document.getElementById('val-projecao-anual'),
  valReceitaReal: document.getElementById('val-receita-real'),
  valReceitaMes: document.getElementById('val-receita-mes'),
  valAtivas: document.getElementById('val-ativas'),
  valCortesias: document.getElementById('val-cortesias'),
  valTrial: document.getElementById('val-trial'),
  valConversao: document.getElementById('val-conversao'),
  valStatusExpiradas: document.getElementById('val-status-expiradas'),

  // Métricas Atividade
  valTotalLojas: document.getElementById('val-total-lojas'),
  valTotalLinks: document.getElementById('val-total-links'),
  valLinksAtivos: document.getElementById('val-links-ativos'),
  valTotalCliques: document.getElementById('val-total-cliques'),
  valCliques30d: document.getElementById('val-cliques-30d'),
  valPctMobile: document.getElementById('val-pct-mobile'),
  valPctDesktop: document.getElementById('val-pct-desktop'),
  barraMobile: document.getElementById('barra-mobile'),
  barraDesktop: document.getElementById('barra-desktop'),

  // Funil
  funilCadastros: document.getElementById('funil-cadastros'),
  funilCriouLink: document.getElementById('funil-criou-link'),
  funilPctCriou: document.getElementById('funil-pct-criou'),
  funilAlteracoes: document.getElementById('funil-alteracoes'),
  funilPctAlteracoes: document.getElementById('funil-pct-alteracoes'),
  funilLimiteEdicoes: document.getElementById('funil-limite-edicoes'),
  funilPctLimite: document.getElementById('funil-pct-limite'),
  funilAssinouPro: document.getElementById('funil-assinou-pro'),
  funilPctPro: document.getElementById('funil-pct-pro'),

  // Tabela Lojistas
  buscaLojistasInput: document.getElementById('busca-lojistas-input'),
  contadorLojistas: document.getElementById('contador-lojistas'),
  tabelaLojistasBody: document.getElementById('tabela-lojistas-body'),

  // Tabela Top Links
  tabelaTopLinksBody: document.getElementById('tabela-top-links-body'),

  // Modal Ação Lojista
  modalAcaoLojista: document.getElementById('modal-acao-lojista'),
  modalLojistaNome: document.getElementById('modal-lojista-nome'),
  modalLojistaSub: document.getElementById('modal-lojista-sub'),
  modalLojistaResponsavel: document.getElementById('modal-lojista-responsavel'),
  modalLojistaWhatsapp: document.getElementById('modal-lojista-whatsapp'),
  modalLojistaWhatsappLink: document.getElementById('modal-lojista-whatsapp-link'),
  modalLojistaLocalizacao: document.getElementById('modal-lojista-localizacao'),
  modalLojistaRamo: document.getElementById('modal-lojista-ramo'),
  modalLojistaExpectativa: document.getElementById('modal-lojista-expectativa'),
  modalLojistaStatus: document.getElementById('modal-lojista-status'),
  modalLojistaTipoConta: document.getElementById('modal-lojista-tipo-conta'),
  modalLojistaTrial: document.getElementById('modal-lojista-trial'),
  modalLojistaLinks: document.getElementById('modal-lojista-links'),
  btnTextoAlternarCortesia: document.getElementById('btn-texto-alternar-cortesia'),
  modalLojistaBtnFechar: document.getElementById('modal-lojista-btn-fechar'),

  // Editor do Site Oficial - Cabeçalho e Auditoria
  btnSiteSalvar: document.getElementById('btn-site-salvar'),
  siteSalvarIcon: document.getElementById('site-salvar-icon'),
  siteSalvarTexto: document.getElementById('site-salvar-texto'),
  btnSiteRestaurar: document.getElementById('btn-site-restaurar'),
  siteStatusTag: document.getElementById('site-status-tag'),
  siteAuditData: document.getElementById('site-audit-data'),
  siteAuditUsuario: document.getElementById('site-audit-usuario'),

  // Sub-abas de Edição do Site
  btnSubtabLanding: document.getElementById('btn-subtab-landing'),
  btnSubtabOficial: document.getElementById('btn-subtab-oficial'),
  subtabPaneLanding: document.getElementById('subtab-pane-landing'),
  subtabPaneOficial: document.getElementById('subtab-pane-oficial'),

  // Sub-aba 1: Exemplo na Landing Page (Vitrine de Demonstração)
  siteSwitchBannerAtivo: document.getElementById('site-switch-banner-ativo'),
  siteDropzone: document.getElementById('site-dropzone'),
  siteFileBanner: document.getElementById('site-file-banner'),
  siteBannerPreviewBox: document.getElementById('site-banner-preview-box'),
  siteBannerThumb: document.getElementById('site-banner-thumb'),
  siteBannerInfoNome: document.getElementById('site-banner-info-nome'),
  siteBannerInfoDetalhe: document.getElementById('site-banner-info-detalhe'),
  btnTrocarBanner: document.getElementById('btn-trocar-banner'),
  btnRemoverBanner: document.getElementById('btn-remover-banner'),
  siteInputBannerUrl: document.getElementById('site-input-banner-url'),
  btnAplicarUrlBanner: document.getElementById('btn-aplicar-url-banner'),
  siteInputPreviewTitulo: document.getElementById('site-input-preview-titulo'),
  sitePreviewTituloContador: document.getElementById('site-preview-titulo-contador'),
  siteInputPreviewTexto: document.getElementById('site-input-preview-texto'),
  sitePreviewTextoContador: document.getElementById('site-preview-texto-contador'),
  siteInputPreviewSubtitulo: document.getElementById('site-input-preview-subtitulo'),
  siteInputBadge: document.getElementById('site-input-badge'),
  siteInputTitulo: document.getElementById('site-input-titulo'),
  siteTituloContador: document.getElementById('site-titulo-contador'),
  siteInputDescricao: document.getElementById('site-input-descricao'),
  siteDescContador: document.getElementById('site-desc-contador'),
  siteInputCtaTexto: document.getElementById('site-input-cta-texto'),
  siteInputCtaUrl: document.getElementById('site-input-cta-url'),

  // Sub-aba 2: Link Oficial PostLink (WhatsApp & Redes)
  siteDropzoneOficial: document.getElementById('site-dropzone-oficial'),
  siteFileOficial: document.getElementById('site-file-oficial'),
  siteOficialPreviewBox: document.getElementById('site-oficial-preview-box'),
  siteOficialThumb: document.getElementById('site-oficial-thumb'),
  siteOficialInfoNome: document.getElementById('site-oficial-info-nome'),
  siteOficialInfoDetalhe: document.getElementById('site-oficial-info-detalhe'),
  btnTrocarOficialImg: document.getElementById('btn-trocar-oficial-img'),
  btnRemoverOficialImg: document.getElementById('btn-remover-oficial-img'),
  siteInputOficialImgUrl: document.getElementById('site-input-oficial-img-url'),
  btnAplicarUrlOficial: document.getElementById('btn-aplicar-url-oficial'),
  siteInputOficialTitulo: document.getElementById('site-input-oficial-titulo'),
  siteOficialTituloContador: document.getElementById('site-oficial-titulo-contador'),
  siteInputOficialDescricao: document.getElementById('site-input-oficial-descricao'),
  siteOficialDescContador: document.getElementById('site-oficial-desc-contador'),

  // Live Preview do Site Oficial (Coluna Direita)
  btnPreviewTabHero: document.getElementById('btn-preview-tab-hero'),
  btnPreviewTabWa: document.getElementById('btn-preview-tab-wa'),
  previewFrameHero: document.getElementById('preview-frame-hero'),
  previewFrameWa: document.getElementById('preview-frame-wa'),
  prevHeroBadgeWrap: document.getElementById('prev-hero-badge-wrap'),
  prevHeroBadge: document.getElementById('prev-hero-badge'),
  prevHeroTitulo: document.getElementById('prev-hero-titulo'),
  prevHeroDescricao: document.getElementById('prev-hero-descricao'),
  prevHeroBannerContainer: document.getElementById('prev-hero-banner-container'),
  prevHeroBannerImg: document.getElementById('prev-hero-banner-img'),
  prevHeroBannerPlaceholder: document.getElementById('prev-hero-banner-placeholder'),
  prevHeroBannerTag: document.getElementById('prev-hero-banner-tag'),
  prevHeroPreviewTexto: document.getElementById('prev-hero-preview-texto'),
  prevHeroPreviewTitulo: document.getElementById('prev-hero-preview-titulo'),
  prevHeroPreviewSubtitulo: document.getElementById('prev-hero-preview-subtitulo'),
  prevHeroCtaTexto: document.getElementById('prev-hero-cta-texto'),
  prevHeroTopCta: document.getElementById('prev-hero-top-cta'),
  prevWaImg: document.getElementById('prev-wa-img'),
  prevWaPlaceholder: document.getElementById('prev-wa-placeholder'),
  prevWaTitulo: document.getElementById('prev-wa-titulo'),
  prevWaDescricao: document.getElementById('prev-wa-descricao'),
};

// Utilitário de Toast
function toast(msg, tipo = 'info') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const div = document.createElement('div');
  div.className = `toast toast-${tipo}`;
  div.innerHTML = `<span>${msg}</span>`;
  c.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// Formatação Monetária
function formatarBRL(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

// Formatação de Data
function formatarData(dataIso) {
  if (!dataIso) return '-';
  const d = new Date(dataIso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Formatação Visual de Telefone
function formatarTelefoneVisual(num) {
  if (!num) return '';
  const digits = String(num).replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return num;
}

// Inicialização e Verificação de Permissões
async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = '/login/';
    return;
  }

  state.user = session.user;

  // Validação no Supabase: o usuário autenticado é Super Admin?
  try {
    const { data: isAdmin, error: errAdmin } = await sb.rpc('is_super_admin');
    
    if (errAdmin || !isAdmin) {
      if (el.viewLoading) el.viewLoading.style.display = 'none';
      if (el.viewNaoAutorizado) {
        el.viewNaoAutorizado.classList.remove('hidden');
        if (el.emailNegado) el.emailNegado.textContent = state.user.email;
      }
      return;
    }

    // Acesso Autorizado
    if (el.viewLoading) el.viewLoading.style.display = 'none';
    if (el.viewAdmin) el.viewAdmin.classList.remove('hidden');
    if (el.adminUserEmail) el.adminUserEmail.textContent = state.user.email;

    configurarNavegacao();
    await carregarTudo();
  } catch (err) {
    toast('Erro ao verificar permissões: ' + err.message, 'error');
  }
}

// Carregar Todos os Dados Administrativos
async function carregarTudo() {
  await Promise.all([
    carregarDashboard(),
    carregarLojistas(),
    carregarTopLinks(),
    carregarDenuncias(),
    carregarConfiguracoesSite(),
  ]);
}

// 1. CARREGAR DASHBOARD & MÉTRICAS GLOBAIS
async function carregarDashboard() {
  try {
    const { data, error } = await sb.rpc('admin_obter_dashboard');
    if (error) throw error;

    state.dashboard = data;
    renderizarMetricas();
    renderizarFunil();
  } catch (err) {
    console.error('Erro dashboard:', err);
    toast('Erro ao obter métricas: ' + err.message, 'error');
  }
}

function renderizarMetricas() {
  if (!state.dashboard || !state.dashboard.metricas) return;
  const m = state.dashboard.metricas;

  // Financeiro Real & Assinaturas
  if (el.valMrr) el.valMrr.textContent = formatarBRL(m.mrr_estimado || 0);
  if (el.valProjecaoAnual) el.valProjecaoAnual.textContent = `Projeção Anual: ${formatarBRL(m.projecao_anual || 0)}`;
  if (el.valReceitaReal) el.valReceitaReal.textContent = formatarBRL(m.faturamento_real_coletado || 0);
  if (el.valReceitaMes) el.valReceitaMes.textContent = `Neste mês: ${formatarBRL(m.faturamento_mes_atual || 0)}`;
  if (el.valAtivas) el.valAtivas.textContent = m.lojas_ativas || 0;
  if (el.valCortesias) el.valCortesias.textContent = `${m.lojas_cortesia || 0} cortesia(s) / teste(s) ativos`;
  if (el.valTrial) el.valTrial.textContent = m.lojas_trial || 0;

  const total = m.total_lojas || 0;
  const ativas = m.lojas_ativas || 0;
  const pctConv = total > 0 ? ((ativas / total) * 100).toFixed(1) : '0,0';
  if (el.valConversao) el.valConversao.textContent = `Conversão: ${pctConv}%`;
  if (el.valStatusExpiradas) {
    el.valStatusExpiradas.textContent = `${m.lojas_expiradas || 0} expiradas · ${m.lojas_canceladas || 0} canceladas`;
  }

  // Atividade
  if (el.valTotalLojas) el.valTotalLojas.textContent = total;
  if (el.valTotalLinks) el.valTotalLinks.textContent = m.total_links || 0;
  if (el.valLinksAtivos) el.valLinksAtivos.textContent = `${m.total_links_ativos || 0} ativos no ar`;
  if (el.valTotalCliques) el.valTotalCliques.textContent = (m.total_cliques || 0).toLocaleString('pt-BR');
  if (el.valCliques30d) el.valCliques30d.textContent = `${(m.cliques_ultimos_30d || 0).toLocaleString('pt-BR')} nos últimos 30 dias`;

  // Dispositivos
  const mob = m.cliques_mobile || 0;
  const desk = m.cliques_desktop || 0;
  const somaDisp = mob + desk;
  const pctMob = somaDisp > 0 ? Math.round((mob / somaDisp) * 100) : 85;
  const pctDesk = 100 - pctMob;

  if (el.valPctMobile) el.valPctMobile.textContent = `📱 ${pctMob}%`;
  if (el.valPctDesktop) el.valPctDesktop.textContent = `💻 ${pctDesk}%`;
  if (el.barraMobile) el.barraMobile.style.width = `${pctMob}%`;
  if (el.barraDesktop) el.barraDesktop.style.width = `${pctDesk}%`;
}

function renderizarFunil() {
  if (!state.dashboard || !state.dashboard.funil) return;
  const f = state.dashboard.funil;
  const total = f.etapa_cadastros || 1;

  if (el.funilCadastros) el.funilCadastros.textContent = f.etapa_cadastros || 0;
  if (el.funilCriouLink) el.funilCriouLink.textContent = f.etapa_criou_link || 0;
  if (el.funilPctCriou) el.funilPctCriou.textContent = `${Math.round(((f.etapa_criou_link || 0) / total) * 100)}% dos cadastros`;

  if (el.funilAlteracoes) el.funilAlteracoes.textContent = f.etapa_fez_alteracoes || 0;
  if (el.funilPctAlteracoes) el.funilPctAlteracoes.textContent = `${Math.round(((f.etapa_fez_alteracoes || 0) / total) * 100)}% da base`;

  if (el.funilLimiteEdicoes) el.funilLimiteEdicoes.textContent = f.etapa_limite_edicoes || 0;
  if (el.funilAssinouPro) el.funilAssinouPro.textContent = f.etapa_assinou_pro || 0;
  if (el.funilPctPro) el.funilPctPro.textContent = `${Math.round(((f.etapa_assinou_pro || 0) / total) * 100)}% Conversão Final`;
}

// 2. CARREGAR E RENDERIZAR TABELA DE LOJISTAS
async function carregarLojistas() {
  try {
    const { data, error } = await sb.rpc('admin_obter_lojas', {
      p_termo: state.termoBusca || null,
      p_status: state.filtroStatus,
      p_limite: 50,
      p_offset: 0,
    });

    if (error) throw error;

    let lista = data;
    if (typeof lista === 'string') {
      try { lista = JSON.parse(lista); } catch (e) { lista = []; }
    }
    state.lojistas = Array.isArray(lista) ? lista : [];
    renderizarTabelaLojistas();
  } catch (err) {
    console.error('Erro lojistas:', err);
    toast('Erro ao buscar lojistas: ' + err.message, 'error');
  }
}

function renderizarTabelaLojistas() {
  if (!el.tabelaLojistasBody) return;
  if (el.contadorLojistas) {
    el.contadorLojistas.textContent = `${state.lojistas.length} lojista(s) encontrado(s)`;
  }

  if (state.lojistas.length === 0) {
    el.tabelaLojistasBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-outline">
          Nenhum lojista encontrado para o filtro selecionado.
        </td>
      </tr>
    `;
    return;
  }

  el.tabelaLojistasBody.innerHTML = state.lojistas.map((lj) => {
    let badgeStatus = '';
    if (lj.status_assinatura === 'ativo') {
      const planoNome = lj.plano === 'agencia' ? 'Agência' : (lj.plano === 'starter' ? 'Básico' : 'Pro');
      if (lj.is_cortesia) {
        badgeStatus = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800" title="Assinatura Cortesia / Teste (Isenta de Faturamento)">🎁 Cortesia (${planoNome})</span>`;
      } else {
        const modo = lj.tipo_cobranca === 'recorrente_cartao'
          ? (lj.cancelar_ao_fim_do_periodo ? '💳 Recorrência Cancelada' : '💳 Débito Auto')
          : '⚡ PIX';
        badgeStatus = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-secondary-dark" title="${modo}">● ${planoNome} (${modo})</span>`;
      }
    } else if (lj.status_assinatura === 'trial') {
      badgeStatus = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700">⏱️ Teste (${lj.dias_trial_restantes}d rest.)</span>`;
    } else {
      badgeStatus = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-error-container text-on-error-container">✕ Expirado</span>';
    }

    const localizacao = [lj.cidade, lj.estado].filter(Boolean).join(' - ');
    const zapDigitos = (lj.whatsapp || '').replace(/\D/g, '');
    let btnWhatsApp = '';
    if (zapDigitos) {
      const fullZap = zapDigitos.startsWith('55') ? zapDigitos : `55${zapDigitos}`;
      const saudacaoNome = lj.responsavel_nome ? lj.responsavel_nome.split(' ')[0] : 'lojista';
      const msgTexto = encodeURIComponent(`Olá ${saudacaoNome}! Sou da equipe do PostLink. Vi que você cadastrou sua loja ${lj.nome}. Como posso te ajudar a começar?`);
      btnWhatsApp = `
        <div class="mt-1">
          <a href="https://wa.me/${fullZap}?text=${msgTexto}" target="_blank" class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors" title="Conversar no WhatsApp">
            <span class="material-symbols-outlined text-xs text-emerald-600">chat</span>
            <span>${formatarTelefoneVisual(lj.whatsapp)}</span>
          </a>
        </div>
      `;
    }

    const badgeRamo = lj.ramo_atividade
      ? `<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-container-high text-on-surface">${lj.ramo_atividade}</span>`
      : '';

    return `
      <tr class="hover:bg-surface-container-low/60 transition-colors">
        <td class="py-3 px-4">
          <div class="font-bold text-on-surface">${lj.nome}</div>
          <div class="text-[11px] font-mono text-primary">/${lj.slug}</div>
          ${lj.responsavel_nome ? `<div class="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5"><span class="material-symbols-outlined text-xs text-outline">person</span> ${lj.responsavel_nome}</div>` : ''}
          ${localizacao ? `<div class="text-[10px] text-outline flex items-center gap-1"><span class="material-symbols-outlined text-xs">location_on</span> ${localizacao}</div>` : ''}
        </td>
        <td class="py-3 px-4 text-xs text-on-surface-variant">
          <div class="font-mono">${lj.email}</div>
          ${btnWhatsApp}
        </td>
        <td class="py-3 px-4">
          ${badgeStatus}
          ${badgeRamo ? `<div class="mt-1">${badgeRamo}</div>` : ''}
        </td>
        <td class="py-3 px-4 font-mono">
          <span class="font-bold">${lj.total_links}</span> link(s) <span class="text-outline text-[11px]">(máx v${lj.max_versao})</span>
        </td>
        <td class="py-3 px-4 font-mono font-bold text-on-surface">
          ${(lj.total_cliques || 0).toLocaleString('pt-BR')}
        </td>
        <td class="py-3 px-4 text-outline text-[11px]">
          ${formatarData(lj.criado_em)}
        </td>
        <td class="py-3 px-4 text-right">
          <button type="button" class="btn-abrir-modal-acao bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-primary font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-all" data-id="${lj.loja_id || lj.id}">
            Gerenciar
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Adiciona listeners para abrir o modal de ação rápida
  document.querySelectorAll('.btn-abrir-modal-acao').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lojaId = btn.dataset.id;
      const lojista = state.lojistas.find((l) => (l.loja_id || l.id) === lojaId);
      if (lojista) abrirModalAcao(lojista);
    });
  });
}

// 3. CARREGAR E RENDERIZAR TOP LINKS
async function carregarTopLinks() {
  try {
    const { data, error } = await sb.rpc('admin_obter_top_links', { p_limite: 15 });
    if (error) throw error;

    let lista = data;
    if (typeof lista === 'string') {
      try { lista = JSON.parse(lista); } catch (e) { lista = []; }
    }
    state.topLinks = Array.isArray(lista) ? lista : [];
    renderizarTopLinks();
  } catch (err) {
    console.error('Erro top links:', err);
  }
}

function renderizarTopLinks() {
  if (!el.tabelaTopLinksBody) return;

  if (state.topLinks.length === 0) {
    el.tabelaTopLinksBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-outline">
          Nenhum link com cliques registrado ainda.
        </td>
      </tr>
    `;
    return;
  }

  el.tabelaTopLinksBody.innerHTML = state.topLinks.map((lk, idx) => {
    const versaoNum = lk.versao && Number(lk.versao) > 1 ? Number(lk.versao) : null;
    const sufixoV = versaoNum ? `?v=${versaoNum}` : '';
    const fullUrl = `${window.location.origin}/${lk.loja_slug}/${lk.slug}${sufixoV}`;
    const medalha = idx === 0 ? '🥇 1º' : (idx === 1 ? '🥈 2º' : (idx === 2 ? '🥉 3º' : `${idx + 1}º`));

    return `
      <tr class="hover:bg-surface-container-low/60 transition-colors">
        <td class="py-3 px-4 font-bold text-on-surface text-xs">${medalha}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-on-surface truncate max-w-xs">${lk.titulo || 'Sem título'}</div>
          <a href="${fullUrl}" target="_blank" class="text-[11px] font-mono text-primary hover:underline">
            /${lk.loja_slug}/${lk.slug}${sufixoV}
          </a>
        </td>
        <td class="py-3 px-4 font-medium text-on-surface-variant">${lk.loja_nome}</td>
        <td class="py-3 px-4 font-mono text-[11px] text-outline truncate max-w-xs" title="${lk.destino}">
          ${lk.destino}
        </td>
        <td class="py-3 px-4 font-mono font-bold text-xs text-primary">v${lk.versao || 1}</td>
        <td class="py-3 px-4 font-mono font-bold text-secondary-dark">${(lk.cliques_30d || 0).toLocaleString('pt-BR')}</td>
        <td class="py-3 px-4 font-mono font-extrabold text-on-surface text-right">${(lk.total_cliques || 0).toLocaleString('pt-BR')}</td>
      </tr>
    `;
  }).join('');
}

// 4. MODAL DE AÇÕES ADMINISTRATIVAS
function abrirModalAcao(lojista) {
  state.lojistaSelecionado = lojista;

  if (el.modalLojistaNome) el.modalLojistaNome.textContent = lojista.nome;
  if (el.modalLojistaSub) el.modalLojistaSub.textContent = `/${lojista.slug} · ${lojista.email}`;
  if (el.modalLojistaStatus) el.modalLojistaStatus.textContent = lojista.status_assinatura.toUpperCase();
  if (el.modalLojistaTipoConta) {
    if (lojista.is_cortesia) {
      el.modalLojistaTipoConta.textContent = '🎁 Cortesia / Teste (Isenta de Cobrança)';
      el.modalLojistaTipoConta.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800';
    } else if (lojista.status_assinatura === 'ativo') {
      el.modalLojistaTipoConta.textContent = '💳 Assinatura Paga Regular';
      el.modalLojistaTipoConta.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800';
    } else {
      el.modalLojistaTipoConta.textContent = '⏱️ Teste Gratuito (Trial)';
      el.modalLojistaTipoConta.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800';
    }
  }
  if (el.btnTextoAlternarCortesia) {
    el.btnTextoAlternarCortesia.textContent = lojista.is_cortesia
      ? 'Remover Cortesia'
      : 'Marcar Cortesia';
  }
  if (el.modalLojistaTrial) {
    el.modalLojistaTrial.textContent = lojista.status_assinatura === 'trial'
      ? `Restam ${lojista.dias_trial_restantes} dias (${formatarData(lojista.trial_ate)})`
      : (lojista.status_assinatura === 'ativo'
          ? (lojista.is_cortesia ? 'Cortesia Ativa (Isenta de Cobrança)' : 'Assinatura Pro Regular')
          : 'Período Expirado');
  }
  if (el.modalLojistaLinks) el.modalLojistaLinks.textContent = `${lojista.total_links} links cadastrados (máx v${lojista.max_versao})`;

  if (el.modalLojistaResponsavel) {
    el.modalLojistaResponsavel.textContent = lojista.responsavel_nome || 'Não informado';
  }

  if (el.modalLojistaWhatsapp) {
    const zapVisual = formatarTelefoneVisual(lojista.whatsapp);
    el.modalLojistaWhatsapp.textContent = zapVisual || 'Não informado';
    
    if (el.modalLojistaWhatsappLink) {
      const zapDigitos = (lojista.whatsapp || '').replace(/\D/g, '');
      if (zapDigitos) {
        const fullZap = zapDigitos.startsWith('55') ? zapDigitos : `55${zapDigitos}`;
        const saudacaoNome = lojista.responsavel_nome ? lojista.responsavel_nome.split(' ')[0] : 'lojista';
        const msg = encodeURIComponent(`Olá ${saudacaoNome}! Sou da equipe do PostLink. Vi que você cadastrou sua loja ${lojista.nome}. Como posso te ajudar a começar?`);
        el.modalLojistaWhatsappLink.href = `https://wa.me/${fullZap}?text=${msg}`;
        el.modalLojistaWhatsappLink.style.display = 'inline-flex';
      } else {
        el.modalLojistaWhatsappLink.removeAttribute('href');
        el.modalLojistaWhatsappLink.style.display = 'none';
      }
    }
  }

  if (el.modalLojistaLocalizacao) {
    const loc = [lojista.cidade, lojista.estado].filter(Boolean).join(' - ');
    el.modalLojistaLocalizacao.textContent = loc || 'Não informado';
  }

  if (el.modalLojistaRamo) {
    el.modalLojistaRamo.textContent = lojista.ramo_atividade || 'Não informado';
  }

  if (el.modalLojistaExpectativa) {
    let exp = lojista.expectativa || 'Não informado durante o cadastro';
    if (lojista.expectativa_detalhes) {
      exp += `\n\nDetalhes adicionais do lojista: "${lojista.expectativa_detalhes}"`;
    }
    el.modalLojistaExpectativa.textContent = exp;
  }

  if (el.modalAcaoLojista) el.modalAcaoLojista.classList.remove('hidden');
}

function fecharModalAcao() {
  state.lojistaSelecionado = null;
  if (el.modalAcaoLojista) el.modalAcaoLojista.classList.add('hidden');
}

if (el.modalLojistaBtnFechar) {
  el.modalLojistaBtnFechar.addEventListener('click', fecharModalAcao);
}

// Executar Ação no Lojista
document.querySelectorAll('.btn-acao-rapida').forEach((btn) => {
  btn.addEventListener('click', async () => {
    if (!state.lojistaSelecionado) return;

    const acao = btn.dataset.acao;
    const dias = parseInt(btn.dataset.dias || '7', 10);
    const lojaId = state.lojistaSelecionado.loja_id || state.lojistaSelecionado.id;

    btn.disabled = true;
    const textoAntigo = btn.innerHTML;
    btn.innerHTML = '<div class="spinner w-4 h-4 border-current border-t-transparent mx-auto"></div>';

    try {
      const { data, error } = await sb.rpc('admin_atualizar_loja', {
        p_loja_id: lojaId,
        p_acao: acao,
        p_dias_adicionais: dias,
      });

      if (error) throw error;

      toast('Ação executada com sucesso!', 'success');
      fecharModalAcao();
      await carregarTudo();
    } catch (err) {
      toast('Erro ao executar ação: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = textoAntigo;
    }
  });
});

// 4. CARREGAR E GERENCIAR DENÚNCIAS (NOTICE & TAKEDOWN)
async function carregarDenuncias() {
  try {
    const { data, error } = await sb.rpc('admin_obter_denuncias', {
      p_status: 'todas',
      p_limite: 50,
    });
    if (error) throw error;
    let lista = data;
    if (typeof lista === 'string') {
      try { lista = JSON.parse(lista); } catch (e) { lista = []; }
    }
    state.denuncias = Array.isArray(lista) ? lista : [];
    renderizarTabelaDenuncias();
  } catch (err) {
    console.error('Erro denuncias:', err);
  }
}

function renderizarTabelaDenuncias() {
  if (!el.tabelaDenunciasBody) return;
  const lista = state.denuncias;

  // Atualiza badge de pendentes
  const pendentes = lista.filter((d) => d.status === 'pendente').length;
  if (el.badgeDenuncias) {
    if (pendentes > 0) {
      el.badgeDenuncias.textContent = pendentes;
      el.badgeDenuncias.classList.remove('hidden');
    } else {
      el.badgeDenuncias.classList.add('hidden');
    }
  }

  if (lista.length === 0) {
    el.tabelaDenunciasBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-outline">
          <span class="material-symbols-outlined text-3xl mb-1 text-secondary">verified_user</span>
          <p class="font-medium text-xs">Nenhuma denúncia registrada no momento.</p>
          <span class="text-[11px]">A plataforma opera com 100% de conformidade.</span>
        </td>
      </tr>
    `;
    return;
  }

  const MOTIVOS_LABELS = {
    golpe_fraude: { label: 'Golpe / Fraude', bg: 'bg-error-container', text: 'text-on-error-container' },
    phishing: { label: 'Phishing / Clone', bg: 'bg-error-container', text: 'text-on-error-container' },
    direitos_autorais: { label: 'Direitos Autorais', bg: 'bg-surface-container', text: 'text-primary' },
    produto_proibido: { label: 'Produto Proibido', bg: 'bg-surface-container', text: 'text-error' },
    malware_virus: { label: 'Malware / Vírus', bg: 'bg-error-container', text: 'text-on-error-container' },
    outro: { label: 'Outro', bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  };

  const STATUS_BADGES = {
    pendente: 'bg-error-container text-on-error-container font-bold',
    bloqueado: 'bg-secondary-container text-on-secondary-container font-semibold',
    banido: 'bg-error text-white font-bold',
    descartado: 'bg-surface-container text-outline',
  };

  el.tabelaDenunciasBody.innerHTML = lista.map((d) => {
    const configMotivo = MOTIVOS_LABELS[d.motivo] || { label: d.motivo || 'Geral', bg: 'bg-surface-container-high', text: 'text-on-surface' };
    const statusClass = STATUS_BADGES[d.status] || 'bg-surface-container text-outline';
    const isResolvido = d.status !== 'pendente';

    return `
      <tr class="hover:bg-surface-container-low transition-colors">
        <td class="py-3 px-4">
          <span class="inline-block px-2 py-0.5 rounded-full text-[10px] uppercase ${statusClass}">
            ${d.status}
          </span>
          <div class="text-[10px] text-outline mt-1 font-mono">${formatarData(d.criado_em)}</div>
        </td>
        <td class="py-3 px-4">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${configMotivo.bg} ${configMotivo.text}">
            ${configMotivo.label}
          </span>
        </td>
        <td class="py-3 px-4 max-w-xs truncate font-mono text-[11px]" title="${d.url_denunciada || ''}">
          <a href="${d.url_denunciada || '#'}" target="_blank" class="text-primary hover:underline flex items-center gap-1">
            <span class="truncate">${d.url_denunciada || 'Sem URL'}</span>
            <span class="material-symbols-outlined text-xs">open_in_new</span>
          </a>
        </td>
        <td class="py-3 px-4 text-[11px]">
          ${d.loja_nome ? `
            <div class="font-bold text-on-surface">${d.loja_nome}</div>
            <div class="text-outline font-mono text-[10px]">/${d.loja_slug}/${d.link_slug || ''}</div>
            ${d.destino ? `<a href="${d.destino}" target="_blank" class="text-outline hover:text-primary truncate block max-w-xs text-[10px]">${d.destino}</a>` : ''}
          ` : '<span class="text-outline italic">Link avulso / não localizado</span>'}
        </td>
        <td class="py-3 px-4 max-w-xs text-[11px] text-on-surface-variant leading-tight">
          <p class="line-clamp-2" title="${d.descricao || ''}">${d.descricao || '<span class="text-outline italic">Sem relato</span>'}</p>
          ${d.email_denunciante ? `<span class="text-[10px] text-outline block mt-0.5 font-mono">Contato: ${d.email_denunciante}</span>` : ''}
        </td>
        <td class="py-3 px-4 text-right">
          ${isResolvido ? `
            <span class="text-[11px] text-outline font-semibold">Resolvido</span>
          ` : `
            <div class="flex items-center justify-end gap-1.5">
              ${d.link_id ? `
                <button type="button" class="btn-acao-denuncia px-2 py-1 rounded-lg bg-error hover:bg-error/90 text-white text-[11px] font-bold shadow-2xs transition-all active:scale-95" data-id="${d.denuncia_id}" data-acao="bloquear_link">
                  Bloquear Link
                </button>
              ` : ''}
              ${d.loja_id ? `
                <button type="button" class="btn-acao-denuncia px-2 py-1 rounded-lg bg-surface-container-high hover:bg-error-container text-on-surface hover:text-error text-[11px] font-bold border border-outline-variant/60 transition-all active:scale-95" data-id="${d.denuncia_id}" data-acao="banir_loja">
                  Banir Loja
                </button>
              ` : ''}
              <button type="button" class="btn-acao-denuncia px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface text-[11px] font-medium transition-all" data-id="${d.denuncia_id}" data-acao="descartar">
                Descartar
              </button>
            </div>
          `}
        </td>
      </tr>
    `;
  }).join('');

  // Eventos de clique nas ações de denúncia
  el.tabelaDenunciasBody.querySelectorAll('.btn-acao-denuncia').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const acao = btn.dataset.acao;
      const confirmMsg = acao === 'banir_loja'
        ? 'Tem certeza que deseja BANIR esta loja e desativar todos os links dela?'
        : (acao === 'bloquear_link' ? 'Deseja desativar este link imediatamente?' : 'Deseja descartar esta denúncia?');

      if (!confirm(confirmMsg)) return;

      btn.disabled = true;
      try {
        const { error } = await sb.rpc('admin_resolver_denuncia', {
          p_denuncia_id: parseInt(id, 10),
          p_acao: acao,
        });
        if (error) throw error;
        toast('Ação executada com sucesso!', 'success');
        await carregarDenuncias();
        await carregarLojistas();
      } catch (err) {
        toast('Erro ao processar: ' + err.message, 'error');
        btn.disabled = false;
      }
    });
  });
}

// 5. NAVEGAÇÃO DE ABAS
function configurarNavegacao() {
  el.tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      state.abaAtiva = tab;

      el.tabBtns.forEach((b) => {
        b.className = 'admin-tab-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface';
      });
      btn.className = 'admin-tab-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-primary text-white shadow-xs';

      if (el.paneVisaoGeral) el.paneVisaoGeral.classList.toggle('hidden', tab !== 'visao-geral');
      if (el.paneLojistas) el.paneLojistas.classList.toggle('hidden', tab !== 'lojistas');
      if (el.paneTopLinks) el.paneTopLinks.classList.toggle('hidden', tab !== 'top-links');
      if (el.paneDenuncias) el.paneDenuncias.classList.toggle('hidden', tab !== 'denuncias');
      if (el.paneSiteOficial) el.paneSiteOficial.classList.toggle('hidden', tab !== 'site-oficial');

      if (tab === 'site-oficial' && !state.siteConfig) {
        carregarConfiguracoesSite();
      }
    });
  });

  if (el.btnRecarregarDenuncias) {
    el.btnRecarregarDenuncias.addEventListener('click', async () => {
      el.btnRecarregarDenuncias.disabled = true;
      toast('Recarregando denúncias…', 'info');
      await carregarDenuncias();
      el.btnRecarregarDenuncias.disabled = false;
    });
  }

  // Filtros de Status dos Lojistas
  document.querySelectorAll('.filtro-lojista-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filtro-lojista-chip').forEach((c) => {
        c.className = 'filtro-lojista-chip px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-surface-container-low text-on-surface-variant hover:bg-surface-container';
      });
      chip.className = 'filtro-lojista-chip px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-primary text-white shadow-xs';

      state.filtroStatus = chip.dataset.status;
      carregarLojistas();
    });
  });

  // Campo de Pesquisa com debounce
  let timerBusca;
  if (el.buscaLojistasInput) {
    el.buscaLojistasInput.addEventListener('input', (e) => {
      clearTimeout(timerBusca);
      timerBusca = setTimeout(() => {
        state.termoBusca = e.target.value.trim();
        carregarLojistas();
      }, 300);
    });
  }

  // Botão Atualizar
  if (el.btnAtualizarDados) {
    el.btnAtualizarDados.addEventListener('click', async () => {
      el.btnAtualizarDados.disabled = true;
      toast('Recarregando dados do painel…', 'info');
      await carregarTudo();
      el.btnAtualizarDados.disabled = false;
    });
  }

  // Logout
  const fazerLogout = async () => {
    await sb.auth.signOut();
    window.location.href = '/login/';
  };
  if (el.btnLogout) el.btnLogout.addEventListener('click', fazerLogout);
  if (el.btnLogoutNegado) el.btnLogoutNegado.addEventListener('click', fazerLogout);

  configurarEventosEditorSite();
}

// ==========================================
// 6. EDITOR DO SITE OFICIAL (POSTLINK)
// ==========================================

// Alterna entre as sub-abas do Editor (1. Vitrine Landing Page / 2. Link Oficial)
function alternarSubabaSite(aba) {
  state.subabaSiteAtiva = aba;

  const btnLanding = el.btnSubtabLanding || document.getElementById('btn-subtab-landing');
  const btnOficial = el.btnSubtabOficial || document.getElementById('btn-subtab-oficial');
  const badgeLanding = document.getElementById('subtab-badge-landing');
  const badgeOficial = document.getElementById('subtab-badge-oficial');
  const paneLanding = el.subtabPaneLanding || document.getElementById('subtab-pane-landing');
  const paneOficial = el.subtabPaneOficial || document.getElementById('subtab-pane-oficial');

  if (aba === 'landing') {
    if (btnLanding) {
      btnLanding.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all bg-primary text-white shadow-2xs cursor-pointer';
    }
    if (btnOficial) {
      btnOficial.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface cursor-pointer';
    }
    if (badgeLanding) badgeLanding.className = 'text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 text-white';
    if (badgeOficial) badgeOficial.className = 'text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800';

    if (paneLanding) {
      paneLanding.classList.remove('hidden');
      paneLanding.style.display = 'block';
    }
    if (paneOficial) {
      paneOficial.classList.add('hidden');
      paneOficial.style.display = 'none';
    }

    // Ao ir para a Vitrine da Landing Page, exibe automaticamente a prévia da Hero
    ativarPreviewFrame('hero');
  } else {
    if (btnOficial) {
      btnOficial.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all bg-primary text-white shadow-2xs cursor-pointer';
    }
    if (btnLanding) {
      btnLanding.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface cursor-pointer';
    }
    if (badgeOficial) badgeOficial.className = 'text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 text-white';
    if (badgeLanding) badgeLanding.className = 'text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary';

    if (paneOficial) {
      paneOficial.classList.remove('hidden');
      paneOficial.style.display = 'block';
    }
    if (paneLanding) {
      paneLanding.classList.add('hidden');
      paneLanding.style.display = 'none';
    }

    // Ao ir para o Link Oficial, exibe automaticamente o Balão de WhatsApp
    ativarPreviewFrame('wa');
  }
}

// Alterna entre o frame da Hero e o balão do WhatsApp no Live Preview
function ativarPreviewFrame(tipo) {
  const frameHero = el.previewFrameHero || document.getElementById('preview-frame-hero');
  const frameWa = el.previewFrameWa || document.getElementById('preview-frame-wa');
  const btnHero = el.btnPreviewTabHero || document.getElementById('btn-preview-tab-hero');
  const btnWa = el.btnPreviewTabWa || document.getElementById('btn-preview-tab-wa');

  if (tipo === 'hero') {
    if (frameHero) {
      frameHero.classList.remove('hidden');
      frameHero.style.display = 'block';
    }
    if (frameWa) {
      frameWa.classList.add('hidden');
      frameWa.style.display = 'none';
    }
    if (btnHero) btnHero.className = 'px-2.5 py-1 rounded-md font-bold transition-all bg-surface-container-lowest text-primary shadow-2xs cursor-pointer';
    if (btnWa) btnWa.className = 'px-2.5 py-1 rounded-md font-medium transition-all text-on-surface-variant hover:text-on-surface cursor-pointer';
  } else {
    if (frameWa) {
      frameWa.classList.remove('hidden');
      frameWa.style.display = 'block';
    }
    if (frameHero) {
      frameHero.classList.add('hidden');
      frameHero.style.display = 'none';
    }
    if (btnWa) btnWa.className = 'px-2.5 py-1 rounded-md font-bold transition-all bg-surface-container-lowest text-primary shadow-2xs cursor-pointer';
    if (btnHero) btnHero.className = 'px-2.5 py-1 rounded-md font-medium transition-all text-on-surface-variant hover:text-on-surface cursor-pointer';
  }
}

// Exporta globalmente para máxima disponibilidade e suporte a cliques
window.alternarSubabaSite = alternarSubabaSite;
window.ativarPreviewFrame = ativarPreviewFrame;

// Carrega as configurações do site oficial do Supabase
async function carregarConfiguracoesSite() {
  try {
    const { data, error } = await sb.rpc('obter_configuracoes_site');
    if (error) throw error;

    state.siteConfig = data || {
      id: 'oficial',
      titulo: 'Transforme ofertas em cartões em alta definição que abrem sozinhos e vendem no WhatsApp',
      descricao: 'Quase ninguém baixa fotos avulsas no WhatsApp para não lotar a memória do celular — e mesmo quem baixa não vai a lugar nenhum ao clicar na foto. Com o PostLink, seu produto já aparece aberto na conversa, sem ocupar a galeria do cliente e direcionando para o seu atendimento com 1 clique.',
      banner_url: null,
      badge_texto: 'Abre direto no WhatsApp · Zero fotos na galeria do cliente',
      cta_texto: 'Começar Grátis',
      cta_url: '/planos/',
      banner_ativo: true,
      preview_titulo: 'Lançamento Especial · Oferta Exclusiva com 1 Clique',
      preview_descricao: 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇',
      preview_subtitulo: 'postlink.com.br/sua-loja ➔ Redireciona para o destino',
      preview_imagem_url: null,
      oficial_og_titulo: 'PostLink · Smart Links em Alta Definição para WhatsApp',
      oficial_og_descricao: 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.',
      oficial_og_imagem_url: null,
      atualizado_em: new Date().toISOString(),
      atualizado_por: 'sistema',
    };

    preencherFormularioSite(state.siteConfig);
    atualizarAuditoriaSite(state.siteConfig);
    atualizarLivePreviewSite();
  } catch (err) {
    console.error('Erro ao carregar configurações do site:', err);
    toast('Não foi possível carregar as configurações do site: ' + err.message, 'error');
  }
}

// Preenche os inputs com o objeto de dados recebido do banco
function preencherFormularioSite(dados) {
  if (!dados) return;

  // --- SUB-ABA 1: EXEMPLO NA LANDING PAGE ---
  if (el.siteInputPreviewTitulo) {
    el.siteInputPreviewTitulo.value = dados.preview_titulo || 'Lançamento Especial · Oferta Exclusiva com 1 Clique';
  }
  if (el.siteInputPreviewTexto) {
    el.siteInputPreviewTexto.value = dados.preview_descricao || dados.preview_texto || 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇';
  }
  if (el.siteInputPreviewSubtitulo) {
    el.siteInputPreviewSubtitulo.value = dados.preview_subtitulo || 'postlink.com.br/sua-loja ➔ Redireciona para o destino';
  }

  if (el.siteInputBadge) el.siteInputBadge.value = dados.badge_texto || '';
  if (el.siteInputTitulo) el.siteInputTitulo.value = dados.titulo || '';
  if (el.siteInputDescricao) el.siteInputDescricao.value = dados.descricao || '';
  if (el.siteInputCtaTexto) el.siteInputCtaTexto.value = dados.cta_texto || 'Começar Grátis';
  if (el.siteInputCtaUrl) el.siteInputCtaUrl.value = dados.cta_url || '/planos/';
  if (el.siteSwitchBannerAtivo) el.siteSwitchBannerAtivo.checked = dados.banner_ativo !== false;

  // Miniatura da foto da Vitrine de Exemplo
  const vitrineImg = dados.preview_imagem_url || dados.banner_url;
  if (vitrineImg && !state.siteBannerRemovido) {
    if (el.siteBannerPreviewBox) el.siteBannerPreviewBox.classList.remove('hidden');
    if (el.siteBannerThumb) el.siteBannerThumb.src = vitrineImg;
    if (el.siteBannerInfoNome) el.siteBannerInfoNome.textContent = 'Foto de Exemplo Ativa';
    if (el.siteBannerInfoDetalhe) el.siteBannerInfoDetalhe.textContent = 'Vitrine da Landing Page · Alta Definição';
    if (el.siteInputBannerUrl) el.siteInputBannerUrl.value = vitrineImg;
  } else if (!state.siteBannerBlob) {
    if (el.siteBannerPreviewBox) el.siteBannerPreviewBox.classList.add('hidden');
    if (el.siteBannerThumb) el.siteBannerThumb.src = '';
    if (el.siteInputBannerUrl) el.siteInputBannerUrl.value = '';
  }

  // --- SUB-ABA 2: LINK OFICIAL POSTLINK ---
  if (el.siteInputOficialTitulo) {
    el.siteInputOficialTitulo.value = dados.oficial_og_titulo || 'PostLink · Smart Links em Alta Definição para WhatsApp';
  }
  if (el.siteInputOficialDescricao) {
    el.siteInputOficialDescricao.value = dados.oficial_og_descricao || 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.';
  }

  // Miniatura da imagem Oficial do PostLink
  const oficialImg = dados.oficial_og_imagem_url || dados.banner_url || '/assets/img/logotipo_postlink.jpg';
  if (dados.oficial_og_imagem_url && !state.siteOficialRemovido) {
    if (el.siteOficialPreviewBox) el.siteOficialPreviewBox.classList.remove('hidden');
    if (el.siteOficialThumb) el.siteOficialThumb.src = dados.oficial_og_imagem_url;
    if (el.siteOficialInfoNome) el.siteOficialInfoNome.textContent = 'Imagem Oficial Ativa';
    if (el.siteOficialInfoDetalhe) el.siteOficialInfoDetalhe.textContent = 'CDN PostLink · Redes Sociais';
    if (el.siteInputOficialImgUrl) el.siteInputOficialImgUrl.value = dados.oficial_og_imagem_url;
  } else if (!state.siteOficialBlob) {
    if (el.siteOficialPreviewBox) el.siteOficialPreviewBox.classList.add('hidden');
    if (el.siteOficialThumb) el.siteOficialThumb.src = '';
    if (el.siteInputOficialImgUrl) el.siteInputOficialImgUrl.value = '';
  }

  atualizarContadoresTextos();
}

// Atualiza contadores numéricos de caracteres
function atualizarContadoresTextos() {
  // Vitrine
  if (el.siteInputPreviewTitulo && el.sitePreviewTituloContador) {
    const len = el.siteInputPreviewTitulo.value.length;
    el.sitePreviewTituloContador.textContent = `${len} / 90`;
    el.sitePreviewTituloContador.className = len > 90
      ? 'text-[10px] font-mono text-error font-bold'
      : (len > 70 ? 'text-[10px] font-mono text-amber-500 font-semibold' : 'text-[10px] font-mono text-outline font-semibold');
  }

  if (el.siteInputPreviewTexto && el.sitePreviewTextoContador) {
    const len = el.siteInputPreviewTexto.value.length;
    el.sitePreviewTextoContador.textContent = `${len} / 180`;
    el.sitePreviewTextoContador.className = len > 180
      ? 'text-[10px] font-mono text-error font-bold'
      : (len > 150 ? 'text-[10px] font-mono text-amber-500 font-semibold' : 'text-[10px] font-mono text-outline font-semibold');
  }

  if (el.siteInputTitulo && el.siteTituloContador) {
    const len = el.siteInputTitulo.value.length;
    el.siteTituloContador.textContent = `${len} / 120`;
    el.siteTituloContador.className = len > 120
      ? 'text-[10px] font-mono text-error font-bold'
      : (len > 90 ? 'text-[10px] font-mono text-amber-500 font-semibold' : 'text-[10px] font-mono text-outline font-semibold');
  }

  if (el.siteInputDescricao && el.siteDescContador) {
    const len = el.siteInputDescricao.value.length;
    el.siteDescContador.textContent = `${len} / 300`;
    el.siteDescContador.className = len > 300
      ? 'text-[10px] font-mono text-error font-bold'
      : (len > 250 ? 'text-[10px] font-mono text-amber-500 font-semibold' : 'text-[10px] font-mono text-outline font-semibold');
  }

  // Link Oficial
  if (el.siteInputOficialTitulo && el.siteOficialTituloContador) {
    const len = el.siteInputOficialTitulo.value.length;
    el.siteOficialTituloContador.textContent = `${len} / 90`;
    el.siteOficialTituloContador.className = len > 90
      ? 'text-[10px] font-mono text-error font-bold'
      : (len > 70 ? 'text-[10px] font-mono text-amber-500 font-semibold' : 'text-[10px] font-mono text-outline font-semibold');
  }

  if (el.siteInputOficialDescricao && el.siteOficialDescContador) {
    const len = el.siteInputOficialDescricao.value.length;
    el.siteOficialDescContador.textContent = `${len} / 180`;
    el.siteOficialDescContador.className = len > 180
      ? 'text-[10px] font-mono text-error font-bold'
      : (len > 150 ? 'text-[10px] font-mono text-amber-500 font-semibold' : 'text-[10px] font-mono text-outline font-semibold');
  }
}

// Atualiza informações de auditoria
function atualizarAuditoriaSite(dados) {
  if (!dados) return;
  if (el.siteAuditData) {
    el.siteAuditData.textContent = dados.atualizado_em ? `${formatarData(dados.atualizado_em)} às ${new Date(dados.atualizado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Hoje';
  }
  if (el.siteAuditUsuario) {
    el.siteAuditUsuario.textContent = dados.atualizado_por || (state.user ? state.user.email : 'admin');
  }
  if (el.siteStatusTag) {
    el.siteStatusTag.textContent = 'Sincronizado';
    el.siteStatusTag.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-semibold border border-emerald-400/30';
  }
}

// Atualiza ambas as prévias (Hero e WhatsApp Card) em tempo real com fontes totalmente separadas
function atualizarLivePreviewSite() {
  // 1. Dados da Landing Page (Vitrine)
  const titulo = (el.siteInputTitulo?.value || '').trim() || 'Transforme ofertas em cartões em alta definição que abrem sozinhos e vendem no WhatsApp';
  const descricao = (el.siteInputDescricao?.value || '').trim() || 'Quase ninguém baixa fotos avulsas no WhatsApp para não lotar a memória do celular.';
  const badgeTexto = (el.siteInputBadge?.value || '').trim();
  const ctaTexto = (el.siteInputCtaTexto?.value || '').trim() || 'Começar Grátis';
  const bannerAtivo = el.siteSwitchBannerAtivo ? el.siteSwitchBannerAtivo.checked : true;

  const previewTitulo = (el.siteInputPreviewTitulo?.value || '').trim() || 'Lançamento Especial · Oferta Exclusiva com 1 Clique';
  const previewTexto = (el.siteInputPreviewTexto?.value || '').trim() || 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇';
  const previewSubtitulo = (el.siteInputPreviewSubtitulo?.value || '').trim() || 'postlink.com.br/sua-loja ➔ Redireciona para o destino';

  // Imagem prioritária da Vitrine
  let vitrineImg = '';
  if (!state.siteBannerRemovido) {
    if (state.siteBannerPreviewUrl) {
      vitrineImg = state.siteBannerPreviewUrl;
    } else if (el.siteInputBannerUrl && el.siteInputBannerUrl.value.trim()) {
      vitrineImg = el.siteInputBannerUrl.value.trim();
    } else if (state.siteConfig && (state.siteConfig.preview_imagem_url || state.siteConfig.banner_url)) {
      vitrineImg = state.siteConfig.preview_imagem_url || state.siteConfig.banner_url;
    }
  }

  // 2. Dados Oficiais (Link postlink.com.br)
  const oficialTitulo = (el.siteInputOficialTitulo?.value || '').trim() || 'PostLink · Smart Links em Alta Definição para WhatsApp';
  const oficialDescricao = (el.siteInputOficialDescricao?.value || '').trim() || 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.';

  // Imagem prioritária Oficial
  let oficialImg = '';
  if (!state.siteOficialRemovido) {
    if (state.siteOficialPreviewUrl) {
      oficialImg = state.siteOficialPreviewUrl;
    } else if (el.siteInputOficialImgUrl && el.siteInputOficialImgUrl.value.trim()) {
      oficialImg = el.siteInputOficialImgUrl.value.trim();
    } else if (state.siteConfig && state.siteConfig.oficial_og_imagem_url) {
      oficialImg = state.siteConfig.oficial_og_imagem_url;
    } else if (state.siteConfig && state.siteConfig.banner_url) {
      oficialImg = state.siteConfig.banner_url;
    }
  }

  // --- A. RENDERIZAÇÃO DA MINI HERO (VITRINE) ---
  if (el.prevHeroTitulo) el.prevHeroTitulo.textContent = titulo;
  if (el.prevHeroDescricao) el.prevHeroDescricao.textContent = descricao;
  if (el.prevHeroBadge) el.prevHeroBadge.textContent = badgeTexto || 'Smart Links';
  if (el.prevHeroBadgeWrap) el.prevHeroBadgeWrap.style.display = badgeTexto ? 'inline-flex' : 'none';
  if (el.prevHeroCtaTexto) el.prevHeroCtaTexto.textContent = ctaTexto;
  if (el.prevHeroTopCta) el.prevHeroTopCta.textContent = ctaTexto;

  if (el.prevHeroPreviewTexto) el.prevHeroPreviewTexto.textContent = previewTexto;
  if (el.prevHeroPreviewTitulo) el.prevHeroPreviewTitulo.textContent = previewTitulo;
  if (el.prevHeroPreviewSubtitulo) el.prevHeroPreviewSubtitulo.textContent = previewSubtitulo;

  const vitrineFinal = vitrineImg || '/assets/img/logotipo_postlink.jpg';
  if (bannerAtivo && vitrineFinal) {
    if (el.prevHeroBannerContainer) el.prevHeroBannerContainer.classList.remove('hidden');
    if (el.prevHeroBannerImg) {
      el.prevHeroBannerImg.src = vitrineFinal;
      el.prevHeroBannerImg.classList.remove('hidden');
    }
    if (el.prevHeroBannerPlaceholder) el.prevHeroBannerPlaceholder.classList.add('hidden');
    if (el.prevHeroBannerTag) el.prevHeroBannerTag.classList.remove('hidden');
  } else {
    if (el.prevHeroBannerContainer) el.prevHeroBannerContainer.classList.remove('hidden');
    if (el.prevHeroBannerImg) el.prevHeroBannerImg.classList.add('hidden');
    if (el.prevHeroBannerPlaceholder) el.prevHeroBannerPlaceholder.classList.remove('hidden');
    if (el.prevHeroBannerTag) el.prevHeroBannerTag.classList.add('hidden');
  }

  // --- B. RENDERIZAÇÃO DO WHATSAPP CARD (LINK OFICIAL POSTLINK) ---
  if (el.prevWaTitulo) el.prevWaTitulo.textContent = oficialTitulo;
  if (el.prevWaDescricao) el.prevWaDescricao.textContent = oficialDescricao;

  const waImgFinal = oficialImg || '/assets/img/logotipo_postlink.jpg';
  if (el.prevWaImg) {
    el.prevWaImg.src = waImgFinal;
    el.prevWaImg.classList.remove('hidden');
  }
  if (el.prevWaPlaceholder) el.prevWaPlaceholder.classList.add('hidden');

  // Marca status tag como "Edições Pendentes"
  if (el.siteStatusTag && state.siteConfig) {
    el.siteStatusTag.textContent = 'Alterações não salvas';
    el.siteStatusTag.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-[11px] font-semibold border border-amber-400/30';
  }
}

// Otimiza e processa arquivo de imagem da foto de exemplo da vitrine
async function tratarArquivoBannerSite(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    toast('Por favor, selecione uma imagem válida (JPEG, PNG ou WebP).', 'error');
    return;
  }

  try {
    toast('Otimizando foto de exemplo para alta definição (1200px HD)…', 'info');
    const tamanhoOriginalKB = Math.round(file.size / 1024);
    const blob = await comprimirImagem(file, { larguraMax: 1200, alvoKB: 300 });

    state.siteBannerBlob = blob;
    state.siteBannerRemovido = false;

    if (state.siteBannerPreviewUrl && state.siteBannerPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(state.siteBannerPreviewUrl);
    }
    state.siteBannerPreviewUrl = URL.createObjectURL(blob);

    const tamanhoFinalKB = Math.round(blob.size / 1024);
    const economia = Math.max(0, Math.round(((tamanhoOriginalKB - tamanhoFinalKB) / (tamanhoOriginalKB || 1)) * 100));

    if (el.siteBannerPreviewBox) el.siteBannerPreviewBox.classList.remove('hidden');
    if (el.siteBannerThumb) el.siteBannerThumb.src = state.siteBannerPreviewUrl;
    if (el.siteBannerInfoNome) el.siteBannerInfoNome.textContent = file.name;
    if (el.siteBannerInfoDetalhe) {
      el.siteBannerInfoDetalhe.textContent = `${tamanhoOriginalKB}KB → ${tamanhoFinalKB}KB (-${economia}%) · Proporção HD Otimizada`;
    }

    if (el.siteInputBannerUrl) el.siteInputBannerUrl.value = '';

    atualizarLivePreviewSite();
    toast('Foto de exemplo processada! Clique em "Salvar Alterações" para aplicar.', 'success');
  } catch (err) {
    console.error('Erro na compressão:', err);
    toast('Erro ao processar imagem: ' + err.message, 'error');
  }
}

// Otimiza e processa arquivo de imagem do link oficial PostLink
async function tratarArquivoOficialSite(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    toast('Por favor, selecione uma imagem válida (JPEG, PNG ou WebP).', 'error');
    return;
  }

  try {
    toast('Otimizando imagem oficial para redes sociais (1200x630 HD)…', 'info');
    const tamanhoOriginalKB = Math.round(file.size / 1024);
    const blob = await comprimirImagem(file, { larguraMax: 1200, alvoKB: 300 });

    state.siteOficialBlob = blob;
    state.siteOficialRemovido = false;

    if (state.siteOficialPreviewUrl && state.siteOficialPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(state.siteOficialPreviewUrl);
    }
    state.siteOficialPreviewUrl = URL.createObjectURL(blob);

    const tamanhoFinalKB = Math.round(blob.size / 1024);
    const economia = Math.max(0, Math.round(((tamanhoOriginalKB - tamanhoFinalKB) / (tamanhoOriginalKB || 1)) * 100));

    if (el.siteOficialPreviewBox) el.siteOficialPreviewBox.classList.remove('hidden');
    if (el.siteOficialThumb) el.siteOficialThumb.src = state.siteOficialPreviewUrl;
    if (el.siteOficialInfoNome) el.siteOficialInfoNome.textContent = file.name;
    if (el.siteOficialInfoDetalhe) {
      el.siteOficialInfoDetalhe.textContent = `${tamanhoOriginalKB}KB → ${tamanhoFinalKB}KB (-${economia}%) · Proporção OG Otimizada`;
    }

    if (el.siteInputOficialImgUrl) el.siteInputOficialImgUrl.value = '';

    atualizarLivePreviewSite();
    toast('Imagem oficial processada! Clique em "Salvar Alterações" para aplicar.', 'success');
  } catch (err) {
    console.error('Erro na compressão da imagem oficial:', err);
    toast('Erro ao processar imagem oficial: ' + err.message, 'error');
  }
}

// Salva as alterações no Supabase (grava ambos os grupos de forma independente)
async function salvarConfiguracoesSite() {
  if (!el.btnSiteSalvar) return;

  // Dados da Landing Page
  const titulo = (el.siteInputTitulo?.value || '').trim();
  const descricao = (el.siteInputDescricao?.value || '').trim();
  const badgeTexto = (el.siteInputBadge?.value || '').trim();
  const ctaTexto = (el.siteInputCtaTexto?.value || '').trim();
  const ctaUrl = (el.siteInputCtaUrl?.value || '').trim();
  const bannerAtivo = el.siteSwitchBannerAtivo ? el.siteSwitchBannerAtivo.checked : true;

  const previewTitulo = (el.siteInputPreviewTitulo?.value || '').trim() || 'Lançamento Especial · Oferta Exclusiva com 1 Clique';
  const previewDescricao = (el.siteInputPreviewTexto?.value || '').trim() || 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇';
  const previewSubtitulo = (el.siteInputPreviewSubtitulo?.value || '').trim() || 'postlink.com.br/sua-loja ➔ Redireciona para o destino';

  // Dados Oficiais de Compartilhamento
  const oficialOgTitulo = (el.siteInputOficialTitulo?.value || '').trim() || 'PostLink · Smart Links em Alta Definição para WhatsApp';
  const oficialOgDescricao = (el.siteInputOficialDescricao?.value || '').trim() || 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.';

  if (!titulo) {
    toast('O título principal da Landing Page não pode ficar em branco.', 'error');
    if (el.siteInputTitulo) el.siteInputTitulo.focus();
    return;
  }

  el.btnSiteSalvar.disabled = true;
  if (el.siteSalvarIcon) {
    el.siteSalvarIcon.textContent = 'progress_activity';
    el.siteSalvarIcon.classList.add('animate-spin');
  }
  if (el.siteSalvarTexto) el.siteSalvarTexto.textContent = 'Salvando…';

  try {
    // Assegura sessão ativa
    const { data: { session } } = await sb.auth.getSession();
    if (!session || !session.user) {
      toast('Sessão expirada. Faça login novamente.', 'error');
      window.location.href = '/login/';
      return;
    }
    state.user = session.user;

    // 1. Processar Foto de Exemplo da Vitrine (preview_imagem_url)
    let previewImgUrl = state.siteConfig ? (state.siteConfig.preview_imagem_url || state.siteConfig.banner_url) : null;

    if (state.siteBannerRemovido) {
      previewImgUrl = null;
    }

    const urlManualVitrine = (el.siteInputBannerUrl?.value || '').trim();
    if (urlManualVitrine && !state.siteBannerBlob) {
      previewImgUrl = urlManualVitrine;
    }

    if (state.siteBannerBlob) {
      toast('Enviando foto de exemplo da vitrine para o CDN…', 'info');
      const nomeArquivoVitrine = `${state.user.id}/site_preview_${Date.now()}.jpg`;

      const { error: errUploadVitrine } = await sb.storage
        .from('banners')
        .upload(nomeArquivoVitrine, state.siteBannerBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (errUploadVitrine) {
        console.error('Erro no upload da foto da vitrine:', errUploadVitrine);
        throw new Error(`Falha no upload da foto da vitrine (${errUploadVitrine.message || 'permissão negada'})`);
      }

      const { data: urlDataVitrine } = sb.storage.from('banners').getPublicUrl(nomeArquivoVitrine);
      previewImgUrl = urlDataVitrine.publicUrl;
    }

    // 2. Processar Imagem Oficial de Compartilhamento (oficial_og_imagem_url)
    let oficialImgUrl = state.siteConfig ? (state.siteConfig.oficial_og_imagem_url || state.siteConfig.banner_url) : null;

    if (state.siteOficialRemovido) {
      oficialImgUrl = null;
    }

    const urlManualOficial = (el.siteInputOficialImgUrl?.value || '').trim();
    if (urlManualOficial && !state.siteOficialBlob) {
      oficialImgUrl = urlManualOficial;
    }

    if (state.siteOficialBlob) {
      toast('Enviando imagem oficial do PostLink para o CDN…', 'info');
      const nomeArquivoOficial = `${state.user.id}/site_oficial_${Date.now()}.jpg`;

      const { error: errUploadOficial } = await sb.storage
        .from('banners')
        .upload(nomeArquivoOficial, state.siteOficialBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (errUploadOficial) {
        console.error('Erro no upload da imagem oficial:', errUploadOficial);
        throw new Error(`Falha no upload da imagem oficial (${errUploadOficial.message || 'permissão negada'})`);
      }

      const { data: urlDataOficial } = sb.storage.from('banners').getPublicUrl(nomeArquivoOficial);
      oficialImgUrl = urlDataOficial.publicUrl;
    }

    // Fallback retrocompatível para banner_url
    const bannerUrlRetro = previewImgUrl || oficialImgUrl || null;

    // 3. Invocar RPC com os 14 parâmetros no Supabase
    const { data: resRpc, error: errRpc } = await sb.rpc('admin_salvar_configuracoes_site', {
      p_titulo: titulo,
      p_descricao: descricao,
      p_banner_url: bannerUrlRetro,
      p_badge_texto: badgeTexto,
      p_cta_texto: ctaTexto,
      p_cta_url: ctaUrl,
      p_banner_ativo: bannerAtivo,
      p_preview_titulo: previewTitulo,
      p_preview_descricao: previewDescricao,
      p_preview_subtitulo: previewSubtitulo,
      p_preview_imagem_url: previewImgUrl,
      p_oficial_og_titulo: oficialOgTitulo,
      p_oficial_og_descricao: oficialOgDescricao,
      p_oficial_og_imagem_url: oficialImgUrl,
    });

    if (errRpc) throw errRpc;

    state.siteConfig = (resRpc && resRpc.dados) ? resRpc.dados : {
      titulo,
      descricao,
      banner_url: bannerUrlRetro,
      badge_texto: badgeTexto,
      cta_texto: ctaTexto,
      cta_url: ctaUrl,
      banner_ativo: bannerAtivo,
      preview_titulo: previewTitulo,
      preview_descricao: previewDescricao,
      preview_subtitulo: previewSubtitulo,
      preview_imagem_url: previewImgUrl,
      oficial_og_titulo: oficialOgTitulo,
      oficial_og_descricao: oficialOgDescricao,
      oficial_og_imagem_url: oficialImgUrl,
      atualizado_em: new Date().toISOString(),
      atualizado_por: state.user ? state.user.email : 'admin',
    };

    // Reseta blobs temporários após gravação bem-sucedida
    state.siteBannerBlob = null;
    state.siteBannerRemovido = false;
    state.siteOficialBlob = null;
    state.siteOficialRemovido = false;

    atualizarAuditoriaSite(state.siteConfig);
    preencherFormularioSite(state.siteConfig);
    atualizarLivePreviewSite();

    try {
      localStorage.setItem('postlink_site_config', JSON.stringify(state.siteConfig));
    } catch (_) {}

    toast('Configurações salvas e publicadas com sucesso! ✨', 'success');
  } catch (err) {
    console.error('Erro ao salvar site:', err);
    toast('Erro ao salvar: ' + (err.message || err), 'error');
  } finally {
    el.btnSiteSalvar.disabled = false;
    if (el.siteSalvarIcon) {
      el.siteSalvarIcon.textContent = 'save';
      el.siteSalvarIcon.classList.remove('animate-spin');
    }
    if (el.siteSalvarTexto) el.siteSalvarTexto.textContent = 'Salvar Alterações';
  }
}

// Restaura os padrões de fábrica do PostLink
function restaurarPadraoSite() {
  const padrao = {
    titulo: 'Transforme ofertas em cartões em alta definição que abrem sozinhos e vendem no WhatsApp',
    descricao: 'Quase ninguém baixa fotos avulsas no WhatsApp para não lotar a memória do celular — e mesmo quem baixa não vai a lugar nenhum ao clicar na foto. Com o PostLink, seu produto já aparece aberto na conversa, sem ocupar a galeria do cliente e direcionando para o seu atendimento com 1 clique.',
    badge_texto: 'Abre direto no WhatsApp · Zero fotos na galeria do cliente',
    cta_texto: 'Começar Grátis',
    cta_url: '/planos/',
    banner_url: null,
    banner_ativo: true,
    preview_titulo: 'Lançamento Especial · Oferta Exclusiva com 1 Clique',
    preview_descricao: 'Compartilhe ofertas no WhatsApp com um cartão visual em alta definição que abre sozinho! 👇',
    preview_subtitulo: 'postlink.com.br/sua-loja ➔ Redireciona para o destino',
    preview_imagem_url: null,
    oficial_og_titulo: 'PostLink · Smart Links em Alta Definição para WhatsApp',
    oficial_og_descricao: 'Transforme fotos e ofertas em cartões em alta definição que abrem sozinhos no WhatsApp e aumentam suas vendas.',
    oficial_og_imagem_url: null,
  };

  if (!confirm('Deseja restaurar os textos padrão originais do PostLink? (Clique em Salvar Alterações após confirmar para gravar)')) {
    return;
  }

  state.siteBannerBlob = null;
  state.siteBannerRemovido = true;
  if (state.siteBannerPreviewUrl && state.siteBannerPreviewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(state.siteBannerPreviewUrl);
  }
  state.siteBannerPreviewUrl = '';

  state.siteOficialBlob = null;
  state.siteOficialRemovido = true;
  if (state.siteOficialPreviewUrl && state.siteOficialPreviewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(state.siteOficialPreviewUrl);
  }
  state.siteOficialPreviewUrl = '';

  preencherFormularioSite(padrao);
  atualizarLivePreviewSite();
  toast('Textos padrão restaurados na tela. Clique em "Salvar Alterações" para publicar.', 'info');
}

// Configura todos os ouvintes de eventos da aba do Site Oficial
function configurarEventosEditorSite() {
  // Delegação global de cliques para sub-abas e botões de preview
  document.addEventListener('click', (e) => {
    const btnOficial = e.target.closest('#btn-subtab-oficial, [data-subtab="oficial"]');
    if (btnOficial) {
      e.preventDefault();
      alternarSubabaSite('oficial');
      return;
    }

    const btnLanding = e.target.closest('#btn-subtab-landing, [data-subtab="landing"]');
    if (btnLanding) {
      e.preventDefault();
      alternarSubabaSite('landing');
      return;
    }

    const btnWa = e.target.closest('#btn-preview-tab-wa');
    if (btnWa) {
      e.preventDefault();
      ativarPreviewFrame('wa');
      return;
    }

    const btnHero = e.target.closest('#btn-preview-tab-hero');
    if (btnHero) {
      e.preventDefault();
      ativarPreviewFrame('hero');
      return;
    }
  });

  // 1. Sub-abas de Edição (ouvintes diretos)
  const bLanding = el.btnSubtabLanding || document.getElementById('btn-subtab-landing');
  if (bLanding) {
    bLanding.addEventListener('click', (e) => {
      e.preventDefault();
      alternarSubabaSite('landing');
    });
  }
  const bOficial = el.btnSubtabOficial || document.getElementById('btn-subtab-oficial');
  if (bOficial) {
    bOficial.addEventListener('click', (e) => {
      e.preventDefault();
      alternarSubabaSite('oficial');
    });
  }

  // 2. Sub-aba 1 (Vitrine / Landing Page): Inputs e contadores
  if (el.siteInputPreviewTitulo) {
    el.siteInputPreviewTitulo.addEventListener('input', () => {
      atualizarContadoresTextos();
      atualizarLivePreviewSite();
    });
  }
  if (el.siteInputPreviewTexto) {
    el.siteInputPreviewTexto.addEventListener('input', () => {
      atualizarContadoresTextos();
      atualizarLivePreviewSite();
    });
  }
  if (el.siteInputPreviewSubtitulo) {
    el.siteInputPreviewSubtitulo.addEventListener('input', atualizarLivePreviewSite);
  }
  if (el.siteInputBadge) el.siteInputBadge.addEventListener('input', atualizarLivePreviewSite);
  if (el.siteInputTitulo) {
    el.siteInputTitulo.addEventListener('input', () => {
      atualizarContadoresTextos();
      atualizarLivePreviewSite();
    });
  }
  if (el.siteInputDescricao) {
    el.siteInputDescricao.addEventListener('input', () => {
      atualizarContadoresTextos();
      atualizarLivePreviewSite();
    });
  }
  if (el.siteInputCtaTexto) el.siteInputCtaTexto.addEventListener('input', atualizarLivePreviewSite);
  if (el.siteSwitchBannerAtivo) el.siteSwitchBannerAtivo.addEventListener('change', atualizarLivePreviewSite);

  // Dropzone da foto de exemplo da vitrine
  if (el.siteDropzone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      el.siteDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        el.siteDropzone.classList.add('border-primary', 'bg-primary/5');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      el.siteDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        el.siteDropzone.classList.remove('border-primary', 'bg-primary/5');
      });
    });

    el.siteDropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        tratarArquivoBannerSite(dt.files[0]);
      }
    });

    el.siteDropzone.addEventListener('click', (e) => {
      if (e.target !== el.siteFileBanner && el.siteFileBanner) {
        el.siteFileBanner.click();
      }
    });
  }

  if (el.siteFileBanner) {
    el.siteFileBanner.addEventListener('change', () => {
      if (el.siteFileBanner.files && el.siteFileBanner.files.length > 0) {
        tratarArquivoBannerSite(el.siteFileBanner.files[0]);
      }
    });
  }

  if (el.btnTrocarBanner && el.siteFileBanner) {
    el.btnTrocarBanner.addEventListener('click', () => {
      el.siteFileBanner.click();
    });
  }

  if (el.btnRemoverBanner) {
    el.btnRemoverBanner.addEventListener('click', () => {
      state.siteBannerBlob = null;
      state.siteBannerRemovido = true;
      if (state.siteBannerPreviewUrl && state.siteBannerPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.siteBannerPreviewUrl);
      }
      state.siteBannerPreviewUrl = '';

      if (el.siteBannerPreviewBox) el.siteBannerPreviewBox.classList.add('hidden');
      if (el.siteBannerThumb) el.siteBannerThumb.src = '';
      if (el.siteInputBannerUrl) el.siteInputBannerUrl.value = '';
      if (el.siteFileBanner) el.siteFileBanner.value = '';

      atualizarLivePreviewSite();
      toast('Foto de exemplo removida da prévia. Salve para aplicar.', 'info');
    });
  }

  if (el.btnAplicarUrlBanner && el.siteInputBannerUrl) {
    el.btnAplicarUrlBanner.addEventListener('click', () => {
      const val = el.siteInputBannerUrl.value.trim();
      if (!val) {
        toast('Digite uma URL de imagem válida.', 'info');
        return;
      }
      state.siteBannerBlob = null;
      state.siteBannerRemovido = false;
      state.siteBannerPreviewUrl = val;

      if (el.siteBannerPreviewBox) el.siteBannerPreviewBox.classList.remove('hidden');
      if (el.siteBannerThumb) el.siteBannerThumb.src = val;
      if (el.siteBannerInfoNome) el.siteBannerInfoNome.textContent = 'Imagem externa por URL';
      if (el.siteBannerInfoDetalhe) el.siteBannerInfoDetalhe.textContent = val.slice(0, 40) + '…';

      atualizarLivePreviewSite();
      toast('URL da foto aplicada na prévia!', 'success');
    });
  }

  // 3. Sub-aba 2 (Link Oficial PostLink): Inputs e contadores
  if (el.siteInputOficialTitulo) {
    el.siteInputOficialTitulo.addEventListener('input', () => {
      atualizarContadoresTextos();
      atualizarLivePreviewSite();
    });
  }
  if (el.siteInputOficialDescricao) {
    el.siteInputOficialDescricao.addEventListener('input', () => {
      atualizarContadoresTextos();
      atualizarLivePreviewSite();
    });
  }

  // Dropzone da imagem oficial
  if (el.siteDropzoneOficial) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      el.siteDropzoneOficial.addEventListener(eventName, (e) => {
        e.preventDefault();
        el.siteDropzoneOficial.classList.add('border-emerald-500', 'bg-emerald-500/5');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      el.siteDropzoneOficial.addEventListener(eventName, (e) => {
        e.preventDefault();
        el.siteDropzoneOficial.classList.remove('border-emerald-500', 'bg-emerald-500/5');
      });
    });

    el.siteDropzoneOficial.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        tratarArquivoOficialSite(dt.files[0]);
      }
    });

    el.siteDropzoneOficial.addEventListener('click', (e) => {
      if (e.target !== el.siteFileOficial && el.siteFileOficial) {
        el.siteFileOficial.click();
      }
    });
  }

  if (el.siteFileOficial) {
    el.siteFileOficial.addEventListener('change', () => {
      if (el.siteFileOficial.files && el.siteFileOficial.files.length > 0) {
        tratarArquivoOficialSite(el.siteFileOficial.files[0]);
      }
    });
  }

  if (el.btnTrocarOficialImg && el.siteFileOficial) {
    el.btnTrocarOficialImg.addEventListener('click', () => {
      el.siteFileOficial.click();
    });
  }

  if (el.btnRemoverOficialImg) {
    el.btnRemoverOficialImg.addEventListener('click', () => {
      state.siteOficialBlob = null;
      state.siteOficialRemovido = true;
      if (state.siteOficialPreviewUrl && state.siteOficialPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.siteOficialPreviewUrl);
      }
      state.siteOficialPreviewUrl = '';

      if (el.siteOficialPreviewBox) el.siteOficialPreviewBox.classList.add('hidden');
      if (el.siteOficialThumb) el.siteOficialThumb.src = '';
      if (el.siteInputOficialImgUrl) el.siteInputOficialImgUrl.value = '';
      if (el.siteFileOficial) el.siteFileOficial.value = '';

      atualizarLivePreviewSite();
      toast('Imagem oficial removida da prévia. Salve para aplicar.', 'info');
    });
  }

  if (el.btnAplicarUrlOficial && el.siteInputOficialImgUrl) {
    el.btnAplicarUrlOficial.addEventListener('click', () => {
      const val = el.siteInputOficialImgUrl.value.trim();
      if (!val) {
        toast('Digite uma URL de imagem válida.', 'info');
        return;
      }
      state.siteOficialBlob = null;
      state.siteOficialRemovido = false;
      state.siteOficialPreviewUrl = val;

      if (el.siteOficialPreviewBox) el.siteOficialPreviewBox.classList.remove('hidden');
      if (el.siteOficialThumb) el.siteOficialThumb.src = val;
      if (el.siteOficialInfoNome) el.siteOficialInfoNome.textContent = 'Imagem externa oficial por URL';
      if (el.siteOficialInfoDetalhe) el.siteOficialInfoDetalhe.textContent = val.slice(0, 40) + '…';

      atualizarLivePreviewSite();
      toast('URL da imagem oficial aplicada na prévia!', 'success');
    });
  }

  // 4. Alternância entre prévia Hero e WhatsApp Card (Live Preview)
  if (el.btnPreviewTabHero && el.btnPreviewTabWa) {
    el.btnPreviewTabHero.addEventListener('click', () => ativarPreviewFrame('hero'));
    el.btnPreviewTabWa.addEventListener('click', () => ativarPreviewFrame('wa'));
  }

  // 5. Botões de Ação
  if (el.btnSiteSalvar) el.btnSiteSalvar.addEventListener('click', salvarConfiguracoesSite);
  if (el.btnSiteRestaurar) el.btnSiteRestaurar.addEventListener('click', restaurarPadraoSite);
}

// Inicia
init();
