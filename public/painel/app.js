// public/painel/app.js - Lógica SPA do Painel do Lojista (PostLink com Stitch Theme)
import { getSupabase } from '/assets/js/supabase-config.js';
import { comprimirImagem, normalizarDestino, slugAleatorio } from '/assets/js/compressao.js';

const sb = getSupabase();

// Estado Global da Aplicação
const state = {
  user: null,
  loja: null,
  assinatura: null,
  links: [],
  linksFiltrados: [],
  filtroAtual: 'todos',
  termoBusca: '',
  tipoDestino: 'whatsapp', // 'whatsapp' | 'url'
  estatisticas: {},
  linkEditando: null,
  arquivoBlob: null,
};

// Elementos da Interface
const el = {
  viewLoading: document.getElementById('view-loading'),
  viewOnboarding: document.getElementById('view-onboarding'),
  viewLista: document.getElementById('view-lista'),
  viewFormLink: document.getElementById('view-form-link'),
  viewPlano: document.getElementById('view-plano'),
  viewConta: document.getElementById('view-conta'),

  navLojaNome: document.getElementById('nav-loja-nome'),
  btnNovoLinkTop: document.getElementById('btn-novo-link-top'),
  btnSair: document.getElementById('btn-sair'),
  navStatusTexto: document.getElementById('nav-status-texto'),

  // Onboarding
  formOnboarding: document.getElementById('form-onboarding'),
  onboardingNome: document.getElementById('onboarding-nome'),
  onboardingSlug: document.getElementById('onboarding-slug'),
  onboardingPrefixo: document.getElementById('onboarding-prefixo'),

  // Lista & Métricas
  bannerTrial: document.getElementById('banner-trial'),
  textoTrial: document.getElementById('texto-trial'),
  listaVazia: document.getElementById('lista-vazia'),
  gridLinks: document.getElementById('grid-links'),
  contadorLinks: document.getElementById('contador-links'),
  metricTotalCliques: document.getElementById('metric-total-cliques'),
  metricCliquesMes: document.getElementById('metric-cliques-mes'),
  metricTotalLinks: document.getElementById('metric-total-links'),
  metricLinksAtivos: document.getElementById('metric-links-ativos'),
  inputBuscaLinks: document.getElementById('input-busca-links'),

  // Form Link
  tituloFormLink: document.getElementById('titulo-form-link'),
  subtituloFormLink: document.getElementById('subtitulo-form-link'),
  formLink: document.getElementById('form-link'),
  inputArquivo: document.getElementById('input-arquivo'),
  dropzone: document.getElementById('dropzone'),
  fname: document.getElementById('fname'),
  infoArquivo: document.getElementById('info-arquivo'),
  detalheCompressao: document.getElementById('detalhe-compressao'),
  eImg: document.getElementById('e-img'),

  // Tabs de Destino
  tabWaBtn: document.getElementById('tab-wa-btn'),
  tabUrlBtn: document.getElementById('tab-url-btn'),
  paneWhatsapp: document.getElementById('pane-whatsapp'),
  paneUrl: document.getElementById('pane-url'),
  waPhone: document.getElementById('wa-phone'),
  presetMessage: document.getElementById('preset-message'),
  inputDestino: document.getElementById('input-destino'),
  btnFetchMeta: document.getElementById('btn-fetch-meta'),
  fetchMetaStatus: document.getElementById('fetch-meta-status'),
  eDest: document.getElementById('e-dest'),

  detalhesPersonalizar: document.getElementById('detalhes-personalizar'),
  inputTitulo: document.getElementById('input-titulo'),
  inputDescricao: document.getElementById('input-descricao'),
  contadorDescricao: document.getElementById('contador-descricao'),
  inputSlug: document.getElementById('input-slug'),
  inputValidoAte: document.getElementById('input-valido-ate'),
  btnSubmeterLink: document.getElementById('btn-submeter-link'),

  // Live Preview WhatsApp & Redes Sociais
  previewTabWa: document.getElementById('preview-tab-wa'),
  previewTabSocial: document.getElementById('preview-tab-social'),
  previewFrameWa: document.getElementById('preview-frame-wa'),
  previewFrameSocial: document.getElementById('preview-frame-social'),
  ph: document.getElementById('ph'),
  im: document.getElementById('im'),
  pt: document.getElementById('pt'),
  pd: document.getElementById('pd'),
  waCardHost: document.getElementById('wa-card-host'),
  imSocial: document.getElementById('im-social'),
  phSocial: document.getElementById('ph-social'),
  ptSocial: document.getElementById('pt-social'),
  pdSocial: document.getElementById('pd-social'),
  socialCardHost: document.getElementById('social-card-host'),

  // Box Sucesso Inline
  res: document.getElementById('res'),
  ru: document.getElementById('ru'),
  cp: document.getElementById('cp'),
  btnShareInline: document.getElementById('btn-share-inline'),

  // Modal Sucesso
  modalSucesso: document.getElementById('modal-sucesso'),
  modalInputLink: document.getElementById('modal-input-link'),
  modalBtnCopiar: document.getElementById('modal-btn-copiar'),
  modalBtnWhatsapp: document.getElementById('modal-btn-whatsapp'),
  modalBtnFechar: document.getElementById('modal-btn-fechar'),

  // Versões e Controle de Edições
  boxVersaoStatus: document.getElementById('box-versao-status'),
  badgeVersaoTexto: document.getElementById('badge-versao-texto'),
  badgePlanoEdicao: document.getElementById('badge-plano-edicao'),
  descVersaoEdicao: document.getElementById('desc-versao-edicao'),
  progressoEdicoesWrapper: document.getElementById('progresso-edicoes-wrapper'),
  labelEdicoesUsadas: document.getElementById('label-edicoes-usadas'),
  labelEdicoesRestantes: document.getElementById('label-edicoes-restantes'),
  barraEdicoesProgresso: document.getElementById('barra-edicoes-progresso'),
  alertaLimiteEdicoes: document.getElementById('alerta-limite-edicoes'),

  // Modal Limite de Links
  modalLimiteLinks: document.getElementById('modal-limite-links'),
  modalLimiteTitulo: document.getElementById('modal-limite-titulo'),
  modalLimiteTexto: document.getElementById('modal-limite-texto'),
  modalBtnUpgradePro: document.getElementById('modal-btn-upgrade-pro'),
  modalLimiteBtnFechar: document.getElementById('modal-limite-btn-fechar'),

  // Checkout / Planos
  btnBillingMonthly: document.getElementById('btn-billing-monthly'),
  btnBillingYearly: document.getElementById('btn-billing-yearly'),
  checkoutPlanoNome: document.getElementById('checkout-plano-nome'),
  checkoutPlanoValor: document.getElementById('checkout-plano-valor'),
  btnAssinarPro: document.getElementById('btn-assinar-pro'),
  btnAssinarTexto: document.getElementById('btn-assinar-texto'),
  btnAtivarTrial: document.getElementById('btn-ativar-trial'),

  // Modal Pagamento PIX (Mercado Pago)
  modalPagamentoPix: document.getElementById('modal-pagamento-pix'),
  pixModalSubtitulo: document.getElementById('pix-modal-subtitulo'),
  pixPlanoNome: document.getElementById('pix-plano-nome'),
  pixPlanoValor: document.getElementById('pix-plano-valor'),
  pixLoadingContainer: document.getElementById('pix-loading-container'),
  pixConteudoContainer: document.getElementById('pix-conteudo-container'),
  pixSucessoContainer: document.getElementById('pix-sucesso-container'),
  pixQrImage: document.getElementById('pix-qr-image'),
  pixInputCopiaCola: document.getElementById('pix-input-copia-cola'),
  pixBtnCopiar: document.getElementById('pix-btn-copiar'),
  pixBtnCopiarTexto: document.getElementById('pix-btn-copiar-texto'),
  pixTimerTexto: document.getElementById('pix-timer-texto'),
  pixBtnFechar: document.getElementById('pix-btn-fechar'),
  pixBoxSimulacao: document.getElementById('pix-box-simulacao'),
  pixBtnSimular: document.getElementById('pix-btn-simular'),

  // Checkout Transparente Cartão de Crédito
  boxCartaoTransparente: document.getElementById('box-cartao-transparente'),
  cardBrickLoading: document.getElementById('card-brick-loading'),
  cardPaymentBrickContainer: document.getElementById('cardPaymentBrick_container'),

  // Conta
  contaEmail: document.getElementById('conta-email'),
  contaLojaNome: document.getElementById('conta-loja-nome'),
  contaLojaSlug: document.getElementById('conta-loja-slug'),
  contaStatus: document.getElementById('conta-status'),
};

// Configuração dos Planos Comerciais
export const PLANOS_CONFIG = {
  free: {
    id: 'free',
    nome: 'Plano Grátis',
    maxLinks: 1,
    maxEdicoes: 5,
    maxLojas: 1,
  },
  starter: {
    id: 'starter',
    nome: 'Plano Básico',
    mensal: 14.90,
    anualMensal: 9.90,
    anualTotal: 118.80,
    maxLinks: 5,
    maxEdicoes: Infinity,
    maxLojas: 1,
  },
  pro: {
    id: 'pro',
    nome: 'Plano Pro',
    mensal: 29.90,
    anualMensal: 21.90,
    anualTotal: 262.80,
    maxLinks: Infinity,
    maxEdicoes: Infinity,
    maxLojas: 1,
  },
  agencia: {
    id: 'agencia',
    nome: 'Plano Agência',
    mensal: 69.90,
    anualMensal: 49.90,
    anualTotal: 598.80,
    maxLinks: Infinity,
    maxEdicoes: Infinity,
    maxLojas: 5,
  }
};

function obterPlanoAtual() {
  if (!state.assinatura) return PLANOS_CONFIG.free;

  // Se estiver em período trial válido (7 dias)
  if (state.assinatura.status === 'trial') {
    const trialAte = state.assinatura.trial_ate ? new Date(state.assinatura.trial_ate) : null;
    if (trialAte && trialAte > new Date()) {
      const planoEscolhido = state.assinatura.plano || 'pro';
      return { ...(PLANOS_CONFIG[planoEscolhido] || PLANOS_CONFIG.pro), isTrial: true };
    }
  }

  // Se tiver assinatura ativa
  if (state.assinatura.status === 'ativo') {
    const planoId = state.assinatura.plano || 'pro';
    return PLANOS_CONFIG[planoId] || PLANOS_CONFIG.pro;
  }

  return PLANOS_CONFIG.free;
}

function isPlanoPago() {
  const p = obterPlanoAtual();
  return p.id !== 'free';
}

function isPlanoPro() {
  const p = obterPlanoAtual();
  return p.id === 'pro' || p.id === 'agencia';
}

function podeCriarLink() {
  const p = obterPlanoAtual();
  const total = (state.links && state.links.length) || 0;
  return total < p.maxLinks;
}

function mostrarModalLimiteLinks(msgCustom) {
  const p = obterPlanoAtual();
  if (el.modalLimiteTitulo) {
    el.modalLimiteTitulo.textContent = p.id === 'free'
      ? 'Limite do Plano Grátis'
      : `Limite de ${p.maxLinks} Links do ${p.nome}`;
  }
  if (el.modalLimiteTexto) {
    if (msgCustom) {
      el.modalLimiteTexto.textContent = msgCustom;
    } else if (p.id === 'free') {
      el.modalLimiteTexto.innerHTML = 'No plano gratuito você pode criar até <strong>1 link inteligente ativo</strong>. Faça upgrade para o <strong>Plano Básico (5 links)</strong> ou <strong>Plano Pro (Ilimitado)</strong> para acelerar suas vendas.';
    } else if (p.id === 'starter') {
      el.modalLimiteTexto.innerHTML = 'Você atingiu o limite de <strong>5 links inteligentes ativos</strong> do Plano Básico. Faça upgrade para o <strong>Plano Pro</strong> para ter links ilimitados!';
    } else {
      el.modalLimiteTexto.innerHTML = 'Você atingiu o limite de links ativos do seu plano atual. Faça upgrade para cadastrar novos links.';
    }
  }
  if (el.modalLimiteLinks) el.modalLimiteLinks.classList.remove('hidden');
}

function fecharModalLimiteLinks() {
  if (el.modalLimiteLinks) el.modalLimiteLinks.classList.add('hidden');
}

// Feedback Toast
function toast(msg, tipo = 'info') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const div = document.createElement('div');
  div.className = `toast toast-${tipo}`;
  div.innerHTML = `<span>${msg}</span>`;
  c.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// Normalização de slug
function limparSlug(v) {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');
}

// Inicialização da Sessão
async function init() {
  const hashStr = window.location.hash.replace(/^#/, '');
  const searchStr = window.location.search.replace(/^\?/, '');
  const params = new URLSearchParams(hashStr || searchStr);
  if (params.get('error_description') || params.get('error_code')) {
    window.location.href = `/login/#${hashStr || searchStr}`;
    return;
  }

  sb.auth.onAuthStateChange(async (event, session) => {
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && !state.user) {
      state.user = session.user;
      await carregarDadosLojaEAssinatura();
    }
  });

  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    if (window.location.hash.includes('access_token')) {
      return;
    }
    window.location.href = '/login/';
    return;
  }
  state.user = session.user;
  await carregarDadosLojaEAssinatura();
}

async function carregarDadosLojaEAssinatura() {
  const { data: lojas, error: errLoja } = await sb
    .from('lojas')
    .select('*')
    .eq('id', state.user.id);

  if (errLoja) {
    toast('Erro ao carregar dados da loja: ' + errLoja.message, 'error');
    return;
  }

  if (!lojas || lojas.length === 0) {
    mostrarView('onboarding');
    if (el.onboardingPrefixo) {
      el.onboardingPrefixo.textContent = window.location.origin + '/';
    }
    return;
  }

  state.loja = lojas[0];
  if (el.navLojaNome) {
    el.navLojaNome.textContent = state.loja.nome;
  }
  if (el.btnNovoLinkTop) {
    el.btnNovoLinkTop.style.display = 'inline-flex';
  }

  const { data: assinaturas } = await sb
    .from('assinaturas')
    .select('*')
    .eq('loja_id', state.loja.id);

  if (assinaturas && assinaturas.length > 0) {
    state.assinatura = assinaturas[0];
    atualizarBarraAssinatura();
  }

  window.addEventListener('hashchange', router);
  router();
}

function atualizarBarraAssinatura() {
  if (!state.assinatura || !el.textoTrial) return;
  const p = obterPlanoAtual();
  const trialAte = state.assinatura.trial_ate ? new Date(state.assinatura.trial_ate) : null;
  const hoje = new Date();
  const diffDias = trialAte ? Math.ceil((trialAte - hoje) / (1000 * 60 * 60 * 24)) : 0;

  if (state.assinatura.status === 'trial') {
    if (diffDias > 0) {
      el.textoTrial.innerHTML = `Restam <strong>${diffDias} dias</strong> de teste gratuito (${p.nome})`;
      if (el.navStatusTexto) el.navStatusTexto.textContent = `Trial (${diffDias}d)`;
    } else {
      el.textoTrial.innerHTML = `Período de teste expirado (Plano Grátis)`;
      if (el.navStatusTexto) el.navStatusTexto.textContent = 'Grátis';
    }
  } else if (state.assinatura.status === 'ativo') {
    el.textoTrial.innerHTML = `Assinatura ${p.nome} ativa e regular`;
    if (el.navStatusTexto) el.navStatusTexto.textContent = p.nome;
  } else {
    if (el.navStatusTexto) el.navStatusTexto.textContent = 'Grátis';
  }
}

// Router SPA por Hash
async function router() {
  const hash = window.location.hash || '#/';

  if (hash === '#/' || hash === '') {
    mostrarView('lista');
    await carregarLinks();
  } else if (hash === '#/novo') {
    if (!podeCriarLink()) {
      toast('Você atingiu o limite de links do seu plano. Faça upgrade para cadastrar novos links.', 'info');
      mostrarModalLimiteLinks();
      window.location.hash = '#/';
      return;
    }
    prepararFormularioNovo();
    mostrarView('form');
  } else if (hash.startsWith('#/editar/')) {
    const id = hash.replace('#/editar/', '');
    await prepararFormularioEdicao(id);
    mostrarView('form');
  } else if (hash === '#/plano') {
    renderizarTelaPlanos();
    mostrarView('plano');
  } else if (hash === '#/conta') {
    prepararTelaConta();
    mostrarView('conta');
  }
}

function mostrarView(nome) {
  if (el.viewLoading) el.viewLoading.style.display = 'none';
  if (el.viewOnboarding) el.viewOnboarding.style.display = nome === 'onboarding' ? 'block' : 'none';
  if (el.viewLista) el.viewLista.style.display = nome === 'lista' ? 'block' : 'none';
  if (el.viewFormLink) el.viewFormLink.style.display = nome === 'form' ? 'block' : 'none';
  if (el.viewPlano) el.viewPlano.style.display = nome === 'plano' ? 'block' : 'none';
  if (el.viewConta) el.viewConta.style.display = nome === 'conta' ? 'block' : 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ONBOARDING
if (el.onboardingNome) {
  el.onboardingNome.addEventListener('input', () => {
    if (!el.onboardingSlug.dataset.manual) {
      el.onboardingSlug.value = limparSlug(el.onboardingNome.value).slice(0, 30);
    }
  });
}

if (el.onboardingSlug) {
  el.onboardingSlug.addEventListener('input', () => {
    el.onboardingSlug.dataset.manual = 'true';
    el.onboardingSlug.value = limparSlug(el.onboardingSlug.value);
  });
}

if (el.formOnboarding) {
  el.formOnboarding.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = el.onboardingNome.value.trim();
    const slug = limparSlug(el.onboardingSlug.value.trim());

    if (!nome || !slug) {
      toast('Preencha o nome e o identificador do negócio.', 'error');
      return;
    }

    const btn = document.getElementById('btn-salvar-loja');
    btn.disabled = true;
    btn.textContent = 'Criando loja…';

    try {
      const { data, error } = await sb.rpc('criar_loja', {
        p_nome: nome,
        p_slug: slug,
      });

      if (error) throw error;

      state.loja = data;
      toast('Loja cadastrada com sucesso! Bem-vindo ao teste gratuito.', 'success');
      window.location.hash = '#/';
      await carregarDadosLojaEAssinatura();
    } catch (err) {
      toast('Erro ao cadastrar loja: ' + err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Começar Teste Grátis (7 Dias)';
    }
  });
}

// LISTA DE LINKS & MÉTRICAS
async function carregarLinks() {
  if (el.gridLinks) {
    el.gridLinks.innerHTML = '<div class="col-span-full py-10 text-center text-xs text-outline font-medium"><div class="spinner w-5 h-5 mx-auto mb-2"></div>Carregando seus links…</div>';
  }

  const { data: links, error: errLinks } = await sb
    .from('links')
    .select('*')
    .eq('loja_id', state.loja.id)
    .order('criado_em', { ascending: false });

  if (errLinks) {
    toast('Erro ao buscar links: ' + errLinks.message, 'error');
    return;
  }
  state.links = links || [];

  // Busca estatísticas
  try {
    const { data: stats } = await sb.rpc('estatisticas_links', { p_dias: 30 });
    state.estatisticas = {};
    if (stats) {
      stats.forEach((s) => {
        state.estatisticas[s.link_id] = s;
      });
    }
  } catch (_) {}

  atualizarMetricasBento();
  aplicarFiltrosEBusca();
}

function atualizarMetricasBento() {
  let totalCliques = 0;
  let recentesCliques = 0;
  let linksAtivos = 0;

  state.links.forEach((link) => {
    if (link.ativo) linksAtivos += 1;
    const st = state.estatisticas[link.id];
    if (st) {
      totalCliques += st.total || 0;
      recentesCliques += st.recentes || 0;
    }
  });

  if (el.metricTotalCliques) el.metricTotalCliques.textContent = totalCliques.toLocaleString('pt-BR');
  if (el.metricCliquesMes) el.metricCliquesMes.textContent = recentesCliques.toLocaleString('pt-BR');
  if (el.metricTotalLinks) el.metricTotalLinks.textContent = state.links.length;
  if (el.metricLinksAtivos) el.metricLinksAtivos.textContent = `${linksAtivos} ativos`;
}

function aplicarFiltrosEBusca() {
  let lista = [...state.links];

  // Filtro por Status
  if (state.filtroAtual === 'ativos') {
    lista = lista.filter((l) => l.ativo);
  } else if (state.filtroAtual === 'pausados') {
    lista = lista.filter((l) => !l.ativo);
  }

  // Filtro por Busca
  if (state.termoBusca) {
    const termo = state.termoBusca.toLowerCase();
    lista = lista.filter(
      (l) => (l.titulo && l.titulo.toLowerCase().includes(termo)) || l.slug.toLowerCase().includes(termo)
    );
  }

  state.linksFiltrados = lista;
  renderizarLinks();
}

function renderizarLinks() {
  if (el.contadorLinks) {
    const p = obterPlanoAtual();
    const total = state.links.length;
    const filtrados = state.linksFiltrados.length;
    el.contadorLinks.textContent = p.maxLinks === Infinity
      ? `${filtrados} de ${total} link(s) (${p.nome} · Ilimitado)`
      : `${filtrados} de ${p.maxLinks} links (${p.nome} · ${total}/${p.maxLinks} ativos)`;
  }

  if (state.links.length === 0) {
    if (el.listaVazia) el.listaVazia.classList.remove('hidden');
    if (el.gridLinks) el.gridLinks.classList.add('hidden');
    return;
  }

  if (el.listaVazia) el.listaVazia.classList.add('hidden');
  if (el.gridLinks) {
    el.gridLinks.classList.remove('hidden');
    el.gridLinks.innerHTML = '';
  }

  if (state.linksFiltrados.length === 0) {
    el.gridLinks.innerHTML = '<div class="col-span-full py-12 text-center text-xs text-on-surface-variant font-medium bg-surface-container-lowest rounded-xl border border-outline-variant/60">Nenhum link encontrado para esta busca ou filtro.</div>';
    return;
  }

  const pro = isPlanoPro();

  state.linksFiltrados.forEach((link) => {
    const card = document.createElement('div');
    card.className = 'bg-surface-container-lowest border border-outline-variant/60 hover:border-primary/40 rounded-2xl p-3.5 shadow-xs transition-all flex flex-col justify-between group';

    const fullUrl = `${window.location.origin}/${state.loja.slug}/${link.slug}`;
    const { data: { publicUrl } } = sb.storage.from('banners').getPublicUrl(link.imagem_path);
    const versaoAtual = link.versao || 1;
    const imgUrl = `${publicUrl}?v=${versaoAtual}`;
    const st = state.estatisticas[link.id] || { total: 0, recentes: 0 };

    const p = obterPlanoAtual();
    const edicoesFeitas = Math.max(0, versaoAtual - 1);
    const edicoesRestantes = Math.max(0, 5 - edicoesFeitas);

    const versaoBadgeHtml = p.maxEdicoes === Infinity
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary">v${versaoAtual} · ${p.nome}</span>`
      : `<span class="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${edicoesFeitas >= 5 ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'}">v${versaoAtual} · ${edicoesFeitas >= 5 ? '5/5 edições (limite)' : `${edicoesRestantes} edições rest.`}</span>`;

    card.innerHTML = `
      <div>
        <div class="relative aspect-[1.91/1] rounded-xl overflow-hidden bg-surface-container-low mb-3 border border-outline-variant/40">
          <img src="${imgUrl}" alt="${link.titulo || 'Banner'}" class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300">
          <span class="absolute top-2 left-2 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-surface-container-lowest/95 text-primary shadow-xs backdrop-blur-xs">
            v${versaoAtual}
          </span>
          <span class="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${link.ativo ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'} shadow-xs">
            ${link.ativo ? '● Ativo' : '○ Pausado'}
          </span>
        </div>

        <div class="flex items-center justify-between gap-1 mb-1">
          <h4 class="text-xs font-bold text-on-surface leading-snug line-clamp-1">
            ${link.titulo || state.loja.nome}
          </h4>
        </div>

        <div class="flex items-center justify-between gap-1 mb-2.5">
          <p class="text-[11px] font-mono text-primary truncate">
            /${state.loja.slug}/${link.slug}
          </p>
          ${versaoBadgeHtml}
        </div>

        <div class="bg-surface-container-low rounded-lg p-2 mb-3 flex items-center justify-between text-xs">
          <span class="text-[11px] text-outline">Cliques:</span>
          <div class="flex items-center gap-1 font-mono font-bold text-on-surface text-xs">
            <span class="text-secondary-dark">${st.recentes} (30d)</span>
            <span class="text-outline">/</span>
            <span>${st.total} total</span>
          </div>
        </div>
      </div>

      <div class="space-y-1.5 pt-1 border-t border-surface-container-high/60">
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" class="btn-copiar bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all" data-url="${fullUrl}">
            <span class="material-symbols-outlined text-sm">content_copy</span> Copiar
          </button>
          <a href="https://wa.me/?text=${encodeURIComponent(fullUrl)}" target="_blank" class="bg-secondary hover:bg-secondary-dark text-white font-bold text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all">
            <span class="material-symbols-outlined text-sm">send</span> WhatsApp
          </a>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <a href="#/editar/${link.id}" class="bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface-variant font-medium text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all">
            <span class="material-symbols-outlined text-sm">edit</span> Editar
          </a>
          <button type="button" class="btn-toggle-ativo bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface-variant font-medium text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all" data-id="${link.id}" data-ativo="${link.ativo}">
            <span class="material-symbols-outlined text-sm">${link.ativo ? 'pause' : 'play_arrow'}</span>
            <span>${link.ativo ? 'Pausar' : 'Ativar'}</span>
          </button>
        </div>
      </div>
    `;

    el.gridLinks.appendChild(card);
  });

  // Listeners dos botões de card
  document.querySelectorAll('.btn-copiar').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      navigator.clipboard.writeText(url);
      btn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Copiado!';
      setTimeout(() => {
        btn.innerHTML = '<span class="material-symbols-outlined text-sm">content_copy</span> Copiar';
      }, 1800);
      toast('Link copiado para a área de transferência!', 'success');
    });
  });

  document.querySelectorAll('.btn-toggle-ativo').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const novoStatus = btn.dataset.ativo !== 'true';
      const { error } = await sb.from('links').update({ ativo: novoStatus }).eq('id', id);
      if (error) {
        toast('Erro ao alterar status: ' + error.message, 'error');
      } else {
        toast(novoStatus ? 'Link ativado!' : 'Link pausado!', 'info');
        await carregarLinks();
      }
    });
  });
}

// Interação de Busca e Chips
if (el.inputBuscaLinks) {
  el.inputBuscaLinks.addEventListener('input', (e) => {
    state.termoBusca = e.target.value;
    aplicarFiltrosEBusca();
  });
}

document.querySelectorAll('.filtro-chip').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-chip').forEach((b) => {
      b.className = 'filtro-chip px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-surface-container-low text-on-surface-variant hover:bg-surface-container';
    });
    btn.className = 'filtro-chip px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-primary text-white shadow-xs';
    state.filtroAtual = btn.dataset.filtro;
    aplicarFiltrosEBusca();
  });
});

// ALTERNADOR DE ABAS DE DESTINO (WHATSAPP DIRETO VS URL EXTERNA)
function switchDestTab(tipo) {
  state.tipoDestino = tipo;
  if (tipo === 'whatsapp') {
    if (el.tabWaBtn) {
      el.tabWaBtn.className = 'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-container-lowest text-primary text-xs font-bold shadow-xs transition-all';
    }
    if (el.tabUrlBtn) {
      el.tabUrlBtn.className = 'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-on-surface-variant hover:text-on-surface text-xs font-medium transition-all';
    }
    if (el.paneWhatsapp) el.paneWhatsapp.classList.remove('hidden');
    if (el.paneUrl) el.paneUrl.classList.add('hidden');
  } else {
    if (el.tabUrlBtn) {
      el.tabUrlBtn.className = 'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-container-lowest text-primary text-xs font-bold shadow-xs transition-all';
    }
    if (el.tabWaBtn) {
      el.tabWaBtn.className = 'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-on-surface-variant hover:text-on-surface text-xs font-medium transition-all';
    }
    if (el.paneUrl) el.paneUrl.classList.remove('hidden');
    if (el.paneWhatsapp) el.paneWhatsapp.classList.add('hidden');
  }
}

if (el.tabWaBtn) el.tabWaBtn.addEventListener('click', () => switchDestTab('whatsapp'));
if (el.tabUrlBtn) el.tabUrlBtn.addEventListener('click', () => switchDestTab('url'));

// Chips de Tags dinâmicas na mensagem
document.querySelectorAll('.btn-tag').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tag = btn.dataset.tag;
    if (el.presetMessage) {
      el.presetMessage.value += (el.presetMessage.value ? ' ' : '') + tag;
      el.presetMessage.focus();
    }
  });
});

// FORMULÁRIO (NOVO / EDITAR)
function prepararFormularioNovo() {
  state.linkEditando = null;
  state.arquivoBlob = null;

  if (el.tituloFormLink) el.tituloFormLink.textContent = 'Configurar Novo Link';
  if (el.subtituloFormLink) el.subtituloFormLink.textContent = 'Passo 1 de 2: Configure os dados do cartão';
  if (el.btnSubmeterLink) {
    el.btnSubmeterLink.disabled = false;
    el.btnSubmeterLink.title = '';
    el.btnSubmeterLink.textContent = 'Criar Link Inteligente';
  }
  if (el.formLink) el.formLink.reset();

  if (el.boxVersaoStatus) el.boxVersaoStatus.classList.add('hidden');
  if (el.alertaLimiteEdicoes) el.alertaLimiteEdicoes.classList.add('hidden');

  if (el.fname) el.fname.textContent = 'Escolher da galeria ou arrastar foto';
  if (el.infoArquivo) el.infoArquivo.classList.add('hidden');
  if (el.eImg) el.eImg.textContent = '';
  if (el.eDest) el.eDest.textContent = '';
  if (el.res) el.res.classList.add('hidden');

  switchDestTab('whatsapp');

  if (el.fetchMetaStatus) el.fetchMetaStatus.textContent = '';

  if (el.inputSlug) {
    el.inputSlug.value = slugAleatorio();
  }

  if (el.detalhesPersonalizar) {
    el.detalhesPersonalizar.open = false;
  }

  atualizarContadorDescricao();

  if (el.ph) el.ph.style.display = 'flex';
  if (el.im) {
    el.im.classList.add('hidden');
    el.im.src = '';
  }

  // Verifica se o usuário veio da experimentação sem login na Landing Page
  try {
    const rawDraft = sessionStorage.getItem('postlink_draft');
    if (rawDraft) {
      sessionStorage.removeItem('postlink_draft');
      const draft = JSON.parse(rawDraft);
      if (draft && draft.url) {
        switchDestTab('url');
        if (el.inputDestino) el.inputDestino.value = draft.url;
        if (draft.title && el.inputTitulo) el.inputTitulo.value = draft.title;
        if (draft.description && el.inputDescricao) {
          el.inputDescricao.value = draft.description.slice(0, 200);
          atualizarContadorDescricao();
        }
        if (el.detalhesPersonalizar) el.detalhesPersonalizar.open = true;

        if (draft.image) {
          baixarEProcessarImagemUrl(draft.image);
        }
        toast('Dados do cartão carregados da página inicial!', 'info');
      }
    }
  } catch (_) {}

  atualizarLivePreview();
}

async function prepararFormularioEdicao(id) {
  state.arquivoBlob = null;
  if (el.tituloFormLink) el.tituloFormLink.textContent = 'Editar Link';
  if (el.subtituloFormLink) el.subtituloFormLink.textContent = 'Atualize os dados e banner do link';
  if (el.btnSubmeterLink) el.btnSubmeterLink.textContent = 'Salvar Alterações';
  if (el.res) el.res.classList.add('hidden');
  if (el.eImg) el.eImg.textContent = '';
  if (el.eDest) el.eDest.textContent = '';

  const { data: link, error } = await sb
    .from('links')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !link) {
    toast('Link não encontrado.', 'error');
    window.location.hash = '#/';
    return;
  }

  state.linkEditando = link;

  // Controle de Versão e Limite de Alterações
  const versaoAtual = link.versao || 1;
  const edicoesFeitas = Math.max(0, versaoAtual - 1);
  const pro = isPlanoPro();
  const restantes = Math.max(0, 5 - edicoesFeitas);

  if (el.boxVersaoStatus) {
    el.boxVersaoStatus.classList.remove('hidden');
    if (el.badgeVersaoTexto) el.badgeVersaoTexto.textContent = `Versão ${versaoAtual}`;

    if (pro) {
      if (el.badgePlanoEdicao) {
        el.badgePlanoEdicao.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary text-white';
        el.badgePlanoEdicao.textContent = 'Plano Pro · Ilimitado';
      }
      if (el.descVersaoEdicao) {
        el.descVersaoEdicao.textContent = `Você está na versão ${versaoAtual}. No Plano Pro, suas edições de imagem e destinos são ilimitadas!`;
      }
      if (el.progressoEdicoesWrapper) el.progressoEdicoesWrapper.classList.add('hidden');
      if (el.alertaLimiteEdicoes) el.alertaLimiteEdicoes.classList.add('hidden');
      if (el.btnSubmeterLink) {
        el.btnSubmeterLink.disabled = false;
        el.btnSubmeterLink.title = '';
      }
    } else {
      if (el.badgePlanoEdicao) {
        el.badgePlanoEdicao.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container';
        el.badgePlanoEdicao.textContent = 'Plano Grátis';
      }
      if (el.progressoEdicoesWrapper) el.progressoEdicoesWrapper.classList.remove('hidden');

      if (el.labelEdicoesUsadas) el.labelEdicoesUsadas.textContent = `${edicoesFeitas} de 5 alterações utilizadas`;
      if (el.labelEdicoesRestantes) el.labelEdicoesRestantes.textContent = restantes === 1 ? '1 restante' : `${restantes} restantes`;

      const pct = Math.min(100, Math.round((edicoesFeitas / 5) * 100));
      if (el.barraEdicoesProgresso) {
        el.barraEdicoesProgresso.style.width = `${pct}%`;
        el.barraEdicoesProgresso.className = edicoesFeitas >= 5
          ? 'bg-error h-full rounded-full transition-all duration-300'
          : (edicoesFeitas >= 4 ? 'bg-amber-500 h-full rounded-full transition-all duration-300' : 'bg-primary h-full rounded-full transition-all duration-300');
      }

      if (edicoesFeitas >= 5) {
        if (el.descVersaoEdicao) {
          el.descVersaoEdicao.textContent = 'Você atingiu o limite de 5 alterações permitidas no plano grátis para este link.';
        }
        if (el.alertaLimiteEdicoes) el.alertaLimiteEdicoes.classList.remove('hidden');
        if (el.btnSubmeterLink) {
          el.btnSubmeterLink.disabled = true;
          el.btnSubmeterLink.title = 'Faça upgrade para o Plano Pro para liberar edições ilimitadas';
        }
      } else {
        if (el.descVersaoEdicao) {
          el.descVersaoEdicao.textContent = `Cada alteração (banner, número WhatsApp, URL ou textos) gera uma nova versão e renova o preview do WhatsApp. Restam ${restantes} alterações no plano grátis.`;
        }
        if (el.alertaLimiteEdicoes) el.alertaLimiteEdicoes.classList.add('hidden');
        if (el.btnSubmeterLink) {
          el.btnSubmeterLink.disabled = false;
          el.btnSubmeterLink.title = '';
        }
      }
    }
  }

  // Analisa se o destino é WhatsApp ou URL externa
  if (link.destino.includes('wa.me/')) {
    switchDestTab('whatsapp');
    try {
      const u = new URL(link.destino);
      const tel = u.pathname.replace(/^\//, '').replace(/^55/, '');
      if (el.waPhone) el.waPhone.value = tel;
      const msg = u.searchParams.get('text');
      if (el.presetMessage && msg) el.presetMessage.value = msg;
    } catch (_) {
      if (el.inputDestino) el.inputDestino.value = link.destino;
    }
  } else {
    switchDestTab('url');
    if (el.inputDestino) el.inputDestino.value = link.destino;
  }

  if (el.inputTitulo) el.inputTitulo.value = link.titulo || '';
  if (el.inputDescricao) el.inputDescricao.value = link.descricao || '';
  atualizarContadorDescricao();
  if (el.inputSlug) el.inputSlug.value = link.slug;
  if (el.inputValidoAte) {
    el.inputValidoAte.value = link.valido_ate ? new Date(link.valido_ate).toISOString().slice(0, 16) : '';
  }

  // Foto existente
  const { data: { publicUrl } } = sb.storage.from('banners').getPublicUrl(link.imagem_path);
  const imgUrl = `${publicUrl}?v=${versaoAtual}`;

  if (el.fname) el.fname.textContent = 'Trocar imagem atual';
  if (el.im) {
    el.im.src = imgUrl;
    el.im.classList.remove('hidden');
  }
  if (el.ph) el.ph.style.display = 'none';

  if (el.detalhesPersonalizar) {
    el.detalhesPersonalizar.open = true;
  }

  atualizarLivePreview();
}

// Manipulação de Dropzone e Arquivo
if (el.dropzone) {
  ['dragenter', 'dragover'].forEach((eventName) => {
    el.dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      el.dropzone.classList.add('border-primary');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    el.dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      el.dropzone.classList.remove('border-primary');
    });
  });

  el.dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files.length > 0) {
      tratarArquivoSelecionado(dt.files[0]);
    }
  });
}

if (el.inputArquivo) {
  el.inputArquivo.addEventListener('change', () => {
    if (el.inputArquivo.files.length > 0) {
      tratarArquivoSelecionado(el.inputArquivo.files[0]);
    }
  });
}

async function tratarArquivoSelecionado(file) {
  if (!file.type.startsWith('image/')) {
    if (el.eImg) el.eImg.textContent = 'Por favor, selecione uma imagem (JPEG, PNG ou WebP).';
    return;
  }

  if (el.eImg) el.eImg.textContent = '';
  if (el.fname) el.fname.textContent = file.name;
  if (el.infoArquivo) {
    el.infoArquivo.classList.remove('hidden');
    if (el.detalheCompressao) el.detalheCompressao.textContent = 'Otimizando proporção 1.91:1…';
  }

  try {
    const tamanhoOriginalKB = Math.round(file.size / 1024);
    const blob = await comprimirImagem(file, { larguraMax: 1200, alvoKB: 300 });
    state.arquivoBlob = blob;

    const urlPreview = URL.createObjectURL(blob);
    if (el.im) {
      el.im.src = urlPreview;
      el.im.classList.remove('hidden');
    }
    if (el.ph) el.ph.style.display = 'none';

    const tamanhoFinalKB = Math.round(blob.size / 1024);
    const economia = Math.max(0, Math.round(((tamanhoOriginalKB - tamanhoFinalKB) / tamanhoOriginalKB) * 100));

    if (el.detalheCompressao) {
      el.detalheCompressao.textContent = `${tamanhoOriginalKB}KB → ${tamanhoFinalKB}KB (-${economia}%) · Alta Definição`;
    }
  } catch (err) {
    if (el.eImg) el.eImg.textContent = 'Erro ao processar imagem: ' + err.message;
    state.arquivoBlob = null;
  }
}

// Live Preview
function fullUrlExibicao() {
  const lojaSlug = state.loja ? state.loja.slug : 'loja';
  const slug = el.inputSlug ? limparSlug(el.inputSlug.value).replace(/^-|-$/g, '') || 'link' : 'link';
  const host = window.location.host || 'postlink.com.br';
  return `${host}/${lojaSlug}/${slug}`;
}

function atualizarLivePreview() {
  const lojaNome = state.loja ? state.loja.nome : 'Minha Loja';
  const titulo = (el.inputTitulo && el.inputTitulo.value.trim()) || lojaNome;
  const desc = el.inputDescricao ? el.inputDescricao.value.trim() : '';
  const hostAtual = window.location.host || 'postlink.com.br';

  // Preview WhatsApp
  if (el.pt) el.pt.textContent = titulo;
  if (el.pd) {
    el.pd.textContent = desc;
    if (desc) {
      el.pd.classList.remove('hidden');
    } else {
      el.pd.classList.add('hidden');
    }
  }
  if (el.waCardHost) {
    el.waCardHost.textContent = hostAtual;
  }

  // Preview Redes Sociais
  if (el.ptSocial) el.ptSocial.textContent = titulo;
  if (el.pdSocial) {
    el.pdSocial.textContent = desc || 'Clique para acessar e conferir todos os detalhes.';
  }
  if (el.socialCardHost) {
    el.socialCardHost.textContent = hostAtual;
  }

  // Sincroniza imagem entre WhatsApp e Redes Sociais
  if (el.im && !el.im.classList.contains('hidden') && el.im.src) {
    if (el.imSocial) {
      el.imSocial.src = el.im.src;
      el.imSocial.classList.remove('hidden');
    }
    if (el.phSocial) el.phSocial.classList.add('hidden');
  } else {
    if (el.imSocial) {
      el.imSocial.classList.add('hidden');
      el.imSocial.src = '';
    }
    if (el.phSocial) el.phSocial.classList.remove('hidden');
  }
}

// Controle de Abas no Preview (WhatsApp vs Redes Sociais)
if (el.previewTabWa && el.previewTabSocial) {
  el.previewTabWa.addEventListener('click', () => {
    if (el.previewFrameWa) el.previewFrameWa.classList.remove('hidden');
    if (el.previewFrameSocial) el.previewFrameSocial.classList.add('hidden');
    el.previewTabWa.className = 'flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest text-primary font-bold shadow-2xs transition-all';
    el.previewTabSocial.className = 'flex items-center gap-1 px-2.5 py-1 rounded-md text-on-surface-variant hover:text-on-surface transition-all';
  });

  el.previewTabSocial.addEventListener('click', () => {
    if (el.previewFrameSocial) el.previewFrameSocial.classList.remove('hidden');
    if (el.previewFrameWa) el.previewFrameWa.classList.add('hidden');
    el.previewTabSocial.className = 'flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest text-primary font-bold shadow-2xs transition-all';
    el.previewTabWa.className = 'flex items-center gap-1 px-2.5 py-1 rounded-md text-on-surface-variant hover:text-on-surface transition-all';
  });
}

// Baixa imagem de uma URL externa via proxy e comprime no Canvas
async function baixarEProcessarImagemUrl(imgUrl) {
  if (!imgUrl) return;
  try {
    if (el.fetchMetaStatus) el.fetchMetaStatus.textContent = 'Otimizando banner HD... ⏳';
    const proxyUrl = '/api/proxy-image?url=' + encodeURIComponent(imgUrl);
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('Falha ao baixar imagem do site');
    const blob = await res.blob();
    const arquivoFake = new File([blob], 'banner-importado.jpg', { type: blob.type || 'image/jpeg' });
    await tratarArquivoSelecionado(arquivoFake);
    if (el.fetchMetaStatus) el.fetchMetaStatus.textContent = 'Banner e dados importados! ✨';
  } catch (err) {
    console.warn('Não foi possível processar imagem via proxy:', err);
    // Fallback: tenta exibir direto no preview se possível
    if (el.im) {
      el.im.src = imgUrl;
      el.im.classList.remove('hidden');
    }
    if (el.ph) el.ph.style.display = 'none';
    atualizarLivePreview();
  }
}

// Auto-import de metadados da URL de destino
async function importarMetadadosUrl() {
  let urlDest = el.inputDestino ? el.inputDestino.value.trim() : '';
  if (!urlDest) {
    if (el.fetchMetaStatus) el.fetchMetaStatus.textContent = 'Digite uma URL primeiro';
    return;
  }

  // Se o usuário não colocou https://, normaliza e atualiza o campo de imediato
  const normalizado = normalizarDestino(urlDest);
  if (normalizado) {
    urlDest = normalizado;
    if (el.inputDestino) el.inputDestino.value = normalizado;
  }

  if (el.btnFetchMeta) el.btnFetchMeta.disabled = true;
  if (el.fetchMetaStatus) el.fetchMetaStatus.textContent = 'Buscando informações da oferta... ⚡';

  try {
    const res = await fetch('/api/fetch-metadata?url=' + encodeURIComponent(urlDest));
    const data = await res.json();

    if (!data || !data.success) {
      throw new Error((data && data.error) || 'Não foi possível ler as informações do link');
    }

    // Preenche título se não tiver preenchido manualmente
    if (el.inputTitulo && (!el.inputTitulo.value.trim() || el.inputTitulo.value === (state.loja ? state.loja.nome : ''))) {
      el.inputTitulo.value = data.title || '';
    }

    // Preenche descrição
    if (el.inputDescricao && !el.inputDescricao.value.trim()) {
      el.inputDescricao.value = (data.description || '').slice(0, 200);
      atualizarContadorDescricao();
    }

    // Sugere slug amigável baseado no título ou hostname se estiver vazio
    if (el.inputSlug && (!el.inputSlug.value || el.inputSlug.value.length < 4)) {
      const slugSugestao = limparSlug(data.title || data.hostname || 'oferta');
      if (slugSugestao) el.inputSlug.value = slugSugestao.slice(0, 30);
    }

    if (el.detalhesPersonalizar) {
      el.detalhesPersonalizar.open = true;
    }

    atualizarLivePreview();

    // Se tiver imagem e ainda não tiver arquivo selecionado
    if (data.image && !state.arquivoBlob) {
      await baixarEProcessarImagemUrl(data.image);
    } else {
      if (el.fetchMetaStatus) el.fetchMetaStatus.textContent = 'Título e descrição importados! ✨';
    }

    toast('Dados importados da página com sucesso!', 'success');
  } catch (err) {
    if (el.fetchMetaStatus) el.fetchMetaStatus.textContent = err.message || 'Falha ao importar';
    toast('Não foi possível obter dados automáticos: ' + (err.message || 'Tente digitar manualmente.'), 'warning');
  } finally {
    if (el.btnFetchMeta) el.btnFetchMeta.disabled = false;
  }
}

if (el.btnFetchMeta) {
  el.btnFetchMeta.addEventListener('click', importarMetadadosUrl);
}

if (el.inputDestino) {
  // Ao sair do campo (blur), adiciona https:// automaticamente se o usuário não digitou
  el.inputDestino.addEventListener('blur', () => {
    const val = el.inputDestino.value.trim();
    if (val) {
      const normalizado = normalizarDestino(val);
      if (normalizado) {
        el.inputDestino.value = normalizado;
        if (el.eDest) el.eDest.textContent = '';
      }
    }
  });

  el.inputDestino.addEventListener('input', () => {
    if (el.eDest) el.eDest.textContent = '';
  });
}

// Atualiza contador de caracteres da descrição curta (máx. 200)
function atualizarContadorDescricao() {
  if (!el.contadorDescricao) return;
  const len = el.inputDescricao ? el.inputDescricao.value.length : 0;
  el.contadorDescricao.textContent = `${len} / 200`;

  if (len >= 200) {
    el.contadorDescricao.className = 'text-[10px] font-mono font-bold text-error';
  } else if (len >= 180) {
    el.contadorDescricao.className = 'text-[10px] font-mono font-semibold text-amber-500';
  } else {
    el.contadorDescricao.className = 'text-[10px] font-mono font-semibold text-outline';
  }
}

if (el.inputTitulo) el.inputTitulo.addEventListener('input', atualizarLivePreview);
if (el.inputDescricao) {
  el.inputDescricao.addEventListener('input', () => {
    atualizarContadorDescricao();
    atualizarLivePreview();
  });
}
if (el.inputSlug) {
  el.inputSlug.addEventListener('input', () => {
    el.inputSlug.value = limparSlug(el.inputSlug.value);
    atualizarLivePreview();
  });
}

// Montar Destino Final
function obterDestinoNormalizado() {
  if (state.tipoDestino === 'whatsapp') {
    const rawTel = el.waPhone ? el.waPhone.value.replace(/\D/g, '') : '';
    if (!rawTel || rawTel.length < 10) {
      return null;
    }
    const telComDDI = rawTel.startsWith('55') ? rawTel : `55${rawTel}`;
    const msg = el.presetMessage ? el.presetMessage.value.trim() : '';
    return msg ? `https://wa.me/${telComDDI}?text=${encodeURIComponent(msg)}` : `https://wa.me/${telComDDI}`;
  } else {
    const destBruto = el.inputDestino ? el.inputDestino.value.trim() : '';
    const normalizado = normalizarDestino(destBruto);
    if (normalizado && el.inputDestino) {
      el.inputDestino.value = normalizado;
    }
    return normalizado;
  }
}

// Submissão do Formulário
if (el.formLink) {
  el.formLink.addEventListener('submit', async (e) => {
    e.preventDefault();

    const destino = obterDestinoNormalizado();
    if (!destino) {
      if (el.eDest) {
        el.eDest.textContent = state.tipoDestino === 'whatsapp'
          ? 'Digite um número de WhatsApp válido com DDD (Ex: 15998765432).'
          : 'Digite uma URL válida (Ex: sualoja.com.br ou https://instagram.com/sualoja).';
      }
      return;
    }

    if (!state.linkEditando && !state.arquivoBlob) {
      if (el.eImg) el.eImg.textContent = 'Escolha uma imagem para o cartão.';
      return;
    }

    if (el.btnSubmeterLink) {
      el.btnSubmeterLink.disabled = true;
      el.btnSubmeterLink.textContent = 'Gravando link…';
    }

    try {
      const titulo = (el.inputTitulo && el.inputTitulo.value.trim()) || null;
      const descricao = (el.inputDescricao && el.inputDescricao.value.trim()) || null;
      const slugDesejado = (el.inputSlug && limparSlug(el.inputSlug.value.trim())) || null;
      const validoAte = (el.inputValidoAte && el.inputValidoAte.value) ? new Date(el.inputValidoAte.value).toISOString() : null;

      if (state.linkEditando) {
        const versaoAtual = state.linkEditando.versao || 1;
        const edicoesFeitas = Math.max(0, versaoAtual - 1);

        const p = obterPlanoAtual();
        // Bloqueio de limite de alterações se não for ilimitado
        if (p.maxEdicoes !== Infinity && edicoesFeitas >= p.maxEdicoes) {
          toast(`Limite de ${p.maxEdicoes} alterações atingido no ${p.nome}. Faça upgrade para o Pro.`, 'error');
          mostrarModalLimiteLinks(`Você atingiu o limite de ${p.maxEdicoes} alterações do ${p.nome}. Faça upgrade para ter edições ilimitadas.`);
          return;
        }

        // A cada alteração (imagem, destino, telefone, textos ou slug), a versão é SEMPRE incrementada
        const versao = versaoAtual + 1;
        let caminhoImagem = state.linkEditando.imagem_path;

        if (state.arquivoBlob) {
          caminhoImagem = `${state.user.id}/${state.linkEditando.id}-v${versao}.jpg`;
          const { error: errUpload } = await sb.storage
            .from('banners')
            .upload(caminhoImagem, state.arquivoBlob, { contentType: 'image/jpeg' });

          if (errUpload) throw errUpload;
        }

        const slugFinal = slugDesejado || state.linkEditando.slug;
        const { error: errUpdate } = await sb
          .from('links')
          .update({
            destino,
            titulo,
            descricao,
            valido_ate: validoAte,
            imagem_path: caminhoImagem,
            versao,
            slug: slugFinal,
          })
          .eq('id', state.linkEditando.id);

        if (errUpdate) throw errUpdate;

        toast(`Link atualizado com sucesso! (Versão ${versao})`, 'success');
        const linkPronto = `${window.location.origin}/${state.loja.slug}/${slugFinal}`;
        exibirResultadoCriado(linkPronto);
      } else {
        // Bloqueio de criação respeitando o limite do plano contratado
        if (!podeCriarLink()) {
          const p = obterPlanoAtual();
          toast(`Limite de ${p.maxLinks} links do seu plano atingido. Faça upgrade para cadastrar novos links.`, 'info');
          mostrarModalLimiteLinks();
          return;
        }

        const linkId = crypto.randomUUID();
        const versao = 1;
        const caminhoImagem = `${state.user.id}/${linkId}-v${versao}.jpg`;

        const { error: errUpload } = await sb.storage
          .from('banners')
          .upload(caminhoImagem, state.arquivoBlob, { contentType: 'image/jpeg' });

        if (errUpload) throw errUpload;

        let slugFinal = slugDesejado;
        let sucesso = false;

        for (let i = 0; i < 5; i++) {
          const slugTentativa = slugFinal || slugAleatorio();
          const { error: errInsert } = await sb.from('links').insert({
            id: linkId,
            loja_id: state.user.id,
            slug: slugTentativa,
            destino,
            imagem_path: caminhoImagem,
            versao,
            titulo,
            descricao,
            valido_ate: validoAte,
            ativo: true,
          });

          if (!errInsert) {
            slugFinal = slugTentativa;
            sucesso = true;
            break;
          }

          if (errInsert.code === '23505' && !slugDesejado) {
            continue;
          }

          await sb.storage.from('banners').remove([caminhoImagem]);
          throw errInsert;
        }

        if (!sucesso) {
          await sb.storage.from('banners').remove([caminhoImagem]);
          throw new Error('Não foi possível gerar um apelido livre para o link. Tente outro.');
        }

        const linkPronto = `${window.location.origin}/${state.loja.slug}/${slugFinal}`;
        exibirResultadoCriado(linkPronto);
      }
    } catch (err) {
      toast('Erro ao salvar link: ' + err.message, 'error');
    } finally {
      if (el.btnSubmeterLink) {
        el.btnSubmeterLink.disabled = false;
        el.btnSubmeterLink.textContent = state.linkEditando ? 'Salvar Alterações' : 'Criar Link Inteligente';
      }
    }
  });
}

function exibirResultadoCriado(url) {
  if (el.res) {
    el.res.classList.remove('hidden');
    if (el.ru) el.ru.textContent = url;
    if (el.btnShareInline) {
      el.btnShareInline.href = `https://wa.me/?text=${encodeURIComponent(url)}`;
    }
  }

  if (el.modalSucesso && el.modalInputLink) {
    el.modalInputLink.value = url;
    if (el.modalBtnWhatsapp) {
      el.modalBtnWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(url)}`;
    }
    el.modalSucesso.classList.remove('hidden');
  }

  toast('Link inteligente criado com sucesso!', 'success');
}

// Listeners do Modal e Copy
if (el.cp) {
  el.cp.addEventListener('click', () => {
    if (el.ru) {
      navigator.clipboard.writeText(el.ru.textContent);
      toast('Link copiado!', 'success');
    }
  });
}

if (el.modalBtnCopiar) {
  el.modalBtnCopiar.addEventListener('click', () => {
    if (el.modalInputLink) {
      navigator.clipboard.writeText(el.modalInputLink.value);
      toast('Link copiado!', 'success');
    }
  });
}

if (el.modalBtnFechar) {
  el.modalBtnFechar.addEventListener('click', () => {
    if (el.modalSucesso) el.modalSucesso.classList.add('hidden');
    window.location.hash = '#/';
  });
}

// CHECKOUT / PLANOS (#/plano)
let billingCycle = 'monthly';
let planoSelecionado = 'pro';

const DADOS_EXIBICAO_PLANOS = {
  starter: {
    nome: 'Plano Básico (Starter)',
    precoMensal: 'R$ 14,90',
    periodoMensal: '/mês',
    obsMensal: 'Cobrado mensalmente',
    precoAnual: 'R$ 9,90',
    periodoAnual: '/mês',
    obsAnual: 'R$ 118,80 cobrado anual · 33% OFF',
  },
  pro: {
    nome: 'Plano Pro (Negócio)',
    precoMensal: 'R$ 29,90',
    periodoMensal: '/mês',
    obsMensal: 'Cobrado mensalmente',
    precoAnual: 'R$ 21,90',
    periodoAnual: '/mês',
    obsAnual: 'R$ 262,80 cobrado anual · 27% OFF',
  },
  agencia: {
    nome: 'Plano Agência (Escala)',
    precoMensal: 'R$ 69,90',
    periodoMensal: '/mês',
    obsMensal: 'Cobrado mensalmente',
    precoAnual: 'R$ 49,90',
    periodoAnual: '/mês',
    obsAnual: 'R$ 598,80 cobrado anual · 28% OFF',
  }
};

function renderizarTelaPlanos() {
  if (el.btnBillingMonthly && el.btnBillingYearly) {
    if (billingCycle === 'monthly') {
      el.btnBillingMonthly.className = 'px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs bg-surface-container-lowest text-primary';
      el.btnBillingYearly.className = 'px-5 py-2 rounded-lg text-xs font-medium transition-all text-on-surface-variant flex items-center gap-1.5 hover:text-on-surface';
    } else {
      el.btnBillingYearly.className = 'px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs bg-surface-container-lowest text-primary flex items-center gap-1.5';
      el.btnBillingMonthly.className = 'px-5 py-2 rounded-lg text-xs font-medium transition-all text-on-surface-variant hover:text-on-surface';
    }
  }

  ['starter', 'pro', 'agencia'].forEach((pId) => {
    const cardEl = document.getElementById(`card-plano-${pId}`);
    const precoEl = document.querySelector(`.card-preco[data-plano="${pId}"]`);
    const periodoEl = document.querySelector(`.card-periodo[data-plano="${pId}"]`);
    const obsEl = document.querySelector(`.card-obs[data-plano="${pId}"]`);
    const btnEl = document.querySelector(`.btn-selecionar-plano[data-plano="${pId}"]`);
    const info = DADOS_EXIBICAO_PLANOS[pId];

    if (precoEl) precoEl.textContent = billingCycle === 'monthly' ? info.precoMensal : info.precoAnual;
    if (periodoEl) periodoEl.textContent = billingCycle === 'monthly' ? info.periodoMensal : info.periodoAnual;
    if (obsEl) obsEl.textContent = billingCycle === 'monthly' ? info.obsMensal : info.obsAnual;

    const isSel = planoSelecionado === pId;
    if (cardEl) {
      if (isSel) {
        cardEl.className = 'card-plano bg-surface-container-lowest rounded-2xl p-5 border-2 border-primary shadow-md flex flex-col justify-between transition-all cursor-pointer relative ring-2 ring-primary/20';
      } else {
        cardEl.className = 'card-plano bg-surface-container-lowest rounded-2xl p-5 border-2 border-outline-variant/60 flex flex-col justify-between hover:border-primary/40 transition-all cursor-pointer relative';
      }
    }
    if (btnEl) {
      if (isSel) {
        btnEl.className = 'btn-selecionar-plano w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-container shadow-xs transition-all';
        btnEl.textContent = 'Plano Selecionado ✓';
      } else {
        btnEl.className = 'btn-selecionar-plano w-full py-2.5 px-3 rounded-xl text-xs font-bold border border-outline-variant hover:bg-surface-container transition-all';
        btnEl.textContent = pId === 'starter' ? 'Selecionar Básico' : (pId === 'pro' ? 'Selecionar Pro' : 'Selecionar Agência');
      }
    }
  });

  const selInfo = DADOS_EXIBICAO_PLANOS[planoSelecionado];
  if (el.checkoutPlanoNome) el.checkoutPlanoNome.textContent = selInfo.nome;
  if (el.checkoutPlanoValor) {
    el.checkoutPlanoValor.textContent = billingCycle === 'monthly'
      ? `${selInfo.precoMensal} / mês`
      : `${selInfo.obsAnual.split('·')[0].trim()}`;
  }
  atualizarTextoBotaoCheckout();
}

let metodoPagamento = 'pix';
let pollingPixInterval = null;
let timerPixInterval = null;
let paymentIdAtual = null;

function atualizarTextoBotaoCheckout() {
  if (!el.btnAssinarTexto) return;
  const selInfo = DADOS_EXIBICAO_PLANOS[planoSelecionado];
  const valorTexto = billingCycle === 'monthly' ? selInfo.precoMensal : selInfo.obsAnual.split('cobrado')[0].trim();
  
  if (metodoPagamento === 'pix') {
    el.btnAssinarTexto.textContent = `Pagar ${valorTexto} via PIX e Liberar Imediatamente`;
  } else {
    el.btnAssinarTexto.textContent = `Pagar ${valorTexto} com Cartão de Crédito`;
  }
}

function setBilling(cycle) {
  billingCycle = cycle;
  renderizarTelaPlanos();
}

function selecionarPlano(id) {
  if (DADOS_EXIBICAO_PLANOS[id]) {
    planoSelecionado = id;
    renderizarTelaPlanos();
  }
}

function fecharModalPix() {
  if (el.modalPagamentoPix) {
    el.modalPagamentoPix.classList.add('hidden');
  }
  if (pollingPixInterval) {
    clearInterval(pollingPixInterval);
    pollingPixInterval = null;
  }
  if (timerPixInterval) {
    clearInterval(timerPixInterval);
    timerPixInterval = null;
  }
}

function iniciarTimerPix(expiraEm) {
  if (timerPixInterval) clearInterval(timerPixInterval);
  const dataFinal = expiraEm ? new Date(expiraEm).getTime() : Date.now() + 30 * 60 * 1000;

  function atualizarTimer() {
    const agora = Date.now();
    const dif = Math.max(0, Math.floor((dataFinal - agora) / 1000));
    const minutos = Math.floor(dif / 60);
    const segundos = dif % 60;
    if (el.pixTimerTexto) {
      el.pixTimerTexto.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }
    if (dif <= 0) {
      clearInterval(timerPixInterval);
      if (el.pixTimerTexto) el.pixTimerTexto.textContent = 'Expirado';
    }
  }

  atualizarTimer();
  timerPixInterval = setInterval(atualizarTimer, 1000);
}

function iniciarPollingPix(paymentId, plano) {
  if (pollingPixInterval) clearInterval(pollingPixInterval);

  pollingPixInterval = setInterval(async () => {
    try {
      const url = `/api/mp-verificar-pagamento?payment_id=${encodeURIComponent(paymentId)}&loja_id=${encodeURIComponent(state.loja?.id || '')}&plano=${encodeURIComponent(plano)}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      if (data.aprovado === true) {
        // Pagamento aprovado com sucesso!
        clearInterval(pollingPixInterval);
        pollingPixInterval = null;
        if (timerPixInterval) clearInterval(timerPixInterval);

        // Atualização imediata do estado local
        if (state.assinatura) {
          state.assinatura.status = 'ativo';
          state.assinatura.plano = plano;
        }

        // Transição visual no modal
        if (el.pixConteudoContainer) el.pixConteudoContainer.classList.add('hidden');
        if (el.pixSucessoContainer) el.pixSucessoContainer.classList.remove('hidden');

        toast('🎉 Pagamento aprovado! Seu plano já está liberado!', 'success');

        setTimeout(() => {
          fecharModalPix();
          window.location.hash = '#/';
          atualizarBarraAssinatura();
          renderizarLinks();
        }, 2200);
      }
    } catch (err) {
      console.warn('Erro ao verificar status do PIX:', err);
    }
  }, 3000);
}

async function iniciarCheckoutPix() {
  if (!state.loja || !state.user) {
    toast('Faça login para continuar o pagamento', 'error');
    return;
  }

  const selInfo = DADOS_EXIBICAO_PLANOS[planoSelecionado];
  if (el.pixPlanoNome) el.pixPlanoNome.textContent = selInfo.nome;
  if (el.pixPlanoValor) {
    el.pixPlanoValor.textContent = billingCycle === 'monthly' ? selInfo.precoMensal : selInfo.obsAnual.split('cobrado')[0].trim();
  }

  // Prepara modal
  if (el.modalPagamentoPix) el.modalPagamentoPix.classList.remove('hidden');
  if (el.pixLoadingContainer) el.pixLoadingContainer.classList.remove('hidden');
  if (el.pixConteudoContainer) el.pixConteudoContainer.classList.add('hidden');
  if (el.pixSucessoContainer) el.pixSucessoContainer.classList.add('hidden');
  if (el.pixBtnCopiarTexto) el.pixBtnCopiarTexto.textContent = 'Copiar';

  try {
    const res = await fetch('/api/mp-criar-pagamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loja_id: state.loja.id,
        email: state.user.email,
        nome: state.loja.nome,
        plano: planoSelecionado,
        ciclo: billingCycle,
        metodo: 'pix',
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      fecharModalPix();
      toast(data.erro || 'Falha ao gerar PIX no Mercado Pago', 'error');
      return;
    }

    paymentIdAtual = data.payment_id;

    // Renderiza imagem do QR Code
    if (el.pixQrImage) {
      if (data.qr_code_base64 && data.qr_code_base64.length > 500) {
        el.pixQrImage.src = `data:image/png;base64,${data.qr_code_base64}`;
      } else if (data.qr_code) {
        // Fallback visual com alta resolução garantida
        el.pixQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.qr_code)}`;
      }
    }

    if (el.pixInputCopiaCola) {
      el.pixInputCopiaCola.value = data.qr_code || '';
    }

    if (el.pixBoxSimulacao) {
      if (data.simulado) {
        el.pixBoxSimulacao.classList.remove('hidden');
      } else {
        el.pixBoxSimulacao.classList.add('hidden');
      }
    }

    // Exibe conteúdo
    if (el.pixLoadingContainer) el.pixLoadingContainer.classList.add('hidden');
    if (el.pixConteudoContainer) el.pixConteudoContainer.classList.remove('hidden');

    // Inicia contadores
    iniciarTimerPix(data.expira_em);
    iniciarPollingPix(data.payment_id, planoSelecionado);

  } catch (err) {
    fecharModalPix();
    toast('Erro de conexão ao gerar pagamento: ' + err.message, 'error');
  }
}

async function iniciarCheckoutCartao() {
  if (!state.loja || !state.user) {
    toast('Faça login para continuar o pagamento', 'error');
    return;
  }

  const btnTextoOriginal = el.btnAssinarTexto?.textContent;
  if (el.btnAssinarTexto) el.btnAssinarTexto.textContent = 'Gerando Checkout Seguro...';

  try {
    const res = await fetch('/api/mp-criar-pagamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loja_id: state.loja.id,
        email: state.user.email,
        nome: state.loja.nome,
        plano: planoSelecionado,
        ciclo: billingCycle,
        metodo: 'cartao',
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      toast(data.erro || 'Falha ao iniciar pagamento com cartão', 'error');
      if (el.btnAssinarTexto) el.btnAssinarTexto.textContent = btnTextoOriginal;
      return;
    }

    if (data.init_point) {
      toast('Redirecionando para o ambiente seguro do Mercado Pago...', 'info');
      window.location.href = data.init_point;
    } else {
      toast('Checkout de cartão gerado com sucesso.', 'success');
    }
  } catch (err) {
    toast('Erro ao processar cartão: ' + err.message, 'error');
  } finally {
    if (el.btnAssinarTexto) el.btnAssinarTexto.textContent = btnTextoOriginal;
  }
}

if (el.btnBillingMonthly) el.btnBillingMonthly.addEventListener('click', () => setBilling('monthly'));
if (el.btnBillingYearly) el.btnBillingYearly.addEventListener('click', () => setBilling('yearly'));

// Alternância da forma de pagamento
document.querySelectorAll('input[name="forma_pagamento"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    metodoPagamento = e.target.value;
    document.querySelectorAll('.option-pagamento').forEach((lbl) => {
      if (lbl.dataset.metodo === metodoPagamento) {
        lbl.className = 'flex items-center gap-2.5 p-3 rounded-xl border-2 border-primary bg-primary-fixed/20 cursor-pointer transition-all option-pagamento';
      } else {
        lbl.className = 'flex items-center gap-2.5 p-3 rounded-xl border border-outline-variant hover:border-primary/50 cursor-pointer transition-all option-pagamento';
      }
    });
    atualizarTextoBotaoCheckout();
    renderizarCardBrick();
  });
});

// CHECKOUT TRANSPARENTE COM CARD PAYMENT BRICK (MERCADO PAGO)
let mpBrickController = null;
let mpPublicKey = localStorage.getItem('postlink_mp_public_key') || '';

async function obterMpPublicKey() {
  if (mpPublicKey) return mpPublicKey;
  try {
    const res = await fetch('/api/mp-config');
    const data = await res.json();
    if (data.publicKey) {
      mpPublicKey = data.publicKey;
      return mpPublicKey;
    }
  } catch {}
  return '';
}

async function renderizarCardBrick() {
  if (!el.boxCartaoTransparente) return;

  if (metodoPagamento !== 'cartao') {
    el.boxCartaoTransparente.classList.add('hidden');
    if (el.btnAssinarPro) el.btnAssinarPro.classList.remove('hidden');
    return;
  }

  // Ativa modo cartão transparente
  el.boxCartaoTransparente.classList.remove('hidden');
  if (el.btnAssinarPro) el.btnAssinarPro.classList.add('hidden');

  const pubKey = await obterMpPublicKey();
  if (!pubKey) {
    if (el.cardBrickLoading) {
      el.cardBrickLoading.innerHTML = `
        <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant text-center space-y-2">
          <span class="material-symbols-outlined text-2xl text-secondary">verified_user</span>
          <p class="text-xs font-semibold text-on-surface">Pagamento Seguro com Cartão</p>
          <p class="text-[11px] text-outline">Carregando gateway de pagamento...</p>
        </div>
      `;
    }
    return;
  }

  if (el.cardBrickLoading) el.cardBrickLoading.classList.remove('hidden');

  try {
    if (mpBrickController) {
      await mpBrickController.unmount();
      mpBrickController = null;
    }

    if (!window.MercadoPago) {
      throw new Error('SDK do Mercado Pago não carregou no navegador');
    }

    const mp = new window.MercadoPago(pubKey, { locale: 'pt-BR' });
    const bricksBuilder = mp.bricks();

    const valorNumerico = billingCycle === 'monthly'
      ? (planoSelecionado === 'starter' ? 14.90 : (planoSelecionado === 'pro' ? 29.90 : 69.90))
      : (planoSelecionado === 'starter' ? 118.80 : (planoSelecionado === 'pro' ? 262.80 : 598.80));

    // Limpa container antes de recriar
    const container = document.getElementById('cardPaymentBrick_container');
    if (container) container.innerHTML = '';

    mpBrickController = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', {
      initialization: {
        amount: Number(valorNumerico),
        payer: {
          email: state.user?.email || 'cliente@postlink.app',
        },
      },
      customization: {
        visual: {
          style: {
            theme: 'default',
          },
        },
        paymentMethods: {
          maxInstallments: 12,
        },
      },
      callbacks: {
        onReady: () => {
          if (el.cardBrickLoading) el.cardBrickLoading.classList.add('hidden');
        },
        onSubmit: async (cardFormData) => {
          try {
            toast('Processando pagamento seguro no seu cartão...', 'info');
            const res = await fetch('/api/mp-processar-cartao', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...cardFormData,
                loja_id: state.loja?.id,
                plano: planoSelecionado,
                ciclo: billingCycle,
              }),
            });

            const data = await res.json();

            if (data.aprovado) {
              toast('🎉 Pagamento aprovado! Seu plano já está liberado!', 'success');
              if (state.assinatura) {
                state.assinatura.status = 'ativo';
                state.assinatura.plano = planoSelecionado;
              }
              setTimeout(() => {
                window.location.hash = '#/';
                atualizarBarraAssinatura();
                renderizarLinks();
              }, 1500);
            } else {
              toast(data.detalhes || data.erro || 'Pagamento recusado pela operadora do cartão.', 'error');
            }
          } catch (err) {
            toast('Erro ao processar: ' + err.message, 'error');
          }
        },
        onError: (err) => {
          console.error('Erro Brick:', err);
          if (el.cardBrickLoading) el.cardBrickLoading.classList.add('hidden');
        },
      },
    });
  } catch (err) {
    if (el.cardBrickLoading) el.cardBrickLoading.classList.add('hidden');
    console.error('Erro ao inicializar Card Brick:', err);
  }
}

document.addEventListener('click', (e) => {
  const btnSel = e.target.closest('.btn-selecionar-plano, .card-plano');
  if (btnSel && btnSel.dataset.plano) {
    selecionarPlano(btnSel.dataset.plano);
    if (metodoPagamento === 'cartao') {
      renderizarCardBrick();
    }
  }
});

// Botão principal de checkout (PIX)
if (el.btnAssinarPro) {
  el.btnAssinarPro.addEventListener('click', () => {
    if (metodoPagamento === 'pix') {
      iniciarCheckoutPix();
    } else {
      renderizarCardBrick();
    }
  });
}

// Botão de ativação de 7 dias grátis (trial)
if (el.btnAtivarTrial) {
  el.btnAtivarTrial.addEventListener('click', () => {
    const selInfo = DADOS_EXIBICAO_PLANOS[planoSelecionado];
    toast(`Seu teste gratuito de 7 dias do ${selInfo.nome.split('(')[0].trim()} está ativado!`, 'success');
    if (state.assinatura) {
      state.assinatura.status = 'trial';
      state.assinatura.plano = planoSelecionado;
      state.assinatura.trial_ate = new Date(Date.now() + 7 * 86400000).toISOString();
    }
    setTimeout(() => {
      window.location.hash = '#/';
      atualizarBarraAssinatura();
      renderizarLinks();
    }, 1200);
  });
}

// Eventos do Modal PIX
if (el.pixBtnFechar) {
  el.pixBtnFechar.addEventListener('click', fecharModalPix);
}

if (el.pixBtnCopiar && el.pixInputCopiaCola) {
  el.pixBtnCopiar.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(el.pixInputCopiaCola.value);
      if (el.pixBtnCopiarTexto) el.pixBtnCopiarTexto.textContent = 'Copiado! ✓';
      toast('Código PIX copiado com sucesso! Abra o app do seu banco para pagar.', 'success');
      setTimeout(() => {
        if (el.pixBtnCopiarTexto) el.pixBtnCopiarTexto.textContent = 'Copiar';
      }, 3000);
    } catch {
      el.pixInputCopiaCola.select();
      document.execCommand('copy');
      toast('Código PIX copiado!', 'success');
    }
  });
}

if (el.pixBtnSimular) {
  el.pixBtnSimular.addEventListener('click', async () => {
    if (!paymentIdAtual) return;
    toast('Simulando aprovação de pagamento no Mercado Pago...', 'info');
    try {
      const url = `/api/mp-verificar-pagamento?simular_aprovacao=true&payment_id=${encodeURIComponent(paymentIdAtual)}&loja_id=${encodeURIComponent(state.loja?.id || '')}&plano=${encodeURIComponent(planoSelecionado)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.aprovado) {
        if (pollingPixInterval) clearInterval(pollingPixInterval);
        if (timerPixInterval) clearInterval(timerPixInterval);
        if (state.assinatura) {
          state.assinatura.status = 'ativo';
          state.assinatura.plano = planoSelecionado;
        }
        if (el.pixConteudoContainer) el.pixConteudoContainer.classList.add('hidden');
        if (el.pixSucessoContainer) el.pixSucessoContainer.classList.remove('hidden');
        toast('🎉 Pagamento aprovado! Seu plano já está liberado!', 'success');
        setTimeout(() => {
          fecharModalPix();
          window.location.hash = '#/';
          atualizarBarraAssinatura();
          renderizarLinks();
        }, 2000);
      }
    } catch (err) {
      toast('Erro ao simular: ' + err.message, 'error');
    }
  });
}

// CONTA
function prepararTelaConta() {
  if (el.contaEmail && state.user) el.contaEmail.textContent = state.user.email;
  if (el.contaLojaNome && state.loja) el.contaLojaNome.textContent = state.loja.nome;
  if (el.contaLojaSlug && state.loja) el.contaLojaSlug.textContent = `/${state.loja.slug}`;
  if (el.contaStatus && state.assinatura) {
    const p = obterPlanoAtual();
    el.contaStatus.textContent = `${p.nome} (${state.assinatura.status.toUpperCase()})`;
  }
}

if (el.btnSair) {
  el.btnSair.addEventListener('click', async () => {
    await sb.auth.signOut();
    window.location.href = '/login/';
  });
}

// MODAL LIMITE DE LINKS
if (el.modalLimiteBtnFechar) {
  el.modalLimiteBtnFechar.addEventListener('click', fecharModalLimiteLinks);
}
if (el.modalBtnUpgradePro) {
  el.modalBtnUpgradePro.addEventListener('click', fecharModalLimiteLinks);
}

// Intercepta qualquer tentativa de criar novo link quando o limite de links for atingido
document.addEventListener('click', (e) => {
  const linkCriar = e.target.closest('a[href="#/novo"]');
  if (linkCriar) {
    if (!podeCriarLink()) {
      e.preventDefault();
      mostrarModalLimiteLinks();
    }
  }
});

// Iniciar Aplicação
init();
