// public/painel/app.js - Lógica SPA do Painel do Lojista (PostLink com Stitch Theme)
import { getSupabase } from '/assets/js/supabase-config.js';
import { comprimirImagem, canvasParaBlob, aplicarMolduraInteligente, normalizarDestino, slugAleatorio } from '/assets/js/compressao.js';

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

  // Galeria de Fotos do Usuário
  fotosGaleria: [],
  fotoSelecionadaGaleria: null,
  filtroGaleria: 'todas', // 'todas' | 'em_uso' | 'nao_usadas'
  termoBuscaGaleria: '',
  fotoParaExcluir: null,
  fotoTemporariaModal: null,
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
  btnGaleriaTop: document.getElementById('btn-galeria-top'),
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

  // Galeria de Fotos
  viewGaleria: document.getElementById('view-galeria'),
  gridFotosGaleria: document.getElementById('grid-fotos-galeria'),
  galeriaVazia: document.getElementById('galeria-vazia'),
  contadorFotosGaleria: document.getElementById('contador-fotos-galeria'),
  badgeTotalGaleria: document.getElementById('badge-total-galeria'),
  inputBuscaGaleria: document.getElementById('input-busca-galeria'),
  inputUploadGaleriaDireto: document.getElementById('input-upload-galeria-direto'),
  btnAbrirModalGaleria: document.getElementById('btn-abrir-modal-galeria'),
  contagemGaleriaBadge: document.getElementById('contagem-galeria-badge'),
  bannerFotoSelecionadaGaleria: document.getElementById('banner-foto-selecionada-galeria'),
  thumbFotoSelecionada: document.getElementById('thumb-foto-selecionada'),
  nomeFotoSelecionada: document.getElementById('nome-foto-selecionada'),
  btnTrocarFotoGaleria: document.getElementById('btn-trocar-foto-galeria'),
  btnRemoverFotoGaleria: document.getElementById('btn-remover-foto-galeria'),
  wrapperDropzone: document.getElementById('wrapper-dropzone'),

  // Modais de Galeria
  modalGaleriaSelecao: document.getElementById('modal-galeria-selecao'),
  modalGaleriaBtnFechar: document.getElementById('modal-galeria-btn-fechar'),
  modalGaleriaBtnCancelar: document.getElementById('modal-galeria-btn-cancelar'),
  modalGaleriaBtnConfirmar: document.getElementById('modal-galeria-btn-confirmar'),
  modalGaleriaGrid: document.getElementById('modal-galeria-grid'),
  modalGaleriaBusca: document.getElementById('modal-galeria-busca'),
  modalGaleriaSelecionadaInfo: document.getElementById('modal-galeria-selecionada-info'),
  inputUploadModalGaleria: document.getElementById('input-upload-modal-galeria'),

  // Modal Confirmação de Exclusão Segura
  modalConfirmarExclusaoFoto: document.getElementById('modal-confirmar-exclusao-foto'),
  modalExclusaoBtnCancelar: document.getElementById('modal-exclusao-btn-cancelar'),
  modalExclusaoBtnConfirmar: document.getElementById('modal-exclusao-btn-confirmar'),
  modalExclusaoThumb: document.getElementById('modal-exclusao-thumb'),
  modalExclusaoNome: document.getElementById('modal-exclusao-nome'),
  modalExclusaoStatus: document.getElementById('modal-exclusao-status'),
  modalExclusaoAvisoLinks: document.getElementById('modal-exclusao-aviso-links'),
  modalExclusaoAvisoTitulo: document.getElementById('modal-exclusao-aviso-titulo'),
  modalExclusaoListaLinks: document.getElementById('modal-exclusao-lista-links'),

  // Editor & Recorte de Imagens (Cropper.js)
  modalEditorRecorte: document.getElementById('modal-editor-recorte'),
  modalEditorTitulo: document.getElementById('modal-editor-titulo'),
  modalEditorBtnFechar: document.getElementById('modal-editor-btn-fechar'),
  modalEditorBtnCancelar: document.getElementById('modal-editor-btn-cancelar'),
  modalEditorBtnConfirmar: document.getElementById('modal-editor-btn-confirmar'),
  editorAspectChips: document.getElementById('editor-aspect-chips'),
  editorCheckMoldura: document.getElementById('editor-check-moldura'),
  editorImagemAlvo: document.getElementById('editor-imagem-alvo'),
  editorSliderZoom: document.getElementById('editor-slider-zoom'),
  editorBtnZoomIn: document.getElementById('editor-btn-zoom-in'),
  editorBtnZoomOut: document.getElementById('editor-btn-zoom-out'),
  editorBtnRotateLeft: document.getElementById('editor-btn-rotate-left'),
  editorBtnRotateRight: document.getElementById('editor-btn-rotate-right'),
  editorBtnFlipH: document.getElementById('editor-btn-flip-h'),
  editorBtnReset: document.getElementById('editor-btn-reset'),
  editorBoxSubstituicao: document.getElementById('editor-box-substituicao'),
  editorCheckSubstituirOriginal: document.getElementById('editor-check-substituir-original'),
  btnRecortarFotoSelecionada: document.getElementById('btn-recortar-foto-selecionada'),
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
  // O teste grátis é único: 7 dias com 1 link ativo e até 5 alterações
  if (state.assinatura.status === 'trial') {
    const trialAte = state.assinatura.trial_ate ? new Date(state.assinatura.trial_ate) : null;
    if (trialAte && trialAte > new Date()) {
      return {
        ...PLANOS_CONFIG.free,
        id: 'free',
        nome: 'Teste Grátis (7 dias)',
        maxLinks: 1,
        maxEdicoes: 5,
        isTrial: true
      };
    }
  }

  // Se tiver assinatura ativa paga
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
    el.btnNovoLinkTop.classList.remove('hidden');
  }
  if (el.btnGaleriaTop) {
    el.btnGaleriaTop.style.display = 'inline-flex';
    el.btnGaleriaTop.classList.remove('hidden');
  }

  const { data: assinaturas } = await sb
    .from('assinaturas')
    .select('*')
    .eq('loja_id', state.loja.id);

  if (assinaturas && assinaturas.length > 0) {
    state.assinatura = assinaturas[0];
    atualizarBarraAssinatura();
  }

  // Verifica se o usuário veio de um fluxo de compra direta de plano
  try {
    const pendenteRaw = localStorage.getItem('postlink_checkout_pendente');
    if (pendenteRaw) {
      const pendente = JSON.parse(pendenteRaw);
      localStorage.removeItem('postlink_checkout_pendente');
      if (pendente && pendente.plano) {
        planoSelecionado = pendente.plano;
        billingCycle = pendente.ciclo === 'anual' ? 'yearly' : 'monthly';
        window.location.hash = '#/plano';
        setTimeout(() => {
          toast(`Plano ${DADOS_EXIBICAO_PLANOS[planoSelecionado]?.nome || ''} pré-selecionado! Escolha a forma de pagamento abaixo.`, 'info');
        }, 300);
      }
    }
  } catch(e) {}

  window.addEventListener('hashchange', router);
  router();
}

function atualizarBarraAssinatura() {
  if (!state.assinatura || !el.textoTrial) return;
  const p = obterPlanoAtual();
  const trialAte = state.assinatura.trial_ate ? new Date(state.assinatura.trial_ate) : null;
  const hoje = new Date();
  const diffDias = trialAte ? Math.ceil((trialAte - hoje) / (1000 * 60 * 60 * 24)) : 0;
  const subtextoEl = document.getElementById('subtexto-banner-trial');

  if (state.assinatura.status === 'trial') {
    if (diffDias > 0) {
      el.textoTrial.innerHTML = `Restam <strong>${diffDias} dias</strong> de teste gratuito (1 link ativo · 5 trocas)`;
      if (el.navStatusTexto) el.navStatusTexto.textContent = `Trial (${diffDias}d)`;
      if (subtextoEl) {
        subtextoEl.textContent = 'Teste o PostLink no WhatsApp com 1 link ativo. Para links e alterações ilimitadas, assine um plano.';
      }
    } else {
      el.textoTrial.innerHTML = `Período de teste expirado`;
      if (el.navStatusTexto) el.navStatusTexto.textContent = 'Expirado';
      if (subtextoEl) {
        subtextoEl.textContent = 'Seu teste de 7 dias expirou. Assine um plano para continuar gerando links profissionais.';
      }
    }
  } else if (state.assinatura.status === 'ativo') {
    el.textoTrial.innerHTML = `Assinatura ${p.nome} ativa e regular`;
    if (el.navStatusTexto) el.navStatusTexto.textContent = p.nome;
    if (subtextoEl) {
      subtextoEl.textContent = 'Sua assinatura está ativa e você tem acesso a todos os recursos contratados.';
    }
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
  } else if (hash === '#/galeria') {
    mostrarView('galeria');
    await carregarGaleriaFotos();
  } else if (hash === '#/plano') {
    renderizarTelaPlanos();
    mostrarView('plano');
  } else if (hash === '#/conta') {
    prepararTelaConta();
    mostrarView('conta');
  }
}

function mostrarView(nome) {
  const views = [
    { name: 'loading', el: el.viewLoading },
    { name: 'onboarding', el: el.viewOnboarding },
    { name: 'lista', el: el.viewLista },
    { name: 'galeria', el: el.viewGaleria },
    { name: 'form', el: el.viewFormLink },
    { name: 'plano', el: el.viewPlano },
    { name: 'conta', el: el.viewConta },
  ];

  views.forEach((v) => {
    if (!v.el) return;
    if (v.name === nome) {
      v.el.classList.remove('hidden');
      v.el.style.display = 'block';
    } else {
      v.el.classList.add('hidden');
      v.el.style.display = 'none';
    }
  });

  // Atualiza destaque na barra inferior mobile
  document.querySelectorAll('.nav-bottom-item').forEach((item) => {
    const href = item.getAttribute('href');
    const isAtivo = (nome === 'lista' && href === '#/') ||
                    (nome === 'galeria' && href === '#/galeria') ||
                    (nome === 'form' && href === '#/novo') ||
                    (nome === 'plano' && href === '#/plano') ||
                    (nome === 'conta' && href === '#/conta');
    if (isAtivo) {
      item.classList.add('text-primary', 'font-bold');
      item.classList.remove('text-on-surface-variant');
    } else {
      item.classList.remove('text-primary', 'font-bold');
      item.classList.add('text-on-surface-variant');
    }
  });

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
      toast('Loja cadastrada com sucesso!', 'success');
      await carregarDadosLojaEAssinatura();
    } catch (err) {
      toast('Erro ao cadastrar loja: ' + err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Concluir Cadastro da Loja';
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
  atualizarContagemGaleria();

  // Busca estatísticas detalhadas de cliques, dispositivos e origens
  try {
    const { data: stats, error: errStats } = await sb.rpc('estatisticas_detalhadas_links', { p_dias: 30 });
    state.estatisticas = {};
    if (!errStats && stats) {
      stats.forEach((s) => {
        state.estatisticas[s.link_id] = s;
      });
    } else {
      const { data: statsOld } = await sb.rpc('estatisticas_links', { p_dias: 30 });
      if (statsOld) {
        statsOld.forEach((s) => {
          state.estatisticas[s.link_id] = s;
        });
      }
    }
  } catch (_) {}

  atualizarMetricasBento();
  aplicarFiltrosEBusca();
}

function atualizarMetricasBento() {
  let totalCliques = 0;
  let recentesCliques = 0;
  let linksAtivos = 0;
  let mobileCliques = 0;
  let desktopCliques = 0;
  let waCliques = 0;
  let igCliques = 0;
  let fbCliques = 0;
  let outrosCliques = 0;

  state.links.forEach((link) => {
    if (link.ativo) linksAtivos += 1;
    const st = state.estatisticas[link.id];
    if (st) {
      totalCliques += Number(st.total || 0);
      recentesCliques += Number(st.recentes || 0);
      mobileCliques += Number(st.mobile || 0);
      desktopCliques += Number(st.desktop || 0);
      waCliques += Number(st.whatsapp || 0);
      igCliques += Number(st.instagram || 0);
      fbCliques += Number(st.facebook || 0);
      outrosCliques += Number(st.outros || 0);
    }
  });

  if (el.metricTotalCliques) el.metricTotalCliques.textContent = totalCliques.toLocaleString('pt-BR');
  if (el.metricCliquesMes) el.metricCliquesMes.textContent = recentesCliques.toLocaleString('pt-BR');
  if (el.metricTotalLinks) el.metricTotalLinks.textContent = state.links.length;
  if (el.metricLinksAtivos) el.metricLinksAtivos.textContent = `${linksAtivos} ativos`;

  // Atualização do Painel de Inteligência de Tráfego
  const boxInteligencia = document.getElementById('box-inteligencia-metricas');
  if (boxInteligencia) {
    const somaDisp = mobileCliques + desktopCliques || 1;
    const pctMob = totalCliques > 0 ? Math.round((mobileCliques / somaDisp) * 100) : 0;
    const pctDesk = totalCliques > 0 ? (100 - pctMob) : 0;

    const barMobile = document.getElementById('bar-dispositivo-mobile');
    const barDesktop = document.getElementById('bar-dispositivo-desktop');
    if (barMobile) barMobile.style.width = `${totalCliques > 0 ? pctMob : 50}%`;
    if (barDesktop) barDesktop.style.width = `${totalCliques > 0 ? pctDesk : 50}%`;

    const lblCountMobile = document.getElementById('label-count-mobile');
    const lblPctMobile = document.getElementById('label-pct-mobile');
    const lblCountDesktop = document.getElementById('label-count-desktop');
    const lblPctDesktop = document.getElementById('label-pct-desktop');

    if (lblCountMobile) lblCountMobile.textContent = mobileCliques.toLocaleString('pt-BR');
    if (lblPctMobile) lblPctMobile.textContent = `${pctMob}%`;
    if (lblCountDesktop) lblCountDesktop.textContent = desktopCliques.toLocaleString('pt-BR');
    if (lblPctDesktop) lblPctDesktop.textContent = `${pctDesk}%`;

    // Canais e Origens
    const somaOrigens = totalCliques || 1;
    const pctWa = totalCliques > 0 ? Math.round((waCliques / somaOrigens) * 100) : 0;
    const pctIg = totalCliques > 0 ? Math.round((igCliques / somaOrigens) * 100) : 0;
    const pctFb = totalCliques > 0 ? Math.round((fbCliques / somaOrigens) * 100) : 0;
    const pctOutros = totalCliques > 0 ? Math.max(0, 100 - (pctWa + pctIg + pctFb)) : 0;

    const lblCountWa = document.getElementById('label-count-wa');
    const lblPctWa = document.getElementById('label-pct-wa');
    const lblCountIg = document.getElementById('label-count-ig');
    const lblPctIg = document.getElementById('label-pct-ig');
    const lblCountFb = document.getElementById('label-count-fb');
    const lblPctFb = document.getElementById('label-pct-fb');
    const lblCountOutros = document.getElementById('label-count-outros');
    const lblPctOutros = document.getElementById('label-pct-outros');

    if (lblCountWa) lblCountWa.textContent = waCliques.toLocaleString('pt-BR');
    if (lblPctWa) lblPctWa.textContent = `${pctWa}%`;
    if (lblCountIg) lblCountIg.textContent = igCliques.toLocaleString('pt-BR');
    if (lblPctIg) lblPctIg.textContent = `${pctIg}%`;
    if (lblCountFb) lblCountFb.textContent = fbCliques.toLocaleString('pt-BR');
    if (lblPctFb) lblPctFb.textContent = `${pctFb}%`;
    if (lblCountOutros) lblCountOutros.textContent = outrosCliques.toLocaleString('pt-BR');
    if (lblPctOutros) lblPctOutros.textContent = `${pctOutros}%`;
  }
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

    const totClicks = Number(st.total || 0);
    let detalheStatsHtml = '';
    if (totClicks > 0) {
      const somaD = (Number(st.mobile || 0) + Number(st.desktop || 0)) || 1;
      const pctM = Math.round((Number(st.mobile || 0) / somaD) * 100);
      const waCount = Number(st.whatsapp || 0);
      const igCount = Number(st.instagram || 0);
      const topNome = waCount >= igCount ? 'WhatsApp' : 'Instagram';
      const topCount = Math.max(waCount, igCount);
      const pctCanal = Math.round((topCount / totClicks) * 100);

      detalheStatsHtml = `
        <div class="grid grid-cols-2 gap-1.5 pt-1.5 mt-1.5 text-[11px] text-on-surface-variant border-t border-outline-variant/30">
          <div class="flex items-center gap-1 truncate" title="${st.mobile || 0} cliques de celular">
            <span class="material-symbols-outlined text-xs text-primary">smartphone</span>
            <span>${pctM}% Celular</span>
          </div>
          <div class="flex items-center gap-1 justify-end truncate" title="Canal com mais acessos">
            <span class="material-symbols-outlined text-xs ${topNome === 'WhatsApp' ? 'text-secondary-dark' : 'text-[#E1306C]'}">${topNome === 'WhatsApp' ? 'chat' : 'photo_camera'}</span>
            <span>${pctCanal}% ${topNome}</span>
          </div>
        </div>
      `;
    }

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

        <div class="bg-surface-container-low rounded-lg p-2 mb-3 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-outline font-medium">Cliques:</span>
            <div class="flex items-center gap-1 font-mono font-bold text-on-surface text-xs">
              <span class="text-secondary-dark">${st.recentes || 0} (30d)</span>
              <span class="text-outline">/</span>
              <span>${totClicks} total</span>
            </div>
          </div>
          ${detalheStatsHtml}
        </div>
      </div>

      <div class="space-y-1.5 pt-1 border-t border-surface-container-high/60">
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" class="btn-copiar bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all" data-url="${fullUrl}">
            <span class="material-symbols-outlined text-sm">content_copy</span> Copiar
          </button>
          <a href="https://wa.me/?text=${encodeURIComponent(fullUrl + '?src=wa')}" target="_blank" class="bg-secondary hover:bg-secondary-dark text-white font-bold text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all">
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

  if (state.fotoSelecionadaGaleria) {
    aplicarFotoGaleriaNoFormulario(state.fotoSelecionadaGaleria);
  } else {
    if (el.fname) el.fname.textContent = 'Fazer upload de nova foto ou arrastar aqui';
    if (el.bannerFotoSelecionadaGaleria) el.bannerFotoSelecionadaGaleria.classList.add('hidden');
    if (el.infoArquivo) el.infoArquivo.classList.add('hidden');
    if (el.ph) el.ph.style.display = 'flex';
    if (el.im) {
      el.im.classList.add('hidden');
      el.im.src = '';
    }
  }

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
  atualizarContagemGaleria();

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

  // Foto existente vinculada ao link
  state.fotoSelecionadaGaleria = link.imagem_path;
  aplicarFotoGaleriaNoFormulario(link.imagem_path, true);

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

  // Limpa seleção da galeria pois o lojista enviou um arquivo novo local
  state.fotoSelecionadaGaleria = null;
  if (el.bannerFotoSelecionadaGaleria) el.bannerFotoSelecionadaGaleria.classList.add('hidden');

  if (el.eImg) el.eImg.textContent = '';
  if (el.fname) el.fname.textContent = file.name;

  // Abre editor de recorte com o arquivo selecionado para ajuste de proporção e enquadramento
  abrirEditorRecorte({
    arquivoOuUrl: file,
    modo: 'formulario',
    aspectInicial: 1.912,
  });
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

    if (!state.linkEditando && !state.arquivoBlob && !state.fotoSelecionadaGaleria) {
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
        } else if (state.fotoSelecionadaGaleria) {
          caminhoImagem = state.fotoSelecionadaGaleria;
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
        carregarGaleriaFotos(true);
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
        let caminhoImagem = '';

        if (state.fotoSelecionadaGaleria) {
          // Reutiliza imagem salva da galeria (zero upload redundante!)
          caminhoImagem = state.fotoSelecionadaGaleria;
        } else {
          caminhoImagem = `${state.user.id}/${linkId}-v${versao}.jpg`;
          const { error: errUpload } = await sb.storage
            .from('banners')
            .upload(caminhoImagem, state.arquivoBlob, { contentType: 'image/jpeg' });

          if (errUpload) throw errUpload;
        }

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

          if (!state.fotoSelecionadaGaleria) {
            await sb.storage.from('banners').remove([caminhoImagem]);
          }
          throw errInsert;
        }

        if (!sucesso) {
          if (!state.fotoSelecionadaGaleria) {
            await sb.storage.from('banners').remove([caminhoImagem]);
          }
          throw new Error('Não foi possível gerar um apelido livre para o link. Tente outro.');
        }

        const linkPronto = `${window.location.origin}/${state.loja.slug}/${slugFinal}`;
        exibirResultadoCriado(linkPronto);
        carregarGaleriaFotos(true);
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
  fundador: {
    nome: 'Plano Fundador VIP (Pré-Venda)',
    precoMensal: 'R$ 19,90',
    periodoMensal: '/mês',
    obsMensal: 'Preço vitalício garantido',
    precoAnual: 'R$ 16,50',
    periodoAnual: '/mês',
    obsAnual: 'R$ 198,00 cobrado anual',
  },
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

// ALTERAR SENHA NO PAINEL
const btnToggleTrocarSenha = document.getElementById('btn-toggle-trocar-senha-painel');
const formTrocarSenhaPainel = document.getElementById('form-trocar-senha-painel');
const btnCancelarTrocarSenha = document.getElementById('btn-cancelar-trocar-senha-painel');
const painelNovaSenha = document.getElementById('painel-nova-senha');
const painelNovaSenhaConfirm = document.getElementById('painel-nova-senha-confirm');
const btnSubmitTrocarSenha = document.getElementById('btn-submit-trocar-senha-painel');

if (btnToggleTrocarSenha && formTrocarSenhaPainel) {
  btnToggleTrocarSenha.addEventListener('click', () => {
    formTrocarSenhaPainel.classList.toggle('hidden');
    if (!formTrocarSenhaPainel.classList.contains('hidden') && painelNovaSenha) {
      painelNovaSenha.focus();
    }
  });
}

if (btnCancelarTrocarSenha && formTrocarSenhaPainel) {
  btnCancelarTrocarSenha.addEventListener('click', () => {
    formTrocarSenhaPainel.classList.add('hidden');
    if (painelNovaSenha) painelNovaSenha.value = '';
    if (painelNovaSenhaConfirm) painelNovaSenhaConfirm.value = '';
  });
}

if (formTrocarSenhaPainel) {
  formTrocarSenhaPainel.addEventListener('submit', async (e) => {
    e.preventDefault();
    const s1 = painelNovaSenha.value;
    const s2 = painelNovaSenhaConfirm.value;

    if (!s1 || s1.length < 6) {
      toast('A nova senha deve ter no mínimo 6 caracteres.', 'error');
      painelNovaSenha.focus();
      return;
    }
    if (s1 !== s2) {
      toast('As senhas digitadas não coincidem.', 'error');
      painelNovaSenhaConfirm.focus();
      return;
    }

    btnSubmitTrocarSenha.disabled = true;
    btnSubmitTrocarSenha.innerHTML = '<div class="spinner w-3.5 h-3.5 border-white border-t-transparent"></div> Salvando…';

    try {
      const { error } = await sb.auth.updateUser({ password: s1 });
      if (error) throw error;
      toast('Senha alterada com sucesso!', 'success');
      formTrocarSenhaPainel.classList.add('hidden');
      painelNovaSenha.value = '';
      painelNovaSenhaConfirm.value = '';
    } catch (err) {
      toast('Erro ao alterar senha: ' + (err.message || 'Tente novamente.'), 'error');
    } finally {
      btnSubmitTrocarSenha.disabled = false;
      btnSubmitTrocarSenha.innerHTML = '<span>Salvar Senha</span>';
    }
  });
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

// ==========================================
// MÓDULO: GALERIA DE FOTOS DO LOJISTA
// ==========================================

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Auxiliares de Persistência Local da Galeria (Garante resiliência independente de RLS)
function obterFotosCacheLocal(userId) {
  try {
    const raw = localStorage.getItem(`postlink_galeria_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function salvarFotosCacheLocal(userId, fotos) {
  try {
    const limpas = (fotos || []).map((f) => ({
      caminho: f.caminho,
      nome: f.nome,
      urlPublica: f.urlPublica,
      criadoEm: f.criadoEm,
      tamanho: f.tamanho,
    }));
    localStorage.setItem(`postlink_galeria_${userId}`, JSON.stringify(limpas));
  } catch (_) {}
}

async function carregarGaleriaFotos(forcar = false) {
  if (!state.user) return;

  // Garante que a lista de links da loja esteja atualizada para mapeamento
  if (state.loja && (!state.links || state.links.length === 0 || forcar)) {
    try {
      const { data: links } = await sb
        .from('links')
        .select('*')
        .eq('loja_id', state.loja.id);
      if (links) state.links = links;
    } catch (_) {}
  }

  // Mapeia links ativos/pausados que utilizam cada imagem
  const mapLinksPorImagem = {};
  (state.links || []).forEach((link) => {
    if (link.imagem_path) {
      if (!mapLinksPorImagem[link.imagem_path]) {
        mapLinksPorImagem[link.imagem_path] = [];
      }
      mapLinksPorImagem[link.imagem_path].push(link);
    }
  });

  const fotosMap = new Map();

  // 1. Carrega fotos salvas no cache local do usuário
  const fotosLocais = obterFotosCacheLocal(state.user.id);
  fotosLocais.forEach((f) => {
    if (f.caminho) {
      fotosMap.set(f.caminho, {
        ...f,
        linksUsando: mapLinksPorImagem[f.caminho] || [],
      });
    }
  });

  // 2. Tenta listar objetos no bucket 'banners' do storage
  try {
    const { data: files, error } = await sb.storage.from('banners').list(state.user.id, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    });
    if (!error && Array.isArray(files)) {
      files.forEach((file) => {
        if (!file.name || file.name.startsWith('.')) return;
        const caminho = `${state.user.id}/${file.name}`;
        const { data: { publicUrl } } = sb.storage.from('banners').getPublicUrl(caminho);
        fotosMap.set(caminho, {
          caminho,
          nome: file.name,
          urlPublica: publicUrl,
          criadoEm: file.created_at || new Date().toISOString(),
          tamanho: file.metadata?.size || null,
          linksUsando: mapLinksPorImagem[caminho] || [],
        });
      });
    }
  } catch (err) {
    console.warn('Listagem storage:', err);
  }

  // 3. Garante que qualquer imagem usada nos links cadastrados esteja presente
  (state.links || []).forEach((link) => {
    if (link.imagem_path && !fotosMap.has(link.imagem_path)) {
      const caminho = link.imagem_path;
      const { data: { publicUrl } } = sb.storage.from('banners').getPublicUrl(caminho);
      const nome = caminho.split('/').pop() || 'banner.jpg';
      fotosMap.set(caminho, {
        caminho,
        nome,
        urlPublica: `${publicUrl}?v=${link.versao || 1}`,
        criadoEm: link.criado_em,
        tamanho: null,
        linksUsando: mapLinksPorImagem[caminho] || [],
      });
    }
  });

  // Ordena da mais recente para a mais antiga
  state.fotosGaleria = Array.from(fotosMap.values()).sort((a, b) => {
    const dataA = new Date(a.criadoEm || 0).getTime();
    const dataB = new Date(b.criadoEm || 0).getTime();
    return dataB - dataA;
  });

  salvarFotosCacheLocal(state.user.id, state.fotosGaleria);

  atualizarContagemGaleria();
  renderizarGridGaleria();
  renderizarModalGaleria();
}

function atualizarContagemGaleria() {
  const total = (state.fotosGaleria || []).length;
  if (el.contagemGaleriaBadge) el.contagemGaleriaBadge.textContent = total;
  if (el.badgeTotalGaleria) el.badgeTotalGaleria.textContent = `${total} ${total === 1 ? 'foto' : 'fotos'}`;
}

function renderizarGridGaleria() {
  if (!el.gridFotosGaleria) return;

  let filtradas = [...state.fotosGaleria];

  // Filtro por categoria
  if (state.filtroGaleria === 'em_uso') {
    filtradas = filtradas.filter((f) => f.linksUsando.length > 0);
  } else if (state.filtroGaleria === 'nao_usadas') {
    filtradas = filtradas.filter((f) => f.linksUsando.length === 0);
  }

  // Filtro por busca textual
  if (state.termoBuscaGaleria) {
    const termo = state.termoBuscaGaleria.toLowerCase();
    filtradas = filtradas.filter((f) => {
      const nomeMatch = f.nome.toLowerCase().includes(termo);
      const linkMatch = f.linksUsando.some((l) =>
        (l.titulo && l.titulo.toLowerCase().includes(termo)) ||
        (l.slug && l.slug.toLowerCase().includes(termo))
      );
      return nomeMatch || linkMatch;
    });
  }

  if (el.contadorFotosGaleria) {
    el.contadorFotosGaleria.textContent = `Mostrando ${filtradas.length} de ${state.fotosGaleria.length} ${state.fotosGaleria.length === 1 ? 'foto' : 'fotos'}`;
  }

  if (filtradas.length === 0) {
    el.gridFotosGaleria.innerHTML = '';
    if (el.galeriaVazia) {
      el.galeriaVazia.classList.remove('hidden');
      el.galeriaVazia.style.display = 'block';
    }
    return;
  }

  if (el.galeriaVazia) {
    el.galeriaVazia.classList.add('hidden');
    el.galeriaVazia.style.display = 'none';
  }

  el.gridFotosGaleria.innerHTML = filtradas.map((foto) => {
    const qtdLinks = foto.linksUsando.length;
    const emUso = qtdLinks > 0;
    const dataFormatada = foto.criadoEm ? new Date(foto.criadoEm).toLocaleDateString('pt-BR') : '';

    const badgeUsoHtml = emUso
      ? `<span class="inline-flex items-center gap-1 bg-secondary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          <span>Em uso (${qtdLinks})</span>
        </span>`
      : `<span class="inline-flex items-center gap-1 bg-black/60 text-white/90 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xs">
          Disponível
        </span>`;

    let linksListHtml = '';
    if (emUso) {
      linksListHtml = `
        <div class="mt-2.5 pt-2 border-t border-outline-variant/30 text-xs">
          <span class="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">Vinculada a:</span>
          <div class="space-y-1">
            ${foto.linksUsando.slice(0, 3).map((l) => `
              <a href="#/editar/${l.id}" class="flex items-center justify-between text-xs text-primary hover:underline bg-surface-container-low px-2 py-1 rounded-md transition-colors" title="Editar link">
                <span class="truncate max-w-[170px] font-semibold">${escapeHtml(l.titulo || l.slug)}</span>
                <span class="material-symbols-outlined text-sm text-outline">edit</span>
              </a>
            `).join('')}
            ${qtdLinks > 3 ? `<span class="text-[11px] text-outline block text-center pt-0.5">+ mais ${qtdLinks - 3} links</span>` : ''}
          </div>
        </div>
      `;
    }

    return `
      <div class="bg-surface-container-lowest border border-outline-variant/60 hover:border-primary/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
        <!-- Visualizador 1.91:1 Estrito PostLink HD -->
        <div class="relative aspect-[1.91/1] bg-surface-container-high overflow-hidden">
          <img src="${foto.urlPublica}" alt="${escapeHtml(foto.nome)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          <div class="absolute top-2.5 left-2.5">
            ${badgeUsoHtml}
          </div>
          <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <button type="button" class="btn-recortar-foto-card w-7 h-7 rounded-full bg-black/50 hover:bg-primary text-white flex items-center justify-center transition-colors backdrop-blur-xs shadow-xs" data-caminho="${foto.caminho}" title="Recortar e ajustar proporção">
              <span class="material-symbols-outlined text-sm">crop</span>
            </button>
            <button type="button" class="btn-excluir-foto w-7 h-7 rounded-full bg-black/50 hover:bg-error text-white flex items-center justify-center transition-colors backdrop-blur-xs shadow-xs" data-caminho="${foto.caminho}" title="Excluir foto">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>

        <!-- Conteúdo do Card -->
        <div class="p-3.5 flex flex-col justify-between flex-1">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-on-surface truncate" title="${escapeHtml(foto.nome)}">${escapeHtml(foto.nome)}</span>
              ${dataFormatada ? `<span class="text-[11px] text-outline shrink-0 font-medium">${dataFormatada}</span>` : ''}
            </div>
            ${linksListHtml}
          </div>

          <!-- Ação do Card -->
          <div class="mt-3 pt-2.5 border-t border-outline-variant/40 flex items-center justify-between gap-2">
            <button type="button" class="btn-usar-em-novo-link w-full bg-primary hover:bg-primary-container text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95" data-caminho="${foto.caminho}">
              <span class="material-symbols-outlined text-sm">add_link</span>
              <span>Usar em Novo Link</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function abrirModalSelecaoGaleria() {
  state.fotoTemporariaModal = state.fotoSelecionadaGaleria;
  if (el.modalGaleriaSelecao) {
    el.modalGaleriaSelecao.classList.remove('hidden');
    el.modalGaleriaSelecao.style.display = 'flex';
  }
  if (el.modalGaleriaBusca) el.modalGaleriaBusca.value = '';
  renderizarModalGaleria();
  atualizarBotaoConfirmarModal();
}

function fecharModalSelecaoGaleria() {
  if (el.modalGaleriaSelecao) {
    el.modalGaleriaSelecao.classList.add('hidden');
    el.modalGaleriaSelecao.style.display = 'none';
  }
}

function renderizarModalGaleria() {
  if (!el.modalGaleriaGrid) return;

  const termo = (el.modalGaleriaBusca ? el.modalGaleriaBusca.value.toLowerCase().trim() : '');
  let fotos = [...state.fotosGaleria];

  if (termo) {
    fotos = fotos.filter((f) => {
      const matchNome = f.nome.toLowerCase().includes(termo);
      const matchLink = f.linksUsando.some((l) =>
        (l.titulo && l.titulo.toLowerCase().includes(termo)) ||
        (l.slug && l.slug.toLowerCase().includes(termo))
      );
      return matchNome || matchLink;
    });
  }

  if (fotos.length === 0) {
    el.modalGaleriaGrid.innerHTML = `
      <div class="col-span-full py-12 text-center text-xs text-outline space-y-2">
        <span class="material-symbols-outlined text-3xl text-outline">photo_library</span>
        <p class="font-medium">Nenhuma foto encontrada na sua galeria.</p>
        <p class="text-[11px]">Faça upload pelo botão acima para salvar novas fotos.</p>
      </div>
    `;
    return;
  }

  el.modalGaleriaGrid.innerHTML = fotos.map((foto) => {
    const isSelecionada = state.fotoTemporariaModal === foto.caminho;
    const qtdLinks = foto.linksUsando.length;

    return `
      <div class="modal-foto-item cursor-pointer rounded-xl overflow-hidden border-2 transition-all group relative ${isSelecionada ? 'border-primary ring-4 ring-primary/20 shadow-md' : 'border-outline-variant/60 hover:border-primary/50'}" data-caminho="${foto.caminho}">
        <div class="aspect-[1.91/1] bg-surface-container-high relative overflow-hidden">
          <img src="${foto.urlPublica}" alt="${escapeHtml(foto.nome)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200">
          ${isSelecionada ? `
            <div class="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <span class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                <span class="material-symbols-outlined text-lg font-bold">check</span>
              </span>
            </div>
          ` : ''}
          ${qtdLinks > 0 ? `
            <span class="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-xs">
              ${qtdLinks} ${qtdLinks === 1 ? 'link' : 'links'}
            </span>
          ` : ''}
        </div>
        <div class="p-2 bg-surface-container-lowest flex items-center justify-between text-xs">
          <span class="truncate font-semibold text-on-surface" title="${escapeHtml(foto.nome)}">${escapeHtml(foto.nome)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function atualizarBotaoConfirmarModal() {
  if (!el.modalGaleriaBtnConfirmar) return;
  const selecionada = state.fotosGaleria.find((f) => f.caminho === state.fotoTemporariaModal);
  if (selecionada) {
    el.modalGaleriaBtnConfirmar.disabled = false;
    if (el.modalGaleriaSelecionadaInfo) {
      el.modalGaleriaSelecionadaInfo.textContent = `Selecionada: ${selecionada.nome}`;
    }
  } else {
    el.modalGaleriaBtnConfirmar.disabled = true;
    if (el.modalGaleriaSelecionadaInfo) {
      el.modalGaleriaSelecionadaInfo.textContent = 'Nenhuma foto selecionada';
    }
  }
}

function aplicarFotoGaleriaNoFormulario(caminhoImagem, isEdicao = false) {
  state.fotoSelecionadaGaleria = caminhoImagem;
  state.arquivoBlob = null;

  let foto = state.fotosGaleria.find((f) => f.caminho === caminhoImagem);
  let publicUrl = foto ? foto.urlPublica : null;

  if (!publicUrl) {
    const { data: { publicUrl: urlGerada } } = sb.storage.from('banners').getPublicUrl(caminhoImagem);
    publicUrl = urlGerada;
  }

  const nomeArquivo = foto ? foto.nome : (caminhoImagem.split('/').pop() || 'banner.jpg');

  if (el.thumbFotoSelecionada) el.thumbFotoSelecionada.src = publicUrl;
  if (el.nomeFotoSelecionada) el.nomeFotoSelecionada.textContent = nomeArquivo;
  if (el.bannerFotoSelecionadaGaleria) el.bannerFotoSelecionadaGaleria.classList.remove('hidden');

  if (el.fname) el.fname.textContent = 'Fazer upload de outra foto do dispositivo';
  if (el.infoArquivo) el.infoArquivo.classList.add('hidden');
  if (el.eImg) el.eImg.textContent = '';

  if (el.im) {
    el.im.src = publicUrl;
    el.im.classList.remove('hidden');
  }
  if (el.ph) el.ph.style.display = 'none';

  atualizarLivePreview();
}

function removerFotoGaleriaDoFormulario() {
  state.fotoSelecionadaGaleria = null;
  state.arquivoBlob = null;

  if (el.bannerFotoSelecionadaGaleria) el.bannerFotoSelecionadaGaleria.classList.add('hidden');
  if (el.fname) el.fname.textContent = 'Fazer upload de nova foto ou arrastar aqui';
  if (el.im) {
    el.im.src = '';
    el.im.classList.add('hidden');
  }
  if (el.ph) el.ph.style.display = 'flex';

  atualizarLivePreview();
}

function usarFotoEmNovoLink(caminho) {
  state.fotoSelecionadaGaleria = caminho;
  window.location.hash = '#/novo';
}

function abrirModalConfirmacaoExclusao(foto) {
  state.fotoParaExcluir = foto;

  if (el.modalExclusaoThumb) el.modalExclusaoThumb.src = foto.urlPublica;
  if (el.modalExclusaoNome) el.modalExclusaoNome.textContent = foto.nome;
  if (el.modalExclusaoStatus) {
    el.modalExclusaoStatus.textContent = foto.linksUsando.length > 0
      ? `Vinculada a ${foto.linksUsando.length} link(s) ativo(s)`
      : 'Foto livre (não vinculada a links)';
  }

  if (foto.linksUsando.length > 0) {
    if (el.modalExclusaoAvisoLinks) el.modalExclusaoAvisoLinks.classList.remove('hidden');
    if (el.modalExclusaoAvisoTitulo) {
      el.modalExclusaoAvisoTitulo.textContent = `Atenção: Esta foto está ativa em ${foto.linksUsando.length} link(s)!`;
    }
    if (el.modalExclusaoListaLinks) {
      el.modalExclusaoListaLinks.innerHTML = foto.linksUsando.map((l) => `
        <div class="flex items-center justify-between bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/40">
          <div class="truncate max-w-[220px]">
            <span class="font-bold text-on-surface block truncate">${escapeHtml(l.titulo || l.slug)}</span>
            <span class="text-[10px] text-outline font-mono truncate">/${escapeHtml(l.slug)}</span>
          </div>
          <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${l.ativo ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-outline'} shrink-0">
            ${l.ativo ? 'Ativo' : 'Pausado'}
          </span>
        </div>
      `).join('');
    }
  } else {
    if (el.modalExclusaoAvisoLinks) el.modalExclusaoAvisoLinks.classList.add('hidden');
  }

  if (el.modalConfirmarExclusaoFoto) el.modalConfirmarExclusaoFoto.classList.remove('hidden');
}

function fecharModalConfirmacaoExclusao() {
  if (el.modalConfirmarExclusaoFoto) el.modalConfirmarExclusaoFoto.classList.add('hidden');
  state.fotoParaExcluir = null;
}

async function confirmarExclusaoFoto() {
  if (!state.fotoParaExcluir) return;

  const btnConfirmar = el.modalExclusaoBtnConfirmar;
  if (btnConfirmar) {
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'Apagando…';
  }

  try {
    const caminho = state.fotoParaExcluir.caminho;
    const { error } = await sb.storage.from('banners').remove([caminho]);
    if (error) throw error;

    if (state.fotoSelecionadaGaleria === caminho) {
      removerFotoGaleriaDoFormulario();
    }

    toast('Foto apagada da galeria com sucesso!', 'success');
    fecharModalConfirmacaoExclusao();
    await carregarGaleriaFotos(true);
  } catch (err) {
    toast('Erro ao apagar foto: ' + err.message, 'error');
  } finally {
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.innerHTML = '<span class="material-symbols-outlined text-base">delete</span><span>Sim, Excluir Foto</span>';
    }
  }
}

async function processarUploadDiretoGaleria(files) {
  if (!files || files.length === 0) return;
  const listaArquivos = Array.from(files).filter((f) => f.type.startsWith('image/'));
  if (listaArquivos.length === 0) {
    toast('Selecione arquivos de imagem válidos (JPEG, PNG ou WebP).', 'error');
    return;
  }

  toast(`Otimizando e enviando ${listaArquivos.length} foto(s)...`, 'info');

  let enviados = 0;
  for (const file of listaArquivos) {
    try {
      const blob = await comprimirImagem(file, { larguraMax: 1200, alvoKB: 300 });
      const caminho = `${state.user.id}/galeria-${Date.now()}-${slugAleatorio()}.jpg`;
      const { error } = await sb.storage
        .from('banners')
        .upload(caminho, blob, { contentType: 'image/jpeg' });
      if (!error) enviados += 1;
    } catch (err) {
      console.error('Erro no upload para galeria:', err);
    }
  }

  if (enviados > 0) {
    toast(`${enviados} foto(s) adicionada(s) à sua galeria com sucesso!`, 'success');
    await carregarGaleriaFotos(true);
  } else {
    toast('Não foi possível enviar as fotos. Tente novamente.', 'error');
  }
}

// ==========================================
// REGISTRO DE EVENTOS DA GALERIA
// ==========================================

// Abertura do Modal de Seleção no Formulário
if (el.btnAbrirModalGaleria) {
  el.btnAbrirModalGaleria.addEventListener('click', abrirModalSelecaoGaleria);
}
if (el.btnTrocarFotoGaleria) {
  el.btnTrocarFotoGaleria.addEventListener('click', abrirModalSelecaoGaleria);
}
if (el.btnRemoverFotoGaleria) {
  el.btnRemoverFotoGaleria.addEventListener('click', removerFotoGaleriaDoFormulario);
}

// Fechamento do Modal de Seleção
if (el.modalGaleriaBtnFechar) {
  el.modalGaleriaBtnFechar.addEventListener('click', fecharModalSelecaoGaleria);
}
if (el.modalGaleriaBtnCancelar) {
  el.modalGaleriaBtnCancelar.addEventListener('click', fecharModalSelecaoGaleria);
}

// Confirmação da Foto Selecionada no Modal
if (el.modalGaleriaBtnConfirmar) {
  el.modalGaleriaBtnConfirmar.addEventListener('click', () => {
    if (state.fotoTemporariaModal) {
      aplicarFotoGaleriaNoFormulario(state.fotoTemporariaModal);
      fecharModalSelecaoGaleria();
      toast('Foto da galeria aplicada com sucesso!', 'success');
    }
  });
}

// Busca em Tempo Real no Modal de Seleção
if (el.modalGaleriaBusca) {
  el.modalGaleriaBusca.addEventListener('input', renderizarModalGaleria);
}

// Seleção de Foto no Grid do Modal (Event Delegation)
if (el.modalGaleriaGrid) {
  el.modalGaleriaGrid.addEventListener('click', (e) => {
    const item = e.target.closest('.modal-foto-item');
    if (!item) return;
    const caminho = item.dataset.caminho;
    state.fotoTemporariaModal = caminho;
    renderizarModalGaleria();
    atualizarBotaoConfirmarModal();
  });
}

// Upload Rápido Direto Dentro do Modal de Seleção
if (el.inputUploadModalGaleria) {
  el.inputUploadModalGaleria.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    toast('Otimizando imagem para alta definição...', 'info');
    try {
      const blob = await comprimirImagem(file, { larguraMax: 1200, alvoKB: 300 });
      const caminho = `${state.user.id}/galeria-${Date.now()}-${slugAleatorio()}.jpg`;
      const { error } = await sb.storage
        .from('banners')
        .upload(caminho, blob, { contentType: 'image/jpeg' });
      if (error) throw error;

      await carregarGaleriaFotos(true);
      aplicarFotoGaleriaNoFormulario(caminho);
      fecharModalSelecaoGaleria();
      toast('Foto adicionada e aplicada ao cartão!', 'success');
    } catch (err) {
      toast('Erro ao enviar foto: ' + err.message, 'error');
    }
  });
}

// Filtros por Chips na View da Galeria
document.querySelectorAll('.filtro-galeria-chip').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-galeria-chip').forEach((b) => {
      b.classList.remove('bg-primary', 'text-white', 'shadow-xs');
      b.classList.add('bg-surface-container-low', 'text-on-surface-variant');
    });
    btn.classList.add('bg-primary', 'text-white', 'shadow-xs');
    btn.classList.remove('bg-surface-container-low', 'text-on-surface-variant');

    state.filtroGaleria = btn.dataset.filtroGaleria;
    renderizarGridGaleria();
  });
});

// Busca na View da Galeria
if (el.inputBuscaGaleria) {
  el.inputBuscaGaleria.addEventListener('input', (e) => {
    state.termoBuscaGaleria = e.target.value.trim();
    renderizarGridGaleria();
  });
}

// Upload Direto na View da Galeria
if (el.inputUploadGaleriaDireto) {
  el.inputUploadGaleriaDireto.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processarUploadDiretoGaleria(e.target.files);
    }
  });
}

// Ações no Grid da View da Galeria (Usar em Novo Link, Recortar ou Excluir)
if (el.gridFotosGaleria) {
  el.gridFotosGaleria.addEventListener('click', (e) => {
    const btnUsar = e.target.closest('.btn-usar-em-novo-link');
    if (btnUsar) {
      const caminho = btnUsar.dataset.caminho;
      usarFotoEmNovoLink(caminho);
      return;
    }

    const btnRecortar = e.target.closest('.btn-recortar-foto-card');
    if (btnRecortar) {
      const caminho = btnRecortar.dataset.caminho;
      const foto = state.fotosGaleria.find((f) => f.caminho === caminho);
      if (foto) {
        abrirEditorRecorte({
          arquivoOuUrl: foto.urlPublica,
          modo: 'galeria',
          fotoOriginal: foto,
          aspectInicial: 1.912,
        });
      }
      return;
    }

    const btnExcluir = e.target.closest('.btn-excluir-foto');
    if (btnExcluir) {
      const caminho = btnExcluir.dataset.caminho;
      const foto = state.fotosGaleria.find((f) => f.caminho === caminho);
      if (foto) {
        abrirModalConfirmacaoExclusao(foto);
      }
    }
  });
}

// Modal de Confirmação de Exclusão Segura
if (el.modalExclusaoBtnCancelar) {
  el.modalExclusaoBtnCancelar.addEventListener('click', fecharModalConfirmacaoExclusao);
}
if (el.modalExclusaoBtnConfirmar) {
  el.modalExclusaoBtnConfirmar.addEventListener('click', confirmarExclusaoFoto);
}

// ==========================================
// EDITOR & RECORTE DE IMAGENS PROFISSIONAL (Cropper.js)
// ==========================================

let instanciaCropper = null;
const editorContexto = {
  modo: 'formulario', // 'formulario' | 'galeria' | 'upload_galeria'
  fotoOriginal: null, // objeto foto se veio da galeria
  aspectRatioAtual: 1.912,
  escalaX: 1,
  escalaY: 1,
  urlTemporariaObjeto: null,
};

function abrirEditorRecorte({ arquivoOuUrl, modo = 'formulario', fotoOriginal = null, aspectInicial = 1.912 }) {
  if (!el.modalEditorRecorte || !el.editorImagemAlvo) return;

  editorContexto.modo = modo;
  editorContexto.fotoOriginal = fotoOriginal;
  editorContexto.aspectRatioAtual = aspectInicial;
  editorContexto.escalaX = 1;
  editorContexto.escalaY = 1;

  // Revoga URL temporária anterior se existir
  if (editorContexto.urlTemporariaObjeto) {
    try { URL.revokeObjectURL(editorContexto.urlTemporariaObjeto); } catch (_) {}
    editorContexto.urlTemporariaObjeto = null;
  }

  let srcUrl = '';
  if (arquivoOuUrl instanceof Blob || arquivoOuUrl instanceof File) {
    editorContexto.urlTemporariaObjeto = URL.createObjectURL(arquivoOuUrl);
    srcUrl = editorContexto.urlTemporariaObjeto;
  } else if (typeof arquivoOuUrl === 'string') {
    srcUrl = arquivoOuUrl;
  } else {
    toast('Formato de imagem inválido para o editor.', 'error');
    return;
  }

  // Configuração dos chips visuais de proporção
  document.querySelectorAll('.btn-aspect-chip').forEach((chip) => {
    const val = chip.dataset.aspect;
    const isAtivo = (isNaN(aspectInicial) && isNaN(Number(val))) || (Math.abs(Number(val) - aspectInicial) < 0.01);
    if (isAtivo) {
      chip.classList.add('bg-primary', 'text-white', 'shadow-2xs');
      chip.classList.remove('bg-surface-container-low', 'text-on-surface');
    } else {
      chip.classList.remove('bg-primary', 'text-white', 'shadow-2xs');
      chip.classList.add('bg-surface-container-low', 'text-on-surface');
    }
  });

  // Reseta controles auxiliares
  if (el.editorSliderZoom) el.editorSliderZoom.value = 1;
  if (el.editorCheckMoldura) el.editorCheckMoldura.checked = false;

  // Exibe opção de substituição quando estiver editando foto existente na galeria
  if (modo === 'galeria' && fotoOriginal) {
    if (el.editorBoxSubstituicao) {
      el.editorBoxSubstituicao.classList.remove('hidden');
      el.editorBoxSubstituicao.classList.add('flex');
    }
    if (el.editorCheckSubstituirOriginal) {
      el.editorCheckSubstituirOriginal.checked = false;
    }
  } else {
    if (el.editorBoxSubstituicao) {
      el.editorBoxSubstituicao.classList.add('hidden');
      el.editorBoxSubstituicao.classList.remove('flex');
    }
  }

  // Destrói instância prévia do Cropper se existir
  if (instanciaCropper) {
    instanciaCropper.destroy();
    instanciaCropper = null;
  }

  // Atualiza source da imagem alvo
  el.editorImagemAlvo.src = srcUrl;

  // Abre o modal
  el.modalEditorRecorte.classList.remove('hidden');
  el.modalEditorRecorte.style.display = 'flex';

  const iniciarInstancia = () => {
    if (typeof window.Cropper === 'undefined') {
      toast('Biblioteca de recorte não carregada. Verifique sua conexão.', 'error');
      return;
    }

    instanciaCropper = new window.Cropper(el.editorImagemAlvo, {
      aspectRatio: isNaN(aspectInicial) ? NaN : aspectInicial,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.96,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      responsive: true,
      checkOrientation: true,
      ready() {
        if (el.editorSliderZoom) el.editorSliderZoom.value = 1;
      },
      zoom(e) {
        if (el.editorSliderZoom && e.detail && typeof e.detail.ratio === 'number') {
          el.editorSliderZoom.value = Math.min(3, Math.max(0.2, e.detail.ratio)).toFixed(2);
        }
      }
    });
  };

  if (el.editorImagemAlvo.complete) {
    iniciarInstancia();
  } else {
    el.editorImagemAlvo.onload = () => {
      iniciarInstancia();
      el.editorImagemAlvo.onload = null;
    };
  }
}

function fecharEditorRecorte() {
  if (instanciaCropper) {
    instanciaCropper.destroy();
    instanciaCropper = null;
  }
  if (editorContexto.urlTemporariaObjeto) {
    try { URL.revokeObjectURL(editorContexto.urlTemporariaObjeto); } catch (_) {}
    editorContexto.urlTemporariaObjeto = null;
  }
  if (el.modalEditorRecorte) {
    el.modalEditorRecorte.classList.add('hidden');
    el.modalEditorRecorte.style.display = 'none';
  }
}

async function aplicarRecorteConfirmado() {
  if (!instanciaCropper) return;

  const btnConfirmar = el.modalEditorBtnConfirmar;
  if (btnConfirmar) {
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">progress_activity</span><span>Processando...</span>';
  }

  try {
    // 1. Obtém o canvas recortado em alta resolução (até 1600px para nitidez HD)
    const canvasRecortado = instanciaCropper.getCroppedCanvas({
      maxWidth: 1600,
      maxHeight: 1600,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    if (!canvasRecortado) {
      throw new Error('Falha ao processar o enquadramento selecionado.');
    }

    // 2. Aplica moldura inteligente se a opção estiver marcada
    let canvasFinal = canvasRecortado;
    const querMoldura = el.editorCheckMoldura && el.editorCheckMoldura.checked;
    if (querMoldura) {
      canvasFinal = aplicarMolduraInteligente(canvasRecortado, {
        tipo: 'blur',
        largura: 1200,
        altura: 628,
      });
    }

    // 3. Converte para Blob HD comprimido (alvo 300KB)
    const blobFinal = await canvasParaBlob(canvasFinal, { alvoKB: 300, maxKB: 500 });
    const tamanhoFinalKB = Math.round(blobFinal.size / 1024);

    // 4. Fluxo de acordo com o contexto
    if (editorContexto.modo === 'formulario') {
      state.arquivoBlob = blobFinal;
      state.fotoSelecionadaGaleria = null;
      if (el.bannerFotoSelecionadaGaleria) el.bannerFotoSelecionadaGaleria.classList.add('hidden');

      const urlPreview = URL.createObjectURL(blobFinal);
      if (el.im) {
        el.im.src = urlPreview;
        el.im.classList.remove('hidden');
      }
      if (el.ph) el.ph.style.display = 'none';

      if (el.fname) el.fname.textContent = 'Imagem recortada e otimizada';
      if (el.infoArquivo) {
        el.infoArquivo.classList.remove('hidden');
        if (el.detalheCompressao) {
          el.detalheCompressao.textContent = `${canvasFinal.width}x${canvasFinal.height}px · ${tamanhoFinalKB}KB · Pronto para o WhatsApp`;
        }
      }

      atualizarLivePreview();
      fecharEditorRecorte();
      toast('Recorte aplicado com sucesso ao seu cartão!', 'success');

    } else if (editorContexto.modo === 'galeria') {
      const substituir = el.editorCheckSubstituirOriginal && el.editorCheckSubstituirOriginal.checked;
      const foto = editorContexto.fotoOriginal;

      if (substituir && foto && foto.caminho) {
        toast('Atualizando imagem nos links vinculados...', 'info');
        const { error: errUpload } = await sb.storage
          .from('banners')
          .upload(foto.caminho, blobFinal, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (errUpload) throw errUpload;

        // Incrementa a versão em todos os links que utilizam este caminho
        if (state.loja) {
          try {
            const { data: linksVinculados } = await sb
              .from('links')
              .select('id, versao')
              .eq('loja_id', state.loja.id)
              .eq('imagem_path', foto.caminho);

            if (linksVinculados && linksVinculados.length > 0) {
              for (const l of linksVinculados) {
                await sb.from('links').update({ versao: (l.versao || 1) + 1 }).eq('id', l.id);
              }
            }
          } catch (e) {
            console.warn('Aviso ao incrementar versões de links:', e);
          }
        }

        toast('Imagem original e links atualizados com sucesso!', 'success');
      } else {
        toast('Salvando nova foto recortada na galeria...', 'info');
        const novoCaminho = `${state.user.id}/galeria-${Date.now()}-${slugAleatorio()}.jpg`;
        const { error: errUpload } = await sb.storage
          .from('banners')
          .upload(novoCaminho, blobFinal, { contentType: 'image/jpeg' });

        if (errUpload) throw errUpload;
        toast('Nova foto recortada salva na sua galeria!', 'success');
      }

      fecharEditorRecorte();
      await carregarGaleriaFotos(true);

    } else if (editorContexto.modo === 'upload_galeria') {
      toast('Enviando foto recortada para a galeria...', 'info');
      const novoCaminho = `${state.user.id}/galeria-${Date.now()}-${slugAleatorio()}.jpg`;
      const { error: errUpload } = await sb.storage
        .from('banners')
        .upload(novoCaminho, blobFinal, { contentType: 'image/jpeg' });

      if (errUpload) throw errUpload;

      fecharEditorRecorte();
      await carregarGaleriaFotos(true);
      toast('Foto adicionada à galeria com sucesso!', 'success');
    }

  } catch (err) {
    toast('Erro ao processar recorte: ' + err.message, 'error');
  } finally {
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.innerHTML = '<span class="material-symbols-outlined text-base">check</span><span>Confirmar Recorte</span>';
    }
  }
}

// ==========================================
// REGISTRO DE EVENTOS DO EDITOR DE IMAGENS
// ==========================================

// Chips de Proporção (Aspect Ratio)
if (el.editorAspectChips) {
  el.editorAspectChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.btn-aspect-chip');
    if (!chip || !instanciaCropper) return;

    document.querySelectorAll('.btn-aspect-chip').forEach((c) => {
      c.classList.remove('bg-primary', 'text-white', 'shadow-2xs');
      c.classList.add('bg-surface-container-low', 'text-on-surface');
    });
    chip.classList.add('bg-primary', 'text-white', 'shadow-2xs');
    chip.classList.remove('bg-surface-container-low', 'text-on-surface');

    const aspectStr = chip.dataset.aspect;
    const aspect = aspectStr === 'NaN' ? NaN : parseFloat(aspectStr);
    editorContexto.aspectRatioAtual = aspect;
    instanciaCropper.setAspectRatio(aspect);

    // Sugestão de moldura inteligente para fotos verticais ou quadradas
    if (aspectStr === '1' || aspectStr === '0.75' || aspectStr === '0.5625') {
      if (el.editorCheckMoldura && !el.editorCheckMoldura.checked) {
        el.editorCheckMoldura.checked = true;
      }
    } else if (aspectStr === '1.912') {
      if (el.editorCheckMoldura) {
        el.editorCheckMoldura.checked = false;
      }
    }
  });
}

// Zoom In / Out e Slider
if (el.editorBtnZoomIn) {
  el.editorBtnZoomIn.addEventListener('click', () => {
    if (instanciaCropper) instanciaCropper.zoom(0.1);
  });
}
if (el.editorBtnZoomOut) {
  el.editorBtnZoomOut.addEventListener('click', () => {
    if (instanciaCropper) instanciaCropper.zoom(-0.1);
  });
}
if (el.editorSliderZoom) {
  el.editorSliderZoom.addEventListener('input', (e) => {
    if (instanciaCropper) {
      instanciaCropper.zoomTo(parseFloat(e.target.value));
    }
  });
}

// Rotação ±90°, Espelhamento e Reset
if (el.editorBtnRotateLeft) {
  el.editorBtnRotateLeft.addEventListener('click', () => {
    if (instanciaCropper) instanciaCropper.rotate(-90);
  });
}
if (el.editorBtnRotateRight) {
  el.editorBtnRotateRight.addEventListener('click', () => {
    if (instanciaCropper) instanciaCropper.rotate(90);
  });
}
if (el.editorBtnFlipH) {
  el.editorBtnFlipH.addEventListener('click', () => {
    if (instanciaCropper) {
      editorContexto.escalaX = (editorContexto.escalaX || 1) * -1;
      instanciaCropper.scaleX(editorContexto.escalaX);
    }
  });
}
if (el.editorBtnReset) {
  el.editorBtnReset.addEventListener('click', () => {
    if (instanciaCropper) {
      editorContexto.escalaX = 1;
      editorContexto.escalaY = 1;
      instanciaCropper.reset();
      if (el.editorSliderZoom) el.editorSliderZoom.value = 1;
    }
  });
}

// Fechamento e Confirmação
if (el.modalEditorBtnFechar) {
  el.modalEditorBtnFechar.addEventListener('click', fecharEditorRecorte);
}
if (el.modalEditorBtnCancelar) {
  el.modalEditorBtnCancelar.addEventListener('click', fecharEditorRecorte);
}
if (el.modalEditorBtnConfirmar) {
  el.modalEditorBtnConfirmar.addEventListener('click', aplicarRecorteConfirmado);
}

// Botão de Recorte da Foto Selecionada no Formulário
if (el.btnRecortarFotoSelecionada) {
  el.btnRecortarFotoSelecionada.addEventListener('click', () => {
    if (state.fotoSelecionadaGaleria) {
      const foto = state.fotosGaleria.find((f) => f.caminho === state.fotoSelecionadaGaleria);
      const url = foto ? foto.urlPublica : (el.thumbFotoSelecionada ? el.thumbFotoSelecionada.src : null);
      if (url) {
        abrirEditorRecorte({
          arquivoOuUrl: url,
          modo: 'formulario',
          aspectInicial: 1.912,
        });
      }
    } else if (state.arquivoBlob) {
      abrirEditorRecorte({
        arquivoOuUrl: state.arquivoBlob,
        modo: 'formulario',
        aspectInicial: 1.912,
      });
    } else if (el.im && el.im.src && !el.im.classList.contains('hidden')) {
      abrirEditorRecorte({
        arquivoOuUrl: el.im.src,
        modo: 'formulario',
        aspectInicial: 1.912,
      });
    } else {
      toast('Selecione ou envie uma imagem primeiro para recortar.', 'info');
    }
  });
}

// Iniciar Aplicação
init();
