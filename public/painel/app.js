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
  tipoLink: 'direto', // 'direto' | 'vitrine'
  fotosExtrasVitrine: [],
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
  modalGaleriaModo: 'principal', // 'principal' | 'vitrine_extra'

  // Horários de Pico e Métricas por Hora
  picosHorarios: {},
  modalHorarios: { linkId: null, linkTitulo: '', linkSlug: '', dias: 30 },

  // Assistente de Inteligência Artificial
  ia: {
    cotaRestante: 40,
    limiteDiario: 40,
    tomSelecionado: 'urgencia',
    gerando: false,
    sugestoes: [],
  },
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

  // Onboarding (2 Passos)
  formOnboarding: document.getElementById('form-onboarding'),
  onboardingStep1: document.getElementById('onboarding-step-1'),
  onboardingStep2: document.getElementById('onboarding-step-2'),
  onboardingStepIndicator: document.getElementById('onboarding-step-indicator'),
  onboardingProgressBar: document.getElementById('onboarding-progress-bar'),
  btnOnboardingStep1Next: document.getElementById('btn-onboarding-step1-next'),
  btnOnboardingStep2Back: document.getElementById('btn-onboarding-step2-back'),
  onboardingResponsavel: document.getElementById('onboarding-responsavel'),
  onboardingWhatsapp: document.getElementById('onboarding-whatsapp'),
  onboardingNome: document.getElementById('onboarding-nome'),
  onboardingSlug: document.getElementById('onboarding-slug'),
  onboardingPrefixo: document.getElementById('onboarding-prefixo'),
  onboardingCidade: document.getElementById('onboarding-cidade'),
  onboardingEstado: document.getElementById('onboarding-estado'),
  onboardingRamo: document.getElementById('onboarding-ramo'),
  onboardingRamoOutroWrap: document.getElementById('onboarding-ramo-outro-wrap'),
  onboardingRamoOutro: document.getElementById('onboarding-ramo-outro'),
  onboardingExpectativa: document.getElementById('onboarding-expectativa'),
  onboardingExpectativaDetalhes: document.getElementById('onboarding-expectativa-detalhes'),
  btnSalvarLoja: document.getElementById('btn-salvar-loja'),

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
  btnTipoDireto: document.getElementById('btn-tipo-direto'),
  btnTipoVitrine: document.getElementById('btn-tipo-vitrine'),
  badgeTipoLink: document.getElementById('badge-tipo-link'),
  descTipoLink: document.getElementById('desc-tipo-link'),
  boxCamposVitrine: document.getElementById('box-campos-vitrine'),
  inputPrecoDe: document.getElementById('input-preco-de'),
  inputPrecoPor: document.getElementById('input-preco-por'),
  inputCondicaoPagamento: document.getElementById('input-condicao-pagamento'),
  inputBeneficio1: document.getElementById('input-beneficio-1'),
  inputBeneficio2: document.getElementById('input-beneficio-2'),
  inputBeneficio3: document.getElementById('input-beneficio-3'),
  btnIaBeneficios: document.getElementById('btn-ia-beneficios'),
  inputCtaLabel: document.getElementById('input-cta-label'),
  btnAdicionarFotoGaleriaVitrine: document.getElementById('btn-adicionar-foto-galeria-vitrine'),
  containerFotosExtrasVitrine: document.getElementById('container-fotos-extras-vitrine'),
  labelNenhumaFotoExtra: document.getElementById('label-nenhuma-foto-extra'),

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
  waPhoneOrigemBadge: document.getElementById('wa-phone-origem-badge'),
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
  inputMensagemCompartilhamento: document.getElementById('input-mensagem-compartilhamento'),
  contadorMensagemCompartilhamento: document.getElementById('contador-mensagem-compartilhamento'),
  btnIaInlineCompartilhamento: document.getElementById('btn-ia-inline-compartilhamento'),
  btnSubmeterLink: document.getElementById('btn-submeter-link'),

  // Assistente de Copy com IA
  bannerIaAssistente: document.getElementById('banner-ia-assistente'),
  badgeIaCotas: document.getElementById('badge-ia-cotas'),
  btnAbrirAssistenteIa: document.getElementById('btn-abrir-assistente-ia'),
  btnIaInlineTitulo: document.getElementById('btn-ia-inline-titulo'),
  btnIaInlineDescricao: document.getElementById('btn-ia-inline-descricao'),
  btnIaInlineMensagem: document.getElementById('btn-ia-inline-mensagem'),
  modalAssistenteIa: document.getElementById('modal-assistente-ia'),
  modalIaBtnFechar: document.getElementById('modal-ia-btn-fechar'),
  modalIaBtnCancelar: document.getElementById('modal-ia-btn-cancelar'),
  modalIaBadgeCota: document.getElementById('modal-ia-badge-cota'),
  modalIaInputContexto: document.getElementById('modal-ia-input-contexto'),
  modalIaBtnGerar: document.getElementById('modal-ia-btn-gerar'),
  modalIaLoading: document.getElementById('modal-ia-loading'),
  modalIaResultados: document.getElementById('modal-ia-resultados'),
  modalIaCardsLista: document.getElementById('modal-ia-cards-lista'),

  // Live Preview WhatsApp & Redes Sociais & Vitrine
  previewTabWa: document.getElementById('preview-tab-wa'),
  previewTabSocial: document.getElementById('preview-tab-social'),
  previewTabVitrine: document.getElementById('preview-tab-vitrine'),
  previewFrameWa: document.getElementById('preview-frame-wa'),
  previewFrameSocial: document.getElementById('preview-frame-social'),
  previewFrameVitrine: document.getElementById('preview-frame-vitrine'),
  waPreviewMsgTexto: document.getElementById('wa-preview-msg-texto'),
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

  imVitrine: document.getElementById('im-vitrine'),
  phVitrine: document.getElementById('ph-vitrine'),
  ptVitrine: document.getElementById('pt-vitrine'),
  pdVitrine: document.getElementById('pd-vitrine'),
  vitrineAvatarImg: document.getElementById('vitrine-avatar-img'),
  vitrineAvatarLoja: document.getElementById('vitrine-avatar-loja'),
  vitrineNomeLoja: document.getElementById('vitrine-nome-loja'),
  vitrineBadgeDesconto: document.getElementById('vitrine-badge-desconto'),
  vitrineBlocoPreco: document.getElementById('vitrine-bloco-preco'),
  vitrinePrecoDe: document.getElementById('vitrine-preco-de'),
  vitrinePrecoPor: document.getElementById('vitrine-preco-por'),
  vitrineCondicao: document.getElementById('vitrine-condicao'),
  vitrineBlocoBeneficios: document.getElementById('vitrine-bloco-beneficios'),
  vitrineListaBeneficios: document.getElementById('vitrine-lista-beneficios'),
  vitrineBtnLabel: document.getElementById('vitrine-btn-label'),

  // Box Sucesso Inline
  res: document.getElementById('res'),
  ru: document.getElementById('ru'),
  cp: document.getElementById('cp'),
  btnShareInline: document.getElementById('btn-share-inline'),

  // Modal Sucesso
  modalSucesso: document.getElementById('modal-sucesso'),
  modalSucessoTitulo: document.getElementById('modal-sucesso-titulo'),
  modalSucessoBadgeVersao: document.getElementById('modal-sucesso-badge-versao'),
  modalSucessoBadgeTexto: document.getElementById('modal-sucesso-badge-texto'),
  modalSucessoSubtitulo: document.getElementById('modal-sucesso-subtitulo'),
  modalSucessoBoxMensagem: document.getElementById('modal-sucesso-box-mensagem'),
  modalSucessoTextoPreview: document.getElementById('modal-sucesso-texto-preview'),
  modalSucessoContadorChars: document.getElementById('modal-sucesso-contador-chars'),
  modalBtnWhatsapp: document.getElementById('modal-btn-whatsapp'),
  modalBtnWhatsappTexto: document.getElementById('modal-btn-whatsapp-texto'),
  modalBtnCopiarCompleto: document.getElementById('modal-btn-copiar-completo'),
  modalBtnCopiarCompletoTexto: document.getElementById('modal-btn-copiar-completo-texto'),
  modalInputLink: document.getElementById('modal-input-link'),
  modalBtnCopiar: document.getElementById('modal-btn-copiar'),
  modalBtnCopiarTexto: document.getElementById('modal-btn-copiar-texto'),
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

  // Conta & Perfil
  contaEmail: document.getElementById('conta-email'),
  contaResponsavel: document.getElementById('conta-responsavel'),
  contaWhatsapp: document.getElementById('conta-whatsapp'),
  inputContaLogo: document.getElementById('input-conta-logo'),
  btnRemoverContaLogo: document.getElementById('btn-remover-conta-logo'),
  contaLogoImg: document.getElementById('conta-logo-img'),
  contaLogoPlaceholder: document.getElementById('conta-logo-placeholder'),
  contaLojaNome: document.getElementById('conta-loja-nome'),
  contaLojaSlug: document.getElementById('conta-loja-slug'),
  contaLocalizacao: document.getElementById('conta-localizacao'),
  contaRamo: document.getElementById('conta-ramo'),
  contaExpectativa: document.getElementById('conta-expectativa'),
  contaStatus: document.getElementById('conta-status'),
  contaPlanoNome: document.getElementById('conta-plano-nome'),
  contaModalidade: document.getElementById('conta-modalidade'),
  contaLabelVencimento: document.getElementById('conta-label-vencimento'),
  contaVencimento: document.getElementById('conta-vencimento'),
  boxCancelamentoAtivo: document.getElementById('box-cancelamento-ativo'),
  contaDataFimAcesso: document.getElementById('conta-data-fim-acesso'),
  boxBtnCancelarRecorrencia: document.getElementById('box-btn-cancelar-recorrencia'),
  btnCancelarAssinaturaPainel: document.getElementById('btn-cancelar-assinatura-painel'),
  modalConfirmarCancelamento: document.getElementById('modal-confirmar-cancelamento'),
  modalCancelarDataFim: document.getElementById('modal-cancelar-data-fim'),
  btnConfirmarCancelamentoRecorrencia: document.getElementById('btn-confirmar-cancelamento-recorrencia'),
  btnFecharModalCancelamento: document.getElementById('btn-fechar-modal-cancelamento'),
  btnToggleEditarPerfilPainel: document.getElementById('btn-toggle-editar-perfil-painel'),
  formEditarPerfilPainel: document.getElementById('form-editar-perfil-painel'),
  btnCancelarEditarPerfilPainel: document.getElementById('btn-cancelar-editar-perfil-painel'),
  painelPerfilResponsavel: document.getElementById('painel-perfil-responsavel'),
  painelPerfilWhatsapp: document.getElementById('painel-perfil-whatsapp'),
  painelPerfilCidade: document.getElementById('painel-perfil-cidade'),
  painelPerfilEstado: document.getElementById('painel-perfil-estado'),
  painelPerfilRamo: document.getElementById('painel-perfil-ramo'),
  painelPerfilExpectativa: document.getElementById('painel-perfil-expectativa'),

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

  // Modal de Horários de Pico e Métricas 24h
  modalHorariosLink: document.getElementById('modal-horarios-link'),
  modalHorariosLinkNome: document.getElementById('modal-horarios-link-nome'),
  btnFecharModalHorarios: document.getElementById('btn-fechar-modal-horarios'),
  btnConcluirModalHorarios: document.getElementById('btn-concluir-modal-horarios'),
  containerGraficoHorarios: document.getElementById('container-grafico-horarios'),
  labelDetalheHoraHover: document.getElementById('label-detalhe-hora-hover'),
  textoRecomendacaoHorario: document.getElementById('texto-recomendacao-horario'),
  cardRecomendacaoHorario: document.getElementById('card-recomendacao-horario'),
  estadoVazioHorarios: document.getElementById('estado-vazio-horarios'),
};

// Configuração dos Planos Comerciais
export const PLANOS_CONFIG = {
  free: {
    id: 'free',
    nome: 'Plano Grátis',
    maxLinks: 1,
    maxEdicoes: 5,
    maxLojas: 1,
    maxIaDiario: 10,
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
    maxIaDiario: 20,
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
    maxIaDiario: 40,
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
    maxIaDiario: 100,
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
    if (state.assinatura.valido_ate) {
      const dataValidade = new Date(state.assinatura.valido_ate);
      const limiteComCarencia = new Date(dataValidade.getTime() + 3 * 86400000);
      if (limiteComCarencia < new Date()) {
        return {
          ...PLANOS_CONFIG.free,
          id: 'free',
          nome: 'Assinatura Vencida',
          maxLinks: 0,
          maxEdicoes: 0,
          isExpirado: true
        };
      }
    }
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

// Resolução de URL de Imagem (suporta CDN e armazenamento nativo)
function resolverUrlImagem(caminho, versao = 1) {
  if (!caminho) return '';
  if (caminho.startsWith('http://') || caminho.startsWith('https://')) {
    return `${caminho}${caminho.includes('?') ? '&' : '?'}v=${versao}`;
  }
  const limpo = String(caminho).replace(/^\/+/, '').replace(/^imagens\//, '');
  try {
    const { data } = sb.storage.from('banners').getPublicUrl(limpo);
    if (data?.publicUrl) {
      return `${data.publicUrl}?v=${versao}`;
    }
  } catch (_) {}
  return `/imagens/${limpo}?v=${versao}`;
}

// Upload Seguro de Imagens Otimizadas com Alta Performance e Fallback
async function uploadImagemOtimizada(blob, caminhoDesejado = '') {
  let token = '';
  try {
    const { data: { session } } = await sb.auth.getSession();
    token = session?.access_token || '';
  } catch (_) {}

  try {
    const headers = {
      'Content-Type': blob.type || 'image/jpeg',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (caminhoDesejado) headers['X-File-Path'] = caminhoDesejado;

    const res = await fetch('/api/upload-imagem', {
      method: 'POST',
      headers,
      body: blob,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.sucesso && data.caminho) {
        return { caminho: data.caminho, url: data.url };
      }
    }
  } catch (errApi) {
    console.warn('[PostLink] Fallback para armazenamento de transição:', errApi);
  }

  // Fallback seguro caso o endpoint de alta velocidade não esteja acessível
  const caminhoPadrao = caminhoDesejado || `${state.user.id}/${Date.now()}.jpg`;
  const { error } = await sb.storage.from('banners').upload(caminhoPadrao, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = sb.storage.from('banners').getPublicUrl(caminhoPadrao);
  return { caminho: caminhoPadrao, url: publicUrl };
}

// Montagem de URLs com Versionamento (?v=2, ?v=3...)
function montarUrlLink(lojaSlug, linkSlug, versao = 1, extras = {}) {
  const origin = window.location.origin || 'https://www.postlink.com.br';
  const url = `${origin}/${lojaSlug}/${linkSlug}`;
  const params = new URLSearchParams();

  if (Number(versao) > 1) {
    params.set('v', versao);
  }

  Object.entries(extras).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      params.set(chave, valor);
    }
  });

  const queryStr = params.toString();
  return queryStr ? `${url}?${queryStr}` : url;
}

function adicionarParametroUrl(urlStr, chave, valor) {
  try {
    const parsed = new URL(urlStr, window.location.origin);
    parsed.searchParams.set(chave, valor);
    return parsed.toString();
  } catch {
    const separador = urlStr.includes('?') ? '&' : '?';
    return `${urlStr}${separador}${encodeURIComponent(chave)}=${encodeURIComponent(valor)}`;
  }
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

  // Carrega status de cota diária do assistente de IA
  carregarStatusIa();

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
    const cancelado = Boolean(state.assinatura.cancelar_ao_fim_do_periodo);
    const validoAte = state.assinatura.valido_ate ? new Date(state.assinatura.valido_ate) : null;
    const diffDias = validoAte ? Math.max(0, Math.ceil((validoAte - new Date()) / (1000 * 60 * 60 * 24))) : 30;
    const dataFimStr = validoAte ? validoAte.toLocaleDateString('pt-BR') : '';

    if (cancelado) {
      el.textoTrial.innerHTML = `Assinatura ${p.nome} ativa até <strong>${dataFimStr}</strong> (renovação cancelada)`;
      if (el.navStatusTexto) el.navStatusTexto.textContent = `${p.nome} (${diffDias}d)`;
      if (subtextoEl) {
        subtextoEl.textContent = 'Sua renovação automática foi cancelada. Seu acesso aos recursos contratados continua liberado até o final do período pago.';
      }
    } else if (state.assinatura.tipo_cobranca === 'recorrente_cartao') {
      el.textoTrial.innerHTML = `Assinatura ${p.nome} ativa • <strong>Renovação automática no cartão</strong> em ${dataFimStr}`;
      if (el.navStatusTexto) el.navStatusTexto.textContent = p.nome;
      if (subtextoEl) {
        subtextoEl.textContent = 'Sua assinatura com débito mensal automático está ativa. Cancele quando quiser nas configurações da conta.';
      }
    } else {
      el.textoTrial.innerHTML = `Assinatura ${p.nome} ativa • Válido por mais <strong>${diffDias} dias</strong> (PIX)`;
      if (el.navStatusTexto) el.navStatusTexto.textContent = p.nome;
      if (subtextoEl) {
        subtextoEl.textContent = 'Sua assinatura está ativa e você tem acesso a todos os recursos contratados.';
      }
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

// HELPER: Máscara e Formatação de Telefone (WhatsApp Brasil)
function aplicarMascaraTelefoneInput(input) {
  if (!input) return;
  input.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (val.length > 10) {
      val = val.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (val.length > 6) {
      val = val.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (val.length > 2) {
      val = val.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (val.length > 0) {
      val = val.replace(/^(\d{0,2})/, '($1');
    }
    e.target.value = val;
  });
}

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

// ONBOARDING (Fluxo Guiado em 2 Passos)
if (el.onboardingWhatsapp) {
  aplicarMascaraTelefoneInput(el.onboardingWhatsapp);
}

if (el.onboardingNome) {
  el.onboardingNome.addEventListener('input', () => {
    if (el.onboardingSlug && !el.onboardingSlug.dataset.manual) {
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

// Avançar do Passo 1 para o Passo 2
if (el.btnOnboardingStep1Next) {
  el.btnOnboardingStep1Next.addEventListener('click', () => {
    const responsavel = el.onboardingResponsavel ? el.onboardingResponsavel.value.trim() : '';
    const whatsapp = el.onboardingWhatsapp ? el.onboardingWhatsapp.value.replace(/\D/g, '') : '';
    const nome = el.onboardingNome ? el.onboardingNome.value.trim() : '';
    const slug = el.onboardingSlug ? limparSlug(el.onboardingSlug.value.trim()) : '';
    const cidade = el.onboardingCidade ? el.onboardingCidade.value.trim() : '';
    const estado = el.onboardingEstado ? el.onboardingEstado.value.trim() : '';

    if (!responsavel) {
      toast('Por favor, informe seu nome completo.', 'error');
      if (el.onboardingResponsavel) el.onboardingResponsavel.focus();
      return;
    }

    if (whatsapp.length < 10) {
      toast('Por favor, insira um número de WhatsApp comercial válido com DDD.', 'error');
      if (el.onboardingWhatsapp) el.onboardingWhatsapp.focus();
      return;
    }

    if (!nome) {
      toast('Por favor, informe o nome da sua loja ou marca.', 'error');
      if (el.onboardingNome) el.onboardingNome.focus();
      return;
    }

    if (!slug || slug.length < 2) {
      toast('Por favor, defina um identificador (slug) válido para a sua loja.', 'error');
      if (el.onboardingSlug) el.onboardingSlug.focus();
      return;
    }

    if (!cidade) {
      toast('Por favor, informe a cidade onde fica a sua empresa.', 'error');
      if (el.onboardingCidade) el.onboardingCidade.focus();
      return;
    }

    if (!estado) {
      toast('Por favor, selecione o estado (UF) da sua empresa.', 'error');
      if (el.onboardingEstado) el.onboardingEstado.focus();
      return;
    }

    // Transição para o Passo 2
    if (el.onboardingStep1) el.onboardingStep1.classList.add('hidden');
    if (el.onboardingStep2) el.onboardingStep2.classList.remove('hidden');
    if (el.onboardingStepIndicator) el.onboardingStepIndicator.textContent = 'Passo 2 de 2';
    if (el.onboardingProgressBar) {
      el.onboardingProgressBar.style.width = '100%';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Voltar do Passo 2 para o Passo 1
if (el.btnOnboardingStep2Back) {
  el.btnOnboardingStep2Back.addEventListener('click', () => {
    if (el.onboardingStep2) el.onboardingStep2.classList.add('hidden');
    if (el.onboardingStep1) el.onboardingStep1.classList.remove('hidden');
    if (el.onboardingStepIndicator) el.onboardingStepIndicator.textContent = 'Passo 1 de 2';
    if (el.onboardingProgressBar) {
      el.onboardingProgressBar.style.width = '50%';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Seleção de Chips de Ramo de Atividade
document.querySelectorAll('.chip-ramo').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chip-ramo').forEach((b) => {
      b.className = 'chip-ramo p-2.5 rounded-xl border border-outline-variant bg-surface-container-low hover:border-primary text-xs font-semibold text-on-surface flex flex-col items-center gap-1 text-center transition-all';
    });
    btn.className = 'chip-ramo p-2.5 rounded-xl border-2 border-primary bg-primary-fixed/25 text-primary text-xs font-bold flex flex-col items-center gap-1 text-center transition-all shadow-xs';

    const ramo = btn.dataset.ramo;
    if (el.onboardingRamo) el.onboardingRamo.value = ramo;

    if (ramo === 'Outro') {
      if (el.onboardingRamoOutroWrap) el.onboardingRamoOutroWrap.classList.remove('hidden');
      if (el.onboardingRamoOutro) el.onboardingRamoOutro.focus();
    } else {
      if (el.onboardingRamoOutroWrap) el.onboardingRamoOutroWrap.classList.add('hidden');
    }
  });
});

// Seleção de Cards de Expectativas
document.querySelectorAll('.card-expectativa').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.card-expectativa').forEach((c) => {
      c.className = 'card-expectativa p-3 rounded-2xl border border-outline-variant bg-surface-container-low hover:border-primary cursor-pointer transition-all flex items-start gap-3';
    });
    card.className = 'card-expectativa p-3 rounded-2xl border-2 border-primary bg-primary-fixed/20 ring-1 ring-primary cursor-pointer transition-all flex items-start gap-3 shadow-xs';

    const exp = card.dataset.expectativa;
    if (el.onboardingExpectativa) el.onboardingExpectativa.value = exp;
  });
});

// Submissão Final do Onboarding
if (el.formOnboarding) {
  el.formOnboarding.addEventListener('submit', async (e) => {
    e.preventDefault();

    const responsavel = el.onboardingResponsavel ? el.onboardingResponsavel.value.trim() : '';
    const whatsapp = el.onboardingWhatsapp ? el.onboardingWhatsapp.value.trim() : '';
    const nome = el.onboardingNome ? el.onboardingNome.value.trim() : '';
    const slug = el.onboardingSlug ? limparSlug(el.onboardingSlug.value.trim()) : '';
    const cidade = el.onboardingCidade ? el.onboardingCidade.value.trim() : '';
    const estado = el.onboardingEstado ? el.onboardingEstado.value.trim() : '';

    let ramo = el.onboardingRamo ? el.onboardingRamo.value.trim() : '';
    if (ramo === 'Outro' && el.onboardingRamoOutro && el.onboardingRamoOutro.value.trim()) {
      ramo = el.onboardingRamoOutro.value.trim();
    }
    if (!ramo) {
      toast('Por favor, selecione o ramo do seu negócio na etapa 2.', 'info');
      return;
    }

    const expectativa = el.onboardingExpectativa ? el.onboardingExpectativa.value.trim() : '';
    if (!expectativa) {
      toast('Por favor, selecione o que você mais espera do PostLink.', 'info');
      return;
    }

    const expectativaDetalhes = el.onboardingExpectativaDetalhes ? el.onboardingExpectativaDetalhes.value.trim() : '';

    const btn = el.btnSalvarLoja || document.getElementById('btn-salvar-loja');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner w-4 h-4 border-white border-t-transparent mx-auto"></div><span>Criando seu espaço...</span>';
    }

    try {
      const { data, error } = await sb.rpc('criar_loja', {
        p_nome: nome,
        p_slug: slug,
        p_responsavel_nome: responsavel,
        p_whatsapp: whatsapp,
        p_cidade: cidade,
        p_estado: estado,
        p_ramo_atividade: ramo,
        p_expectativa: expectativa,
        p_expectativa_detalhes: expectativaDetalhes || null,
      });

      if (error) throw error;

      state.loja = data;
      const primeiroNome = responsavel.split(' ')[0] || 'Lojista';
      toast(`🎉 Bem-vindo(a) ao PostLink, ${primeiroNome}! Seu perfil foi configurado com sucesso!`, 'success');
      await carregarDadosLojaEAssinatura();
    } catch (err) {
      toast('Erro ao cadastrar loja: ' + err.message, 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Concluir Cadastro</span><span class="material-symbols-outlined text-base">check_circle</span>';
      }
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

  // Busca resumo dos horários de pico dos links
  try {
    const { data: picos, error: errPicos } = await sb.rpc('obter_resumo_horarios_links', { p_dias: 30 });
    state.picosHorarios = {};
    if (!errPicos && picos) {
      picos.forEach((p) => {
        state.picosHorarios[p.link_id] = p;
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

    const versaoAtual = link.versao || 1;
    const fullUrl = montarUrlLink(state.loja.slug, link.slug, versaoAtual);
    const imgUrl = resolverUrlImagem(link.imagem_path, versaoAtual);
    const st = state.estatisticas[link.id] || { total: 0, recentes: 0 };

    const p = obterPlanoAtual();
    const edicoesFeitas = Math.max(0, versaoAtual - 1);
    const edicoesRestantes = Math.max(0, 5 - edicoesFeitas);

    const tipoBadgeHtml = link.tipo_link === 'vitrine'
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container">Vitrine</span>`
      : '';

    const versaoBadgeHtml = p.maxEdicoes === Infinity
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary">v${versaoAtual} · ${p.nome}</span>`
      : `<span class="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded ${edicoesFeitas >= 5 ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'}">v${versaoAtual} · ${edicoesFeitas >= 5 ? '5/5 edições (limite)' : `${edicoesRestantes} edições rest.`}</span>`;

    const totClicks = Number(st.total || 0);
    const acessosVitrine = Number(st.acessos_vitrine ?? st.total ?? 0);
    const cliquesDestino = Number(st.cliques_destino ?? 0);
    const taxaConv = acessosVitrine > 0 ? Math.round((cliquesDestino / acessosVitrine) * 100) : 0;

    let funilVitrineHtml = '';
    if (link.tipo_link === 'vitrine') {
      funilVitrineHtml = `
        <div class="grid grid-cols-2 gap-1.5 pt-1.5 mt-1.5 text-[11px] border-t border-outline-variant/30">
          <div class="flex items-center gap-1 truncate" title="Pessoas que entraram e visualizaram a Página de Oferta">
            <span class="material-symbols-outlined text-xs text-primary">storefront</span>
            <span class="text-outline">Vitrine:</span>
            <strong class="text-on-surface font-mono">${acessosVitrine}</strong>
          </div>
          <div class="flex items-center gap-1 justify-end truncate" title="Pessoas que clicaram no botão para ir ao destino final (WhatsApp)">
            <span class="material-symbols-outlined text-xs text-secondary-dark">ads_click</span>
            <span class="text-outline">Destino:</span>
            <strong class="text-secondary-dark font-mono">${cliquesDestino} <span class="text-[10px] text-outline font-normal">(${taxaConv}%)</span></strong>
          </div>
        </div>
      `;
    }

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

    // Horário de Pico do Link
    const pico = state.picosHorarios[link.id];
    let textoPico = 'Sem cliques ainda';
    let temPico = false;
    if (pico && pico.hora_pico >= 0 && Number(pico.cliques_pico) > 0) {
      temPico = true;
      const hInicio = String(pico.hora_pico).padStart(2, '0');
      const hFim = String((pico.hora_pico + 1) % 24).padStart(2, '0');
      textoPico = `${hInicio}h - ${hFim}h (${Number(pico.cliques_pico).toLocaleString('pt-BR')} cliques)`;
    }

    const picoHorarioHtml = `
      <div class="pt-1.5 mt-1.5 border-t border-outline-variant/30 flex items-center justify-between gap-1 text-[11px]">
        <div class="flex items-center gap-1 truncate" title="${temPico ? `Horário com maior volume de cliques: ${textoPico}` : 'Nenhum clique registrado ainda'}">
          <span class="material-symbols-outlined text-xs ${temPico ? 'text-secondary-dark' : 'text-outline'}">schedule</span>
          <span class="text-outline font-medium">Pico:</span>
          <span class="font-bold ${temPico ? 'text-on-surface' : 'text-on-surface-variant'} font-mono">${textoPico}</span>
        </div>
        <button type="button" class="btn-abrir-horarios inline-flex items-center gap-0.5 text-primary hover:text-primary-container font-bold text-[11px] shrink-0 active:scale-95 transition-all cursor-pointer" data-link-id="${link.id}" data-link-titulo="${link.titulo || state.loja.nome}" data-link-slug="${link.slug}">
          <span>Gráfico</span>
          <span class="material-symbols-outlined text-xs">chevron_right</span>
        </button>
      </div>
    `;

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
          <!-- Selo Favicon no Canto Inferior Direito da Miniatura -->
          <div class="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs flex items-center justify-center pointer-events-none z-10" title="PostLink Oficial">
            <img src="/favicon-32x32.png" alt="Favicon" class="w-3.5 h-3.5 rounded-xs object-contain">
          </div>
        </div>

        <div class="flex items-center justify-between gap-1 mb-1">
          <h4 class="text-xs font-bold text-on-surface leading-snug line-clamp-1">
            ${link.titulo || state.loja.nome}
          </h4>
        </div>

        <div class="flex items-center justify-between gap-1 mb-2.5">
          <p class="text-[11px] font-mono text-primary truncate" title="${fullUrl}">
            /${state.loja.slug}/${link.slug}${versaoAtual > 1 ? `?v=${versaoAtual}` : ''}
          </p>
          <div class="flex items-center gap-1 shrink-0">${tipoBadgeHtml}${versaoBadgeHtml}</div>
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
          ${funilVitrineHtml}
          ${detalheStatsHtml}
          ${picoHorarioHtml}
        </div>
      </div>

      <div class="space-y-1.5 pt-1 border-t border-surface-container-high/60">
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" class="btn-copiar bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all" data-url="${fullUrl}" title="Copiar URL encurtada">
            <span class="material-symbols-outlined text-sm">content_copy</span> Copiar Link
          </button>
          <a href="https://wa.me/?text=${encodeURIComponent(montarTextoCompartilhamento(link.mensagem_compartilhamento, fullUrl, state.loja?.nome))}" target="_blank" class="bg-secondary hover:bg-secondary-dark text-white font-bold text-xs py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all" title="Compartilhar no WhatsApp com mensagem de divulgação">
            <span class="material-symbols-outlined text-sm">send</span> WhatsApp
          </a>
        </div>
        ${link.mensagem_compartilhamento ? `
        <button type="button" class="btn-copiar-msg-completa w-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-[11px] py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all" data-msg="${escapeHtml(montarTextoCompartilhamento(link.mensagem_compartilhamento, fullUrl, state.loja?.nome))}" title="Copiar texto de anúncio completo com link">
          <span class="material-symbols-outlined text-xs">chat</span> Copiar Mensagem Completa
        </button>` : ''}
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
        btn.innerHTML = '<span class="material-symbols-outlined text-sm">content_copy</span> Copiar Link';
      }, 1800);
      toast('Link copiado para a área de transferência!', 'success');
    });
  });

  document.querySelectorAll('.btn-copiar-msg-completa').forEach((btn) => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      if (msg) {
        navigator.clipboard.writeText(msg);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined text-xs">check</span> Mensagem Copiada! ✅';
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 1800);
        toast('Mensagem completa com link copiada para o WhatsApp!', 'success');
      }
    });
  });

  document.querySelectorAll('.btn-abrir-horarios').forEach((btn) => {
    btn.addEventListener('click', () => {
      const linkId = btn.dataset.linkId;
      const linkTitulo = btn.dataset.linkTitulo;
      const linkSlug = btn.dataset.linkSlug;
      abrirModalHorarios(linkId, linkTitulo, linkSlug);
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

    // Se estiver criando novo link e o campo estiver vazio, pré-preenche com o WhatsApp da loja
    if (el.waPhone && !el.waPhone.value.trim() && state.loja && state.loja.whatsapp && !state.linkEditando) {
      el.waPhone.value = formatarTelefoneVisual(state.loja.whatsapp);
      if (el.waPhoneOrigemBadge) el.waPhoneOrigemBadge.classList.remove('hidden');
    }
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

  // Reset dos campos da Página de Oferta (Vitrine)
  state.fotosExtrasVitrine = [];
  if (el.inputPrecoDe) el.inputPrecoDe.value = '';
  if (el.inputPrecoPor) el.inputPrecoPor.value = '';
  if (el.inputCondicaoPagamento) el.inputCondicaoPagamento.value = '';
  if (el.inputBeneficio1) el.inputBeneficio1.value = '';
  if (el.inputBeneficio2) el.inputBeneficio2.value = '';
  if (el.inputBeneficio3) el.inputBeneficio3.value = '';
  if (el.inputCtaLabel) el.inputCtaLabel.value = 'Pedir pelo WhatsApp';
  renderizarFotosExtrasVitrine();
  switchTipoLink('direto');

  switchDestTab('whatsapp');

  // Pré-define com o WhatsApp cadastrado do lojista
  if (el.waPhone && state.loja && state.loja.whatsapp) {
    el.waPhone.value = formatarTelefoneVisual(state.loja.whatsapp);
    if (el.waPhoneOrigemBadge) el.waPhoneOrigemBadge.classList.remove('hidden');
  } else if (el.waPhoneOrigemBadge) {
    el.waPhoneOrigemBadge.classList.add('hidden');
  }

  if (el.fetchMetaStatus) el.fetchMetaStatus.textContent = '';

  if (el.inputSlug) {
    el.inputSlug.value = slugAleatorio();
  }

  if (el.detalhesPersonalizar) {
    el.detalhesPersonalizar.open = false;
  }

  if (el.inputMensagemCompartilhamento) {
    el.inputMensagemCompartilhamento.value = '';
  }
  atualizarContadorMensagemCompartilhamento();

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
      if (el.waPhone) el.waPhone.value = formatarTelefoneVisual(tel);
      const msg = u.searchParams.get('text');
      if (el.presetMessage && msg) el.presetMessage.value = msg;

      // Exibe badge caso o número do link corresponda ao WhatsApp cadastrado do negócio
      const digitsLink = (tel || '').replace(/\D/g, '');
      const digitsLoja = (state.loja?.whatsapp || '').replace(/\D/g, '');
      if (el.waPhoneOrigemBadge) {
        if (digitsLink && digitsLoja && digitsLink === digitsLoja) {
          el.waPhoneOrigemBadge.classList.remove('hidden');
        } else {
          el.waPhoneOrigemBadge.classList.add('hidden');
        }
      }
    } catch (_) {
      if (el.inputDestino) el.inputDestino.value = link.destino;
    }
  } else {
    switchDestTab('url');
    if (el.inputDestino) el.inputDestino.value = link.destino;
    if (el.waPhoneOrigemBadge) el.waPhoneOrigemBadge.classList.add('hidden');
  }

  if (el.inputTitulo) el.inputTitulo.value = link.titulo || '';
  if (el.inputDescricao) el.inputDescricao.value = link.descricao || '';
  atualizarContadorDescricao();
  if (el.inputMensagemCompartilhamento) {
    el.inputMensagemCompartilhamento.value = link.mensagem_compartilhamento || '';
  }
  atualizarContadorMensagemCompartilhamento();
  if (el.inputSlug) el.inputSlug.value = link.slug;
  if (el.inputValidoAte) {
    el.inputValidoAte.value = link.valido_ate ? new Date(link.valido_ate).toISOString().slice(0, 16) : '';
  }

  // Preenche dados da Página de Oferta (Vitrine)
  if (el.inputPrecoDe) el.inputPrecoDe.value = link.preco_de || '';
  if (el.inputPrecoPor) el.inputPrecoPor.value = link.preco_por || '';
  if (el.inputCondicaoPagamento) el.inputCondicaoPagamento.value = link.condicao_pagamento || '';

  let bList = [];
  try {
    bList = Array.isArray(link.beneficios) ? link.beneficios : JSON.parse(link.beneficios || '[]');
  } catch (_) {
    bList = [];
  }
  if (el.inputBeneficio1) el.inputBeneficio1.value = bList[0] || '';
  if (el.inputBeneficio2) el.inputBeneficio2.value = bList[1] || '';
  if (el.inputBeneficio3) el.inputBeneficio3.value = bList[2] || '';
  if (el.inputCtaLabel) el.inputCtaLabel.value = link.cta_label || 'Pedir pelo WhatsApp';

  try {
    state.fotosExtrasVitrine = Array.isArray(link.fotos_galeria) ? link.fotos_galeria : JSON.parse(link.fotos_galeria || '[]');
  } catch (_) {
    state.fotosExtrasVitrine = [];
  }
  renderizarFotosExtrasVitrine();

  switchTipoLink(link.tipo_link || 'direto');

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

// Monta o texto de divulgação persuasivo substituindo tags {link} e {loja}
function montarTextoCompartilhamento(mensagemCustom = '', urlLink = '', nomeLoja = '') {
  const urlComRastreioWa = urlLink ? adicionarParametroUrl(urlLink, 'src', 'wa') : '';
  const lojaNome = nomeLoja || (state.loja ? state.loja.nome : '');

  if (!mensagemCustom || !mensagemCustom.trim()) {
    return urlComRastreioWa;
  }

  let texto = mensagemCustom.trim();

  // Substitui tags dinâmicas se existirem
  if (urlComRastreioWa) {
    texto = texto.replace(/\{link\}/gi, urlComRastreioWa);
  }
  texto = texto.replace(/\{loja\}/gi, lojaNome);

  // Se o usuário não colocou a tag {link}, anexa automaticamente ao final
  if (urlComRastreioWa && !/\{link\}/i.test(mensagemCustom)) {
    texto = `${texto}\n\n👉 Acesse aqui: ${urlComRastreioWa}`;
  }

  return texto;
}

// Atualiza contador de caracteres da mensagem de divulgação (máx. 1.000)
function atualizarContadorMensagemCompartilhamento() {
  if (!el.contadorMensagemCompartilhamento) return;
  const len = el.inputMensagemCompartilhamento ? el.inputMensagemCompartilhamento.value.length : 0;
  el.contadorMensagemCompartilhamento.textContent = `${len} / 1000`;

  if (len >= 1000) {
    el.contadorMensagemCompartilhamento.className = 'text-xs font-mono font-bold text-error';
  } else if (len >= 900) {
    el.contadorMensagemCompartilhamento.className = 'text-xs font-mono font-semibold text-amber-500';
  } else {
    el.contadorMensagemCompartilhamento.className = 'text-xs font-mono font-semibold text-outline';
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

  // Preview da Mensagem de Divulgação no Balão do WhatsApp
  const waPreviewMsg = el.waPreviewMsgTexto || document.getElementById('wa-preview-msg-texto');
  const msgComp = el.inputMensagemCompartilhamento ? el.inputMensagemCompartilhamento.value.trim() : '';
  if (waPreviewMsg) {
    if (msgComp) {
      const slugAtual = (el.inputSlug && el.inputSlug.value.trim()) || 'minha-oferta';
      const linkExemplo = `https://${hostAtual}/${state.loja ? state.loja.slug : 'loja'}/${slugAtual}`;
      const textoFormatado = montarTextoCompartilhamento(msgComp, linkExemplo, lojaNome);
      waPreviewMsg.textContent = textoFormatado;
      waPreviewMsg.classList.remove('hidden');
    } else {
      waPreviewMsg.textContent = '';
      waPreviewMsg.classList.add('hidden');
    }
  }

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
    const spanHost = el.waCardHost.querySelector('span');
    if (spanHost) {
      spanHost.textContent = hostAtual;
    } else {
      el.waCardHost.innerHTML = `<img src="/favicon-32x32.png" alt="Favicon" class="w-3.5 h-3.5 rounded-xs inline-block shrink-0"><span>${escapeHtml(hostAtual)}</span>`;
    }
  }

  // Preview Redes Sociais
  if (el.ptSocial) el.ptSocial.textContent = titulo;
  if (el.pdSocial) {
    el.pdSocial.textContent = desc || 'Clique para acessar e conferir todos os detalhes.';
  }
  if (el.socialCardHost) {
    const spanSocial = el.socialCardHost.querySelector('span');
    if (spanSocial) {
      spanSocial.textContent = hostAtual;
    } else {
      el.socialCardHost.innerHTML = `<img src="/favicon-32x32.png" alt="Favicon" class="w-3.5 h-3.5 rounded-xs inline-block shrink-0"><span>${escapeHtml(hostAtual)}</span>`;
    }
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

  // Sincroniza Preview da Página de Oferta (Vitrine)
  if (el.ptVitrine) el.ptVitrine.textContent = titulo;
  if (el.pdVitrine) el.pdVitrine.textContent = desc || 'Descrição da oferta.';
  if (el.vitrineNomeLoja) el.vitrineNomeLoja.textContent = lojaNome;
  if (state.loja?.logo_url && el.vitrineAvatarImg) {
    el.vitrineAvatarImg.src = state.loja.logo_url;
    el.vitrineAvatarImg.classList.remove('hidden');
    if (el.vitrineAvatarLoja) el.vitrineAvatarLoja.classList.add('hidden');
  } else {
    if (el.vitrineAvatarImg) {
      el.vitrineAvatarImg.classList.add('hidden');
      el.vitrineAvatarImg.src = '';
    }
    if (el.vitrineAvatarLoja) {
      el.vitrineAvatarLoja.classList.remove('hidden');
      el.vitrineAvatarLoja.textContent = (lojaNome || 'L').charAt(0).toUpperCase();
    }
  }

  const precoDe = el.inputPrecoDe ? Number(el.inputPrecoDe.value) : 0;
  const precoPor = el.inputPrecoPor ? Number(el.inputPrecoPor.value) : 0;

  if (el.vitrinePrecoDe) {
    if (precoDe > 0) {
      el.vitrinePrecoDe.textContent = `De ${precoDe.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
      el.vitrinePrecoDe.classList.remove('hidden');
    } else {
      el.vitrinePrecoDe.classList.add('hidden');
    }
  }

  if (el.vitrinePrecoPor) {
    if (precoPor > 0) {
      el.vitrinePrecoPor.textContent = precoPor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      if (el.vitrineBlocoPreco) el.vitrineBlocoPreco.classList.remove('hidden');
    } else if (precoDe > 0) {
      el.vitrinePrecoPor.textContent = precoDe.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      if (el.vitrineBlocoPreco) el.vitrineBlocoPreco.classList.remove('hidden');
    } else {
      if (el.vitrineBlocoPreco) el.vitrineBlocoPreco.classList.add('hidden');
    }
  }

  if (el.vitrineBadgeDesconto) {
    if (precoDe > 0 && precoPor > 0 && precoDe > precoPor) {
      const descPct = Math.round(((precoDe - precoPor) / precoDe) * 100);
      el.vitrineBadgeDesconto.textContent = `-${descPct}%`;
      el.vitrineBadgeDesconto.classList.remove('hidden');
    } else {
      el.vitrineBadgeDesconto.classList.add('hidden');
    }
  }

  const cond = el.inputCondicaoPagamento ? el.inputCondicaoPagamento.value.trim() : '';
  if (el.vitrineCondicao) {
    el.vitrineCondicao.textContent = cond;
    el.vitrineCondicao.style.display = cond ? 'block' : 'none';
  }

  // Destaques / Benefícios
  const b1 = el.inputBeneficio1 ? el.inputBeneficio1.value.trim() : '';
  const b2 = el.inputBeneficio2 ? el.inputBeneficio2.value.trim() : '';
  const b3 = el.inputBeneficio3 ? el.inputBeneficio3.value.trim() : '';
  const listBeneficios = [b1, b2, b3].filter(Boolean);

  if (el.vitrineListaBeneficios) {
    if (listBeneficios.length > 0) {
      el.vitrineListaBeneficios.innerHTML = listBeneficios
        .map(b => `<li class="flex items-center gap-1.5"><span class="text-secondary-dark font-bold text-xs">✓</span> ${escapeHtml(b)}</li>`)
        .join('');
      if (el.vitrineBlocoBeneficios) el.vitrineBlocoBeneficios.classList.remove('hidden');
    } else {
      if (el.vitrineBlocoBeneficios) el.vitrineBlocoBeneficios.classList.add('hidden');
    }
  }

  const ctaTxt = (el.inputCtaLabel && el.inputCtaLabel.value.trim()) || 'Pedir pelo WhatsApp';
  if (el.vitrineBtnLabel) el.vitrineBtnLabel.textContent = ctaTxt;

  // Imagem no preview da Vitrine
  if (el.im && !el.im.classList.contains('hidden') && el.im.src) {
    if (el.imVitrine) {
      el.imVitrine.src = el.im.src;
      el.imVitrine.classList.remove('hidden');
    }
    if (el.phVitrine) el.phVitrine.classList.add('hidden');
  } else {
    if (el.imVitrine) {
      el.imVitrine.classList.add('hidden');
      el.imVitrine.src = '';
    }
    if (el.phVitrine) el.phVitrine.classList.remove('hidden');
  }
}

// Controle de Abas no Preview (WhatsApp vs Redes Sociais vs Vitrine)
function setPreviewTab(tab) {
  const isWa = tab === 'wa';
  const isSocial = tab === 'social';
  const isVitrine = tab === 'vitrine';

  if (el.previewFrameWa) el.previewFrameWa.classList.toggle('hidden', !isWa);
  if (el.previewFrameSocial) el.previewFrameSocial.classList.toggle('hidden', !isSocial);
  if (el.previewFrameVitrine) el.previewFrameVitrine.classList.toggle('hidden', !isVitrine);

  if (el.previewTabWa) {
    el.previewTabWa.className = isWa
      ? 'flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest text-primary font-bold shadow-2xs transition-all'
      : 'flex items-center gap-1 px-2.5 py-1 rounded-md text-on-surface-variant hover:text-on-surface transition-all';
  }
  if (el.previewTabSocial) {
    el.previewTabSocial.className = isSocial
      ? 'flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest text-primary font-bold shadow-2xs transition-all'
      : 'flex items-center gap-1 px-2.5 py-1 rounded-md text-on-surface-variant hover:text-on-surface transition-all';
  }
  if (el.previewTabVitrine) {
    el.previewTabVitrine.className = isVitrine
      ? 'flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-lowest text-primary font-bold shadow-2xs transition-all'
      : 'flex items-center gap-1 px-2.5 py-1 rounded-md text-on-surface-variant hover:text-on-surface transition-all';
  }
}

if (el.previewTabWa) el.previewTabWa.addEventListener('click', () => setPreviewTab('wa'));
if (el.previewTabSocial) el.previewTabSocial.addEventListener('click', () => setPreviewTab('social'));
if (el.previewTabVitrine) el.previewTabVitrine.addEventListener('click', () => setPreviewTab('vitrine'));

// Controle do Tipo de Experiência do Link (Direto vs Vitrine)
function switchTipoLink(tipo = 'direto') {
  state.tipoLink = tipo;
  const isVitrine = tipo === 'vitrine';

  if (el.btnTipoDireto) {
    el.btnTipoDireto.className = isVitrine
      ? 'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-on-surface-variant hover:text-on-surface text-xs font-medium transition-all'
      : 'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-container-lowest text-primary text-xs font-bold shadow-xs transition-all';
  }
  if (el.btnTipoVitrine) {
    el.btnTipoVitrine.className = isVitrine
      ? 'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-container-lowest text-primary text-xs font-bold shadow-xs transition-all'
      : 'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-on-surface-variant hover:text-on-surface text-xs font-medium transition-all';
  }
  if (el.badgeTipoLink) {
    el.badgeTipoLink.textContent = isVitrine ? 'Página de Oferta' : 'Redirecionamento Rápido';
    el.badgeTipoLink.className = isVitrine
      ? 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container'
      : 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant';
  }
  if (el.descTipoLink) {
    el.descTipoLink.textContent = isVitrine
      ? 'Apresenta detalhes completos, preço e fotos antes do comprador abrir o WhatsApp ou destino final.'
      : 'Transição rápida (<1s) levando o visitante diretamente ao seu link ou conversa no WhatsApp.';
  }
  if (el.boxCamposVitrine) {
    el.boxCamposVitrine.classList.toggle('hidden', !isVitrine);
  }

  if (isVitrine) {
    setPreviewTab('vitrine');
  } else {
    setPreviewTab('wa');
  }
  atualizarLivePreview();
}

if (el.btnTipoDireto) el.btnTipoDireto.addEventListener('click', () => switchTipoLink('direto'));
if (el.btnTipoVitrine) el.btnTipoVitrine.addEventListener('click', () => switchTipoLink('vitrine'));

// Listeners de atualização em tempo real para campos da Vitrine
[
  el.inputPrecoDe,
  el.inputPrecoPor,
  el.inputCondicaoPagamento,
  el.inputBeneficio1,
  el.inputBeneficio2,
  el.inputBeneficio3,
  el.inputCtaLabel,
].forEach((input) => {
  if (input) {
    input.addEventListener('input', atualizarLivePreview);
  }
});

// Botão de sugestão de destaques da oferta com IA
if (el.btnIaBeneficios) {
  el.btnIaBeneficios.addEventListener('click', async () => {
    const contexto = (el.inputTitulo && el.inputTitulo.value.trim()) ||
                     (el.inputDescricao && el.inputDescricao.value.trim()) ||
                     (state.loja && state.loja.nome) || '';
    if (!contexto) {
      toast('Preencha ao menos o título ou descrição da oferta para sugerir os destaques.', 'info');
      return;
    }

    el.btnIaBeneficios.disabled = true;
    el.btnIaBeneficios.innerHTML = '<span class="material-symbols-outlined text-xs animate-spin">refresh</span><span>Sugerindo...</span>';

    try {
      const res = await fetch('/api/ia-gerar-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loja_id: state.user?.id,
          contexto: contexto,
          tipo_acao: 'beneficios',
          tom: state.ia?.tomSelecionado || 'urgencia',
        }),
      });

      if (res.ok) {
        const dados = await res.json();
        const opcao = dados.sugestoes?.[0];
        if (opcao && Array.isArray(opcao.beneficios) && opcao.beneficios.length > 0) {
          if (el.inputBeneficio1) el.inputBeneficio1.value = opcao.beneficios[0] || '';
          if (el.inputBeneficio2) el.inputBeneficio2.value = opcao.beneficios[1] || '';
          if (el.inputBeneficio3) el.inputBeneficio3.value = opcao.beneficios[2] || '';
          if (opcao.condicao_pagamento && el.inputCondicaoPagamento && !el.inputCondicaoPagamento.value) {
            el.inputCondicaoPagamento.value = opcao.condicao_pagamento;
          }
          if (opcao.cta_label && el.inputCtaLabel && !el.inputCtaLabel.value) {
            el.inputCtaLabel.value = opcao.cta_label;
          }
          atualizarLivePreview();
          toast('Destaques da oferta sugeridos com sucesso!', 'success');
        }
      }
    } catch (_) {
      toast('Não foi possível gerar sugestões automáticas no momento.', 'error');
    } finally {
      el.btnIaBeneficios.disabled = false;
      el.btnIaBeneficios.innerHTML = '<span class="material-symbols-outlined text-xs">auto_awesome</span><span>Sugerir com IA</span>';
    }
  });
}

// Renderização das fotos extras da Página de Oferta (Vitrine)
function renderizarFotosExtrasVitrine() {
  if (!el.containerFotosExtrasVitrine) return;
  const fotos = Array.isArray(state.fotosExtrasVitrine) ? state.fotosExtrasVitrine : [];

  if (fotos.length === 0) {
    el.containerFotosExtrasVitrine.innerHTML = `
      <span class="text-[11px] text-outline" id="label-nenhuma-foto-extra">
        Nenhuma foto adicional selecionada. O banner principal será a foto de destaque.
      </span>
    `;
    return;
  }

  el.containerFotosExtrasVitrine.innerHTML = fotos.map((fotoPath, idx) => {
    const url = resolverUrlImagem(fotoPath);
    return `
      <div class="relative w-16 h-16 rounded-xl border border-outline-variant/70 overflow-hidden group shadow-xs bg-surface-container-high flex items-center justify-center shrink-0">
        <img src="${url}" alt="Foto adicional ${idx + 1}" class="max-w-full max-h-full object-contain p-1" onerror="tratarErroImagemGaleria(this, '${escapeHtml(fotoPath)}')">
        <button type="button" class="btn-remover-foto-extra absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 hover:bg-error text-white text-[10px] flex items-center justify-center transition-all shadow-xs z-10" data-index="${idx}" title="Remover foto">
          ✕
        </button>
      </div>
    `;
  }).join('');

  el.containerFotosExtrasVitrine.querySelectorAll('.btn-remover-foto-extra').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.index);
      if (!isNaN(idx) && idx >= 0 && idx < state.fotosExtrasVitrine.length) {
        state.fotosExtrasVitrine.splice(idx, 1);
        renderizarFotosExtrasVitrine();
      }
    });
  });
}

// Botão para adicionar fotos extras na Vitrine
if (el.btnAdicionarFotoGaleriaVitrine) {
  el.btnAdicionarFotoGaleriaVitrine.addEventListener('click', () => {
    if (Array.isArray(state.fotosExtrasVitrine) && state.fotosExtrasVitrine.length >= 4) {
      toast('Você já adicionou o limite de 4 fotos adicionais na oferta.', 'info');
      return;
    }
    abrirModalSelecaoGaleria('vitrine_extra');
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
if (el.inputMensagemCompartilhamento) {
  el.inputMensagemCompartilhamento.addEventListener('input', () => {
    atualizarContadorMensagemCompartilhamento();
    atualizarLivePreview();
  });
}

if (el.waPhone) {
  aplicarMascaraTelefoneInput(el.waPhone);
  el.waPhone.addEventListener('input', () => {
    if (el.eDest) el.eDest.textContent = '';
    if (el.waPhoneOrigemBadge) {
      const digitsInput = el.waPhone.value.replace(/\D/g, '');
      const digitsLoja = (state.loja?.whatsapp || '').replace(/\D/g, '');
      if (digitsInput && digitsLoja && digitsInput === digitsLoja) {
        el.waPhoneOrigemBadge.classList.remove('hidden');
      } else {
        el.waPhoneOrigemBadge.classList.add('hidden');
      }
    }
  });
}

// Montar Destino Final
function obterDestinoNormalizado() {
  if (state.tipoDestino === 'whatsapp') {
    const rawTel = el.waPhone ? el.waPhone.value.replace(/\D/g, '') : '';
    if (!rawTel || rawTel.length < 10) {
      return null;
    }
    let telComDDI = rawTel;
    if (rawTel.length === 10 || rawTel.length === 11) {
      telComDDI = `55${rawTel}`;
    } else if (rawTel.length >= 12 && !rawTel.startsWith('55')) {
      telComDDI = `55${rawTel}`;
    }
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
      // 1. Garantir que a sessão de autenticação do lojista está ativa e com token renovado
      let userAtual = state.user;
      try {
        const { data: sessionData } = await sb.auth.getSession();
        let session = sessionData?.session;
        if (!session) {
          const { data: refreshData, error: refreshErr } = await sb.auth.refreshSession();
          if (!refreshErr && refreshData?.session) {
            session = refreshData.session;
          }
        }
        if (session && session.user) {
          state.user = session.user;
          userAtual = session.user;
        } else {
          toast('Sua sessão expirou por segurança. Faça login novamente para salvar.', 'error');
          setTimeout(() => { window.location.href = '/login/'; }, 1500);
          return;
        }
      } catch (authErr) {
        console.warn('Verificação de sessão preventiva:', authErr);
      }

      const titulo = (el.inputTitulo && el.inputTitulo.value.trim()) || null;
      const descricao = (el.inputDescricao && el.inputDescricao.value.trim()) || null;
      const slugDesejado = (el.inputSlug && limparSlug(el.inputSlug.value.trim())) || null;
      const validoAte = (el.inputValidoAte && el.inputValidoAte.value) ? new Date(el.inputValidoAte.value).toISOString() : null;
      const mensagemCompartilhamento = (el.inputMensagemCompartilhamento && el.inputMensagemCompartilhamento.value.trim()) || null;

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

        // A cada alteração (imagem, destino, telefone, textos, mensagem de divulgação ou slug), a versão é SEMPRE incrementada
        const versao = versaoAtual + 1;
        let caminhoImagem = state.linkEditando.imagem_path;

        if (state.arquivoBlob) {
          caminhoImagem = `${userAtual.id}/${state.linkEditando.id}-v${versao}.jpg`;
          const resUp = await uploadImagemOtimizada(state.arquivoBlob, caminhoImagem);
          caminhoImagem = resUp.caminho;
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
            mensagem_compartilhamento: mensagemCompartilhamento,
            tipo_link: state.tipoLink || 'direto',
            preco_de: el.inputPrecoDe && el.inputPrecoDe.value ? Number(el.inputPrecoDe.value) : null,
            preco_por: el.inputPrecoPor && el.inputPrecoPor.value ? Number(el.inputPrecoPor.value) : null,
            condicao_pagamento: el.inputCondicaoPagamento ? el.inputCondicaoPagamento.value.trim() : null,
            beneficios: [
              el.inputBeneficio1?.value.trim(),
              el.inputBeneficio2?.value.trim(),
              el.inputBeneficio3?.value.trim(),
            ].filter(Boolean),
            cta_label: el.inputCtaLabel ? el.inputCtaLabel.value.trim() || 'Pedir pelo WhatsApp' : 'Pedir pelo WhatsApp',
            fotos_galeria: state.fotosExtrasVitrine || [],
          })
          .eq('id', state.linkEditando.id);

        if (errUpdate) throw errUpdate;

        toast(`Link atualizado com sucesso! (Versão ${versao})`, 'success');
        const linkPronto = montarUrlLink(state.loja.slug, slugFinal, versao);
        exibirResultadoCriado(linkPronto, versao, mensagemCompartilhamento);
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
          caminhoImagem = `${userAtual.id}/${linkId}-v${versao}.jpg`;
          const resUp = await uploadImagemOtimizada(state.arquivoBlob, caminhoImagem);
          caminhoImagem = resUp.caminho;
        }

        let slugFinal = slugDesejado;
        let sucesso = false;

        for (let i = 0; i < 5; i++) {
          const slugTentativa = slugFinal || slugAleatorio();
          const { error: errInsert } = await sb.from('links').insert({
            id: linkId,
            loja_id: userAtual.id,
            slug: slugTentativa,
            destino,
            imagem_path: caminhoImagem,
            versao,
            titulo,
            descricao,
            valido_ate: validoAte,
            ativo: true,
            mensagem_compartilhamento: mensagemCompartilhamento,
            tipo_link: state.tipoLink || 'direto',
            preco_de: el.inputPrecoDe && el.inputPrecoDe.value ? Number(el.inputPrecoDe.value) : null,
            preco_por: el.inputPrecoPor && el.inputPrecoPor.value ? Number(el.inputPrecoPor.value) : null,
            condicao_pagamento: el.inputCondicaoPagamento ? el.inputCondicaoPagamento.value.trim() : null,
            beneficios: [
              el.inputBeneficio1?.value.trim(),
              el.inputBeneficio2?.value.trim(),
              el.inputBeneficio3?.value.trim(),
            ].filter(Boolean),
            cta_label: el.inputCtaLabel ? el.inputCtaLabel.value.trim() || 'Pedir pelo WhatsApp' : 'Pedir pelo WhatsApp',
            fotos_galeria: state.fotosExtrasVitrine || [],
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

        const linkPronto = montarUrlLink(state.loja.slug, slugFinal, 1);
        exibirResultadoCriado(linkPronto, 1, mensagemCompartilhamento);
        carregarGaleriaFotos(true);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('row-level security') || err.code === '42501') {
        toast('Sua sessão expirou ou não tem permissão para esta loja. Faça login novamente.', 'error');
      } else {
        toast('Erro ao salvar link: ' + msg, 'error');
      }
    }
    } finally {
      if (el.btnSubmeterLink) {
        el.btnSubmeterLink.disabled = false;
        el.btnSubmeterLink.textContent = state.linkEditando ? 'Salvar Alterações' : 'Criar Link Inteligente';
      }
    }
  });
}

function exibirResultadoCriado(url, versao = 1, mensagemCompartilhamentoParam = null) {
  const isAtualizacao = Number(versao) > 1;
  const urlComRastreioWa = adicionarParametroUrl(url, 'src', 'wa');
  const msgSalva = mensagemCompartilhamentoParam !== null
    ? mensagemCompartilhamentoParam
    : (el.inputMensagemCompartilhamento ? el.inputMensagemCompartilhamento.value.trim() : '');
  
  const textoCompartilhamentoCompleto = montarTextoCompartilhamento(msgSalva, url, state.loja ? state.loja.nome : '');

  if (el.res) {
    el.res.classList.remove('hidden');
    if (el.ru) el.ru.textContent = url;
    if (el.btnShareInline) {
      el.btnShareInline.href = `https://wa.me/?text=${encodeURIComponent(textoCompartilhamentoCompleto)}`;
    }
  }

  if (el.modalSucesso && el.modalInputLink) {
    el.modalInputLink.value = url;

    // Atualiza botão principal de WhatsApp com o texto de divulgação completo montado
    if (el.modalBtnWhatsapp) {
      el.modalBtnWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(textoCompartilhamentoCompleto)}`;
    }

    // Exibe ou oculta a caixa de preview da mensagem de envio
    const boxMsg = el.modalSucessoBoxMensagem || document.getElementById('modal-sucesso-box-mensagem');
    const txtPreview = el.modalSucessoTextoPreview || document.getElementById('modal-sucesso-texto-preview');
    const cntChars = el.modalSucessoContadorChars || document.getElementById('modal-sucesso-contador-chars');
    const btnCopiarCompleto = el.modalBtnCopiarCompleto || document.getElementById('modal-btn-copiar-completo');

    if (msgSalva && msgSalva.trim()) {
      if (boxMsg) boxMsg.classList.remove('hidden');
      if (txtPreview) txtPreview.textContent = textoCompartilhamentoCompleto;
      if (cntChars) cntChars.textContent = `${textoCompartilhamentoCompleto.length} caracteres`;
      if (btnCopiarCompleto) {
        btnCopiarCompleto.classList.remove('hidden');
        btnCopiarCompleto.dataset.texto = textoCompartilhamentoCompleto;
      }
    } else {
      if (boxMsg) boxMsg.classList.add('hidden');
      if (btnCopiarCompleto) btnCopiarCompleto.classList.add('hidden');
    }

    if (el.modalSucessoTitulo) {
      el.modalSucessoTitulo.textContent = isAtualizacao ? 'Link Atualizado!' : 'Link Criado com Sucesso!';
    }

    if (el.modalSucessoBadgeVersao) {
      if (isAtualizacao) {
        el.modalSucessoBadgeVersao.classList.remove('hidden');
        el.modalSucessoBadgeVersao.classList.add('inline-flex');
        if (el.modalSucessoBadgeTexto) {
          el.modalSucessoBadgeTexto.textContent = `Versão ${versao} (Prévia renovada)`;
        }
      } else {
        el.modalSucessoBadgeVersao.classList.add('hidden');
        el.modalSucessoBadgeVersao.classList.remove('inline-flex');
      }
    }

    if (el.modalSucessoSubtitulo) {
      el.modalSucessoSubtitulo.textContent = isAtualizacao
        ? `O sufixo ?v=${versao} garante que o WhatsApp e redes sociais mostrem sua nova imagem e textos atualizados sem travar na prévia anterior!`
        : 'Seu cartão em alta definição e mensagem de divulgação estão prontos para envio no WhatsApp.';
    }

    el.modalSucesso.classList.remove('hidden');
  }

  toast(isAtualizacao ? `Link atualizado para v${versao} com sucesso!` : 'Link inteligente criado com sucesso!', 'success');
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
      const spanTexto = el.modalBtnCopiarTexto || document.getElementById('modal-btn-copiar-texto');
      if (spanTexto) {
        const textoOriginal = spanTexto.textContent;
        spanTexto.textContent = 'Copiado! ✅';
        setTimeout(() => { spanTexto.textContent = textoOriginal; }, 2000);
      }
      toast('Link copiado!', 'success');
    }
  });
}

if (el.modalBtnCopiarCompleto) {
  el.modalBtnCopiarCompleto.addEventListener('click', () => {
    const texto = el.modalBtnCopiarCompleto.dataset.texto || (el.modalSucessoTextoPreview ? el.modalSucessoTextoPreview.textContent : '');
    if (texto) {
      navigator.clipboard.writeText(texto);
      const spanTexto = el.modalBtnCopiarCompletoTexto || document.getElementById('modal-btn-copiar-completo-texto');
      if (spanTexto) {
        const textoOriginal = spanTexto.textContent;
        spanTexto.textContent = 'Mensagem com Link Copiada! ✅';
        setTimeout(() => { spanTexto.textContent = textoOriginal; }, 2000);
      }
      toast('Mensagem completa com link copiada para a área de transferência!', 'success');
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
    el.btnAssinarTexto.textContent = `Assinar ${valorTexto} no Cartão (Recorrência Automática)`;
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
      const url = `/api/mp-verificar-pagamento?payment_id=${encodeURIComponent(paymentId)}&loja_id=${encodeURIComponent(state.loja?.id || '')}&plano=${encodeURIComponent(plano)}&ciclo=${encodeURIComponent(billingCycle)}&tipo=avulso_pix`;
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
          state.assinatura.ciclo = billingCycle;
          state.assinatura.tipo_cobranca = 'avulso_pix';
          state.assinatura.valido_ate = new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 86400000).toISOString();
          state.assinatura.cancelar_ao_fim_do_periodo = false;
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
      const url = `/api/mp-verificar-pagamento?simular_aprovacao=true&payment_id=${encodeURIComponent(paymentIdAtual)}&loja_id=${encodeURIComponent(state.loja?.id || '')}&plano=${encodeURIComponent(planoSelecionado)}&ciclo=${encodeURIComponent(billingCycle)}&tipo=avulso_pix`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.aprovado) {
        if (pollingPixInterval) clearInterval(pollingPixInterval);
        if (timerPixInterval) clearInterval(timerPixInterval);
        if (state.assinatura) {
          state.assinatura.status = 'ativo';
          state.assinatura.plano = planoSelecionado;
          state.assinatura.ciclo = billingCycle;
          state.assinatura.tipo_cobranca = 'avulso_pix';
          state.assinatura.valido_ate = new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 86400000).toISOString();
          state.assinatura.cancelar_ao_fim_do_periodo = false;
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

// CONTA & PERFIL
function prepararTelaConta() {
  if (el.contaEmail && state.user) el.contaEmail.textContent = state.user.email;
  if (el.contaLojaNome && state.loja) el.contaLojaNome.textContent = state.loja.nome;
  if (el.contaLojaSlug && state.loja) el.contaLojaSlug.textContent = `/${state.loja.slug}`;

  if (state.assinatura) {
    const p = obterPlanoAtual();
    const statusUpper = (state.assinatura.status || 'trial').toUpperCase();
    if (el.contaStatus) {
      el.contaStatus.textContent = statusUpper;
      if (state.assinatura.status === 'ativo') {
        el.contaStatus.className = 'bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-bold text-xs tracking-wide';
      } else if (state.assinatura.status === 'trial') {
        el.contaStatus.className = 'bg-primary-fixed text-primary px-2.5 py-0.5 rounded-full font-bold text-xs tracking-wide';
      } else {
        el.contaStatus.className = 'bg-error-container text-error px-2.5 py-0.5 rounded-full font-bold text-xs tracking-wide';
      }
    }

    if (el.contaPlanoNome) {
      el.contaPlanoNome.textContent = p.nome;
    }

    // Modalidade de Cobrança
    if (el.contaModalidade) {
      if (state.assinatura.status === 'trial') {
        el.contaModalidade.textContent = 'Período de Teste Grátis (7 dias)';
      } else if (state.assinatura.tipo_cobranca === 'recorrente_cartao') {
        const cicloNome = state.assinatura.ciclo === 'yearly' ? 'Anual' : 'Mensal';
        el.contaModalidade.textContent = `Assinatura ${cicloNome} Automática (Cartão de Crédito)`;
      } else {
        el.contaModalidade.textContent = 'Renovação Manual (PIX)';
      }
    }

    // Vencimento / Próxima cobrança
    const cancelado = Boolean(state.assinatura.cancelar_ao_fim_do_periodo);
    const dataRef = state.assinatura.status === 'trial'
      ? (state.assinatura.trial_ate ? new Date(state.assinatura.trial_ate) : null)
      : (state.assinatura.valido_ate ? new Date(state.assinatura.valido_ate) : null);

    const diffDias = dataRef ? Math.max(0, Math.ceil((dataRef - new Date()) / (1000 * 60 * 60 * 24))) : 0;
    const dataStr = dataRef ? dataRef.toLocaleDateString('pt-BR') : 'Não definido';

    if (el.contaLabelVencimento) {
      if (state.assinatura.status === 'trial') {
        el.contaLabelVencimento.textContent = 'Teste expira em:';
      } else if (state.assinatura.tipo_cobranca === 'recorrente_cartao' && !cancelado) {
        el.contaLabelVencimento.textContent = 'Próxima renovação:';
      } else {
        el.contaLabelVencimento.textContent = 'Válido até:';
      }
    }

    if (el.contaVencimento) {
      el.contaVencimento.textContent = `${dataStr} (${diffDias} dia${diffDias === 1 ? '' : 's'} restante${diffDias === 1 ? '' : 's'})`;
    }

    // Aviso de Cancelamento Ativo
    if (el.boxCancelamentoAtivo) {
      if (cancelado) {
        el.boxCancelamentoAtivo.classList.remove('hidden');
        if (el.contaDataFimAcesso) el.contaDataFimAcesso.textContent = dataStr;
      } else {
        el.boxCancelamentoAtivo.classList.add('hidden');
      }
    }

    // Botão de Cancelar Renovação (apenas se for cartão recorrente e ainda não cancelado)
    if (el.boxBtnCancelarRecorrencia) {
      if (state.assinatura.status === 'ativo' && state.assinatura.tipo_cobranca === 'recorrente_cartao' && !cancelado) {
        el.boxBtnCancelarRecorrencia.classList.remove('hidden');
      } else {
        el.boxBtnCancelarRecorrencia.classList.add('hidden');
      }
    }
  }

  if (el.contaResponsavel && state.loja) {
    el.contaResponsavel.textContent = state.loja.responsavel_nome || 'Não informado';
  }
  if (el.contaWhatsapp && state.loja) {
    el.contaWhatsapp.textContent = formatarTelefoneVisual(state.loja.whatsapp) || 'Não informado';
  }
  if (el.contaLocalizacao && state.loja) {
    const loc = [state.loja.cidade, state.loja.estado].filter(Boolean).join(' - ');
    el.contaLocalizacao.textContent = loc || 'Não informado';
  }
  if (el.contaRamo && state.loja) {
    el.contaRamo.textContent = state.loja.ramo_atividade || 'Não informado';
  }
  if (el.contaExpectativa && state.loja) {
    let exp = state.loja.expectativa || 'Não informado';
    if (state.loja.expectativa_detalhes) {
      exp += ` ("${state.loja.expectativa_detalhes}")`;
    }
    el.contaExpectativa.textContent = exp;
  }

  // Logotipo da Loja
  if (state.loja?.logo_url) {
    if (el.contaLogoImg) {
      el.contaLogoImg.src = state.loja.logo_url;
      el.contaLogoImg.classList.remove('hidden');
    }
    if (el.contaLogoPlaceholder) el.contaLogoPlaceholder.classList.add('hidden');
    if (el.btnRemoverContaLogo) el.btnRemoverContaLogo.classList.remove('hidden');
  } else {
    if (el.contaLogoImg) {
      el.contaLogoImg.src = '';
      el.contaLogoImg.classList.add('hidden');
    }
    if (el.contaLogoPlaceholder) {
      el.contaLogoPlaceholder.textContent = (state.loja?.nome || 'L').charAt(0).toUpperCase();
      el.contaLogoPlaceholder.classList.remove('hidden');
    }
    if (el.btnRemoverContaLogo) el.btnRemoverContaLogo.classList.add('hidden');
  }
}

// Handlers de Cancelamento de Assinatura Recorrente
if (el.btnCancelarAssinaturaPainel) {
  el.btnCancelarAssinaturaPainel.addEventListener('click', () => {
    if (!el.modalConfirmarCancelamento) return;
    const validoAte = state.assinatura?.valido_ate ? new Date(state.assinatura.valido_ate) : null;
    if (el.modalCancelarDataFim) {
      el.modalCancelarDataFim.textContent = validoAte ? validoAte.toLocaleDateString('pt-BR') : 'o final do ciclo';
    }
    el.modalConfirmarCancelamento.classList.remove('hidden');
  });
}

if (el.btnFecharModalCancelamento) {
  el.btnFecharModalCancelamento.addEventListener('click', () => {
    if (el.modalConfirmarCancelamento) el.modalConfirmarCancelamento.classList.add('hidden');
  });
}

if (el.btnConfirmarCancelamentoRecorrencia) {
  el.btnConfirmarCancelamentoRecorrencia.addEventListener('click', async () => {
    if (!state.loja) return;
    const btn = el.btnConfirmarCancelamentoRecorrencia;
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>Cancelando...</span>';

    try {
      const res = await fetch('/api/mp-cancelar-assinatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loja_id: state.loja.id,
          preapproval_id: state.assinatura?.mp_preapproval_id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.sucesso) {
        toast(data.erro || 'Erro ao cancelar renovação automática', 'error');
        return;
      }

      if (state.assinatura) {
        state.assinatura.cancelar_ao_fim_do_periodo = true;
      }

      if (el.modalConfirmarCancelamento) el.modalConfirmarCancelamento.classList.add('hidden');
      toast('Renovação automática cancelada com sucesso. Seu plano continua liberado até o vencimento.', 'success');
      prepararTelaConta();
      atualizarBarraAssinatura();
    } catch (err) {
      toast('Falha de conexão ao cancelar: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = textoOriginal;
    }
  });
}

// Upload e Gerenciamento de Logotipo da Loja no Perfil
if (el.inputContaLogo) {
  el.inputContaLogo.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file || !state.loja) return;

    if (!file.type.startsWith('image/')) {
      toast('Selecione uma imagem válida (PNG, JPG ou WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('A imagem do logotipo deve ter no máximo 5MB.', 'error');
      return;
    }

    toast('Otimizando e enviando logotipo...', 'info');

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = objectUrl;
      });
      URL.revokeObjectURL(objectUrl);

      const maxDim = 400;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const formato = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise((res) => canvas.toBlob(res, formato, 0.92));
      if (!blob) throw new Error('Falha ao processar logotipo');

      const extensao = formato === 'image/png' ? 'png' : 'jpg';
      const caminhoLogo = `${state.user.id}/logo_${Date.now()}.${extensao}`;

      const { url } = await uploadImagemOtimizada(blob, caminhoLogo);

      const { error } = await sb
        .from('lojas')
        .update({ logo_url: url })
        .eq('id', state.user.id);

      if (error) throw error;

      state.loja.logo_url = url;
      prepararTelaConta();
      atualizarLivePreview();
      toast('Logotipo atualizado com sucesso!', 'success');
    } catch (err) {
      toast('Erro ao enviar logotipo: ' + (err.message || 'Tente novamente'), 'error');
    } finally {
      el.inputContaLogo.value = '';
    }
  });
}

if (el.btnRemoverContaLogo) {
  el.btnRemoverContaLogo.addEventListener('click', async () => {
    if (!state.loja) return;
    if (!confirm('Deseja realmente remover o logotipo da sua loja?')) return;

    try {
      const { error } = await sb
        .from('lojas')
        .update({ logo_url: null })
        .eq('id', state.user.id);

      if (error) throw error;

      state.loja.logo_url = null;
      prepararTelaConta();
      atualizarLivePreview();
      toast('Logotipo removido com sucesso.', 'info');
    } catch (err) {
      toast('Erro ao remover logotipo: ' + err.message, 'error');
    }
  });
}

// EDITAR PERFIL DO NEGÓCIO NO PAINEL
if (el.painelPerfilWhatsapp) {
  aplicarMascaraTelefoneInput(el.painelPerfilWhatsapp);
}

if (el.btnToggleEditarPerfilPainel && el.formEditarPerfilPainel) {
  el.btnToggleEditarPerfilPainel.addEventListener('click', () => {
    el.formEditarPerfilPainel.classList.toggle('hidden');
    if (!el.formEditarPerfilPainel.classList.contains('hidden') && state.loja) {
      if (el.painelPerfilResponsavel) el.painelPerfilResponsavel.value = state.loja.responsavel_nome || '';
      if (el.painelPerfilWhatsapp) el.painelPerfilWhatsapp.value = formatarTelefoneVisual(state.loja.whatsapp) || '';
      if (el.painelPerfilCidade) el.painelPerfilCidade.value = state.loja.cidade || '';
      if (el.painelPerfilEstado) el.painelPerfilEstado.value = state.loja.estado || '';
      if (el.painelPerfilRamo) el.painelPerfilRamo.value = state.loja.ramo_atividade || '';
      if (el.painelPerfilExpectativa) el.painelPerfilExpectativa.value = state.loja.expectativa || '';
      if (el.painelPerfilResponsavel) el.painelPerfilResponsavel.focus();
    }
  });
}

if (el.btnCancelarEditarPerfilPainel && el.formEditarPerfilPainel) {
  el.btnCancelarEditarPerfilPainel.addEventListener('click', () => {
    el.formEditarPerfilPainel.classList.add('hidden');
  });
}

if (el.formEditarPerfilPainel) {
  el.formEditarPerfilPainel.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.loja || !state.user) return;

    const responsavel = el.painelPerfilResponsavel ? el.painelPerfilResponsavel.value.trim() : '';
    const whatsapp = el.painelPerfilWhatsapp ? el.painelPerfilWhatsapp.value.trim() : '';
    const cidade = el.painelPerfilCidade ? el.painelPerfilCidade.value.trim() : '';
    const estado = el.painelPerfilEstado ? el.painelPerfilEstado.value.trim().toUpperCase() : '';
    const ramo = el.painelPerfilRamo ? el.painelPerfilRamo.value.trim() : '';
    const expectativa = el.painelPerfilExpectativa ? el.painelPerfilExpectativa.value.trim() : '';

    const btn = document.getElementById('btn-submit-editar-perfil-painel');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Salvando...';
    }

    try {
      const { data, error } = await sb
        .from('lojas')
        .update({
          responsavel_nome: responsavel || null,
          whatsapp: whatsapp || null,
          cidade: cidade || null,
          estado: estado || null,
          ramo_atividade: ramo || null,
          expectativa: expectativa || null,
        })
        .eq('id', state.user.id)
        .select()
        .single();

      if (error) throw error;

      state.loja = data;
      prepararTelaConta();
      el.formEditarPerfilPainel.classList.add('hidden');
      toast('Perfil do negócio atualizado com sucesso!', 'success');
    } catch (err) {
      toast('Erro ao atualizar perfil: ' + err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Salvar Perfil</span>';
      }
    }
  });
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

  // Mapeia links ativos/pausados que utilizam cada imagem (principal ou adicional)
  const mapLinksPorImagem = {};
  (state.links || []).forEach((link) => {
    if (link.imagem_path) {
      if (!mapLinksPorImagem[link.imagem_path]) {
        mapLinksPorImagem[link.imagem_path] = [];
      }
      mapLinksPorImagem[link.imagem_path].push(link);
    }

    let fotosExtras = [];
    try {
      fotosExtras = Array.isArray(link.fotos_galeria) ? link.fotos_galeria : JSON.parse(link.fotos_galeria || '[]');
    } catch (_) {}

    fotosExtras.forEach((caminhoExtra) => {
      if (!caminhoExtra) return;
      if (!mapLinksPorImagem[caminhoExtra]) {
        mapLinksPorImagem[caminhoExtra] = [];
      }
      if (!mapLinksPorImagem[caminhoExtra].some((l) => l.id === link.id)) {
        mapLinksPorImagem[caminhoExtra].push(link);
      }
    });
  });

  const fotosMap = new Map();

  // 1. Carrega fotos salvas no cache local do usuário revalidando URLs
  const fotosLocais = obterFotosCacheLocal(state.user.id);
  fotosLocais.forEach((f) => {
    if (f.caminho) {
      fotosMap.set(f.caminho, {
        ...f,
        urlPublica: resolverUrlImagem(f.caminho),
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
        fotosMap.set(caminho, {
          caminho,
          nome: file.name,
          urlPublica: resolverUrlImagem(caminho),
          criadoEm: file.created_at || new Date().toISOString(),
          tamanho: file.metadata?.size || null,
          linksUsando: mapLinksPorImagem[caminho] || [],
        });
      });
    }
  } catch (err) {
    console.warn('Listagem storage:', err);
  }

  // 2b. Tenta listar objetos em lojistas/user_id se existirem
  try {
    const { data: filesLojistas } = await sb.storage.from('banners').list(`lojistas/${state.user.id}`, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    });
    if (Array.isArray(filesLojistas)) {
      filesLojistas.forEach((file) => {
        if (!file.name || file.name.startsWith('.')) return;
        const caminho = `lojistas/${state.user.id}/${file.name}`;
        fotosMap.set(caminho, {
          caminho,
          nome: file.name,
          urlPublica: resolverUrlImagem(caminho),
          criadoEm: file.created_at || new Date().toISOString(),
          tamanho: file.metadata?.size || null,
          linksUsando: mapLinksPorImagem[caminho] || [],
        });
      });
    }
  } catch (_) {}

  // 3. Garante que qualquer imagem usada nos links cadastrados esteja presente (principal e adicionais)
  (state.links || []).forEach((link) => {
    if (link.imagem_path) {
      const caminho = link.imagem_path;
      const fotoExistente = fotosMap.get(caminho);
      const nome = caminho.split('/').pop() || 'banner.jpg';
      fotosMap.set(caminho, {
        caminho,
        nome: fotoExistente?.nome || nome,
        urlPublica: resolverUrlImagem(caminho, link.versao || 1),
        criadoEm: fotoExistente?.criadoEm || link.criado_em,
        tamanho: fotoExistente?.tamanho || null,
        linksUsando: mapLinksPorImagem[caminho] || [],
      });
    }

    let fotosExtras = [];
    try {
      fotosExtras = Array.isArray(link.fotos_galeria) ? link.fotos_galeria : JSON.parse(link.fotos_galeria || '[]');
    } catch (_) {}

    fotosExtras.forEach((caminhoExtra) => {
      if (!caminhoExtra) return;
      const fotoExistente = fotosMap.get(caminhoExtra);
      const nome = caminhoExtra.split('/').pop() || 'foto-oferta.jpg';
      fotosMap.set(caminhoExtra, {
        caminho: caminhoExtra,
        nome: fotoExistente?.nome || nome,
        urlPublica: resolverUrlImagem(caminhoExtra, link.versao || 1),
        criadoEm: fotoExistente?.criadoEm || link.criado_em,
        tamanho: fotoExistente?.tamanho || null,
        linksUsando: mapLinksPorImagem[caminhoExtra] || [],
      });
    });
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

function abrirModalSelecaoGaleria(modo = 'principal') {
  state.modalGaleriaModo = modo;
  state.fotoTemporariaModal = modo === 'principal' ? state.fotoSelecionadaGaleria : null;
  const tituloEl = document.getElementById('modal-galeria-titulo');
  if (tituloEl) {
    tituloEl.textContent = modo === 'vitrine_extra' ? 'Adicionar Foto à Oferta' : 'Escolher Foto da Galeria';
  }
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
    el.modalGaleriaBtnConfirmar.textContent = state.modalGaleriaModo === 'vitrine_extra' ? 'Adicionar à Oferta' : 'Usar Foto Selecionada';
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
      const resUp = await uploadImagemOtimizada(blob, caminho);
      if (resUp && resUp.caminho) enviados += 1;
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
    if (!state.fotoTemporariaModal) return;

    if (state.modalGaleriaModo === 'vitrine_extra') {
      if (!Array.isArray(state.fotosExtrasVitrine)) state.fotosExtrasVitrine = [];
      if (state.fotosExtrasVitrine.length >= 4) {
        toast('Limite de 4 fotos adicionais atingido para a oferta.', 'warning');
        return;
      }
      if (!state.fotosExtrasVitrine.includes(state.fotoTemporariaModal)) {
        state.fotosExtrasVitrine.push(state.fotoTemporariaModal);
        renderizarFotosExtrasVitrine();
        toast('Foto adicionada à oferta com sucesso!', 'success');
      } else {
        toast('Esta foto já foi adicionada à oferta.', 'info');
      }
      fecharModalSelecaoGaleria();
      return;
    }

    aplicarFotoGaleriaNoFormulario(state.fotoTemporariaModal);
    fecharModalSelecaoGaleria();
    toast('Foto da galeria aplicada com sucesso!', 'success');
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
      const resUp = await uploadImagemOtimizada(blob, caminho);
      const caminhoFinal = resUp?.caminho || caminho;

      await carregarGaleriaFotos(true);

      if (state.modalGaleriaModo === 'vitrine_extra') {
        if (!Array.isArray(state.fotosExtrasVitrine)) state.fotosExtrasVitrine = [];
        if (state.fotosExtrasVitrine.length < 4) {
          state.fotosExtrasVitrine.push(caminhoFinal);
          renderizarFotosExtrasVitrine();
        }
        fecharModalSelecaoGaleria();
        toast('Foto adicionada à galeria e à oferta com sucesso!', 'success');
      } else {
        aplicarFotoGaleriaNoFormulario(caminhoFinal);
        fecharModalSelecaoGaleria();
        toast('Foto adicionada e aplicada ao cartão!', 'success');
      }
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
    const aspectPadrao = 1.912;
    if (state.fotoSelecionadaGaleria) {
      const foto = state.fotosGaleria.find((f) => f.caminho === state.fotoSelecionadaGaleria);
      const url = foto ? foto.urlPublica : (el.thumbFotoSelecionada ? el.thumbFotoSelecionada.src : null);
      if (url) {
        abrirEditorRecorte({
          arquivoOuUrl: url,
          modo: 'formulario',
          aspectInicial: aspectPadrao,
        });
      }
    } else if (state.arquivoBlob) {
      abrirEditorRecorte({
        arquivoOuUrl: state.arquivoBlob,
        modo: 'formulario',
        aspectInicial: aspectPadrao,
      });
    } else if (el.im && el.im.src && !el.im.classList.contains('hidden')) {
      abrirEditorRecorte({
        arquivoOuUrl: el.im.src,
        modo: 'formulario',
        aspectInicial: aspectPadrao,
      });
    } else {
      toast('Selecione ou envie uma imagem primeiro para recortar.', 'info');
    }
  });
}

// ==========================================
// MÓDULO: INTELIGÊNCIA DE HORÁRIOS DE PICO
// ==========================================

async function abrirModalHorarios(linkId, linkTitulo, linkSlug) {
  state.modalHorarios = {
    linkId,
    linkTitulo,
    linkSlug,
    dias: 30
  };

  if (el.modalHorariosLinkNome) {
    el.modalHorariosLinkNome.textContent = `/${state.loja ? state.loja.slug : ''}/${linkSlug} · ${linkTitulo}`;
  }

  // Reseta visual dos botões de período para 30 dias
  atualizarBotoesPeriodoHorarios(30);

  if (el.modalHorariosLink) {
    el.modalHorariosLink.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  await carregarDadosHorarios(linkId, 30);
}

function fecharModalHorarios() {
  if (el.modalHorariosLink) {
    el.modalHorariosLink.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

function atualizarBotoesPeriodoHorarios(diasAtivo) {
  document.querySelectorAll('.btn-periodo-horarios').forEach((btn) => {
    const d = Number(btn.dataset.dias);
    if (d === diasAtivo) {
      btn.className = 'btn-periodo-horarios px-3 py-1 rounded-lg transition-all bg-surface-container-lowest text-primary shadow-2xs font-bold';
    } else {
      btn.className = 'btn-periodo-horarios px-3 py-1 rounded-lg transition-all text-on-surface-variant hover:text-on-surface font-semibold';
    }
  });
}

async function carregarDadosHorarios(linkId, dias) {
  state.modalHorarios.dias = dias;
  atualizarBotoesPeriodoHorarios(dias);

  const container = el.containerGraficoHorarios;
  const labelHover = el.labelDetalheHoraHover;
  const textoRecomendacao = el.textoRecomendacaoHorario;
  const cardRecomendacao = el.cardRecomendacaoHorario;
  const estadoVazio = el.estadoVazioHorarios;

  if (labelHover) labelHover.textContent = 'Carregando dados...';
  if (textoRecomendacao) textoRecomendacao.textContent = 'Analisando distribuição de acessos...';

  // Skeleton loading das 24 barras
  if (container) {
    container.classList.remove('hidden');
    container.innerHTML = Array.from({ length: 24 }).map(() => `
      <div class="flex-1 flex flex-col justify-end items-center h-full">
        <div class="w-full bg-surface-container-high/60 rounded-t-sm animate-pulse" style="height: ${Math.floor(Math.random() * 50) + 15}%;"></div>
      </div>
    `).join('');
  }

  try {
    const { data, error } = await sb.rpc('obter_horarios_cliques_link', {
      p_link_id: linkId,
      p_dias: dias
    });

    if (error) throw error;

    const horas = data || [];
    let totalCliques = 0;
    let maxCliques = 0;
    let horaPico = -1;

    horas.forEach((h) => {
      const q = Number(h.total || 0);
      totalCliques += q;
      if (q > maxCliques) {
        maxCliques = q;
        horaPico = h.hora;
      }
    });

    // Atualização dos 4 turnos
    let turnoMadrugada = 0; // 0h - 5h
    let turnoManha = 0;     // 6h - 11h
    let turnoTarde = 0;     // 12h - 17h
    let turnoNoite = 0;     // 18h - 23h

    horas.forEach((h) => {
      const q = Number(h.total || 0);
      const hr = Number(h.hora);
      if (hr >= 0 && hr < 6) turnoMadrugada += q;
      else if (hr >= 6 && hr < 12) turnoManha += q;
      else if (hr >= 12 && hr < 18) turnoTarde += q;
      else turnoNoite += q;
    });

    const setTurno = (idQtd, idPct, qtd) => {
      const elQtd = document.getElementById(idQtd);
      const elPct = document.getElementById(idPct);
      if (elQtd) elQtd.textContent = qtd.toLocaleString('pt-BR');
      if (elPct) {
        const pct = totalCliques > 0 ? Math.round((qtd / totalCliques) * 100) : 0;
        elPct.textContent = `${pct}%`;
      }
    };

    setTurno('turno-qtd-manha', 'turno-pct-manha', turnoManha);
    setTurno('turno-qtd-tarde', 'turno-pct-tarde', turnoTarde);
    setTurno('turno-qtd-noite', 'turno-pct-noite', turnoNoite);
    setTurno('turno-qtd-madrugada', 'turno-pct-madrugada', turnoMadrugada);

    // Se nenhum clique foi registrado no período
    if (totalCliques === 0) {
      if (container) container.classList.add('hidden');
      if (cardRecomendacao) cardRecomendacao.classList.add('hidden');
      if (estadoVazio) estadoVazio.classList.remove('hidden');
      if (labelHover) labelHover.textContent = 'Sem cliques no período selecionado';
      return;
    }

    if (container) container.classList.remove('hidden');
    if (cardRecomendacao) cardRecomendacao.classList.remove('hidden');
    if (estadoVazio) estadoVazio.classList.add('hidden');
    if (labelHover) labelHover.textContent = 'Passe o mouse ou toque nas barras';

    // Cálculo da janela ideal consecutiva de 2 horas para envio no WhatsApp
    let melhorJanelaInicio = horaPico;
    let maxCliquesJanela = 0;
    for (let i = 0; i < 24; i++) {
      const q1 = Number(horas.find((h) => h.hora === i)?.total || 0);
      const q2 = Number(horas.find((h) => h.hora === (i + 1) % 24)?.total || 0);
      const soma = q1 + q2;
      if (soma > maxCliquesJanela) {
        maxCliquesJanela = soma;
        melhorJanelaInicio = i;
      }
    }

    const hFimJanela = (melhorJanelaInicio + 2) % 24;
    const pctJanela = Math.round((maxCliquesJanela / totalCliques) * 100);
    const horaPicoFormatada = `${String(horaPico).padStart(2, '0')}:00`;
    const horaPicoFimFormatada = `${String((horaPico + 1) % 24).padStart(2, '0')}:00`;
    const janelaInicioFmt = `${String(melhorJanelaInicio).padStart(2, '0')}:00`;
    const janelaFimFmt = `${String(hFimJanela).padStart(2, '0')}:00`;

    if (textoRecomendacao) {
      if (totalCliques < 5) {
        textoRecomendacao.innerHTML = `Identificamos maior movimento às <strong>${horaPicoFormatada}</strong>, mas a amostra ainda é inicial (${totalCliques} cliques). Divulgue mais para refinar a precisão.`;
      } else {
        textoRecomendacao.innerHTML = `O pico isolado ocorre entre <strong>${horaPicoFormatada} e ${horaPicoFimFormatada}</strong>. Recomendamos agendar disparos entre <strong>${janelaInicioFmt} e ${janelaFimFmt}</strong>, onde você concentra <strong>${pctJanela}%</strong> dos acessos deste link.`;
      }
    }

    // Renderização das 24 barras
    if (container) {
      container.innerHTML = '';
      horas.forEach((item) => {
        const qtd = Number(item.total || 0);
        const hr = item.hora;
        const hrFmt = `${String(hr).padStart(2, '0')}:00`;
        const hrFim = `${String((hr + 1) % 24).padStart(2, '0')}:00`;
        const pct = totalCliques > 0 ? Math.round((qtd / totalCliques) * 100) : 0;
        const isPico = qtd > 0 && qtd === maxCliques;

        const col = document.createElement('div');
        col.className = 'flex-1 flex flex-col justify-end items-center h-full group/bar relative cursor-pointer';

        const alturaPct = maxCliques > 0 ? Math.max(8, Math.round((qtd / maxCliques) * 100)) : 8;
        const corBarra = isPico
          ? 'bg-secondary hover:bg-secondary-dark ring-2 ring-secondary/40'
          : qtd > 0
            ? 'bg-primary hover:bg-primary-container'
            : 'bg-surface-container-high/60 hover:bg-surface-container-high';

        col.innerHTML = `
          ${isPico ? '<span class="material-symbols-outlined text-[10px] sm:text-xs text-secondary-dark font-black mb-0.5 animate-bounce">star</span>' : ''}
          <div class="w-full ${corBarra} rounded-t-sm transition-all duration-300" style="height: ${alturaPct}%;"></div>
        `;

        const mostrarDetalhe = () => {
          if (labelHover) {
            labelHover.innerHTML = `<span class="text-on-surface">${hrFmt} - ${hrFim}:</span> <span class="${isPico ? 'text-secondary-dark' : 'text-primary'} font-bold">${qtd.toLocaleString('pt-BR')} cliques</span> <span class="text-outline">(${pct}%)</span>${isPico ? ' · <span class="text-secondary-dark font-extrabold">🏆 Horário Campeão</span>' : ''}`;
          }
        };

        col.addEventListener('mouseenter', mostrarDetalhe);
        col.addEventListener('click', mostrarDetalhe);

        container.appendChild(col);
      });
    }

  } catch (err) {
    console.error('Erro ao carregar horários do link:', err);
    toast('Erro ao buscar dados de horários: ' + err.message, 'error');
    if (labelHover) labelHover.textContent = 'Erro ao carregar dados';
  }
}

// Listeners de Fechamento do Modal de Horários
if (el.btnFecharModalHorarios) {
  el.btnFecharModalHorarios.addEventListener('click', fecharModalHorarios);
}
if (el.btnConcluirModalHorarios) {
  el.btnConcluirModalHorarios.addEventListener('click', fecharModalHorarios);
}
if (el.modalHorariosLink) {
  el.modalHorariosLink.addEventListener('click', (e) => {
    if (e.target === el.modalHorariosLink) fecharModalHorarios();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && el.modalHorariosLink && !el.modalHorariosLink.classList.contains('hidden')) {
    fecharModalHorarios();
  }
});

// Listener dos botões de filtro de período dentro do modal
document.querySelectorAll('.btn-periodo-horarios').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dias = Number(btn.dataset.dias);
    if (state.modalHorarios.linkId) {
      carregarDadosHorarios(state.modalHorarios.linkId, dias);
    }
  });
});

/* ==========================================================================
   MÓDULO: ASSISTENTE DE COPYWRITING COM INTELIGÊNCIA ARTIFICIAL
   ========================================================================== */

function atualizarBadgeCotaIa(restantes = 40, limite = 40) {
  state.ia.cotaRestante = restantes;
  state.ia.limiteDiario = limite;

  const texto = `${restantes} restantes hoje`;
  if (el.badgeIaCotas) el.badgeIaCotas.textContent = texto;
  if (el.modalIaBadgeCota) el.modalIaBadgeCota.textContent = texto;

  if (restantes <= 0) {
    if (el.badgeIaCotas) {
      el.badgeIaCotas.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-error-container text-error border border-error/30';
      el.badgeIaCotas.textContent = 'Cota esgotada hoje';
    }
    if (el.modalIaBadgeCota) {
      el.modalIaBadgeCota.className = 'text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-error-container text-error border border-error/30';
      el.modalIaBadgeCota.textContent = 'Cota esgotada hoje';
    }
  } else {
    if (el.badgeIaCotas) {
      el.badgeIaCotas.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary';
    }
    if (el.modalIaBadgeCota) {
      el.modalIaBadgeCota.className = 'text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container border border-secondary/30';
    }
  }
}

async function carregarStatusIa() {
  if (!state.loja?.id) return;
  try {
    const res = await fetch(`/api/ia-gerar-copy?loja_id=${encodeURIComponent(state.loja.id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.sucesso) {
        atualizarBadgeCotaIa(data.restantes_hoje ?? 40, data.limite_diario ?? 40);
      }
    }
  } catch (err) {
    console.warn('[PostLink IA] Não foi possível carregar status da IA:', err);
  }
}

function abrirModalAssistenteIa(contextoInicial = '', focarCampo = null) {
  console.log('[PostLink IA] Abrindo modal do assistente...', { contextoInicial, focarCampo });

  const modal = el.modalAssistenteIa || document.getElementById('modal-assistente-ia');
  const inputCtx = el.modalIaInputContexto || document.getElementById('modal-ia-input-contexto');
  const loading = el.modalIaLoading || document.getElementById('modal-ia-loading');

  let ctx = (contextoInicial || '').trim();

  // Inferência inteligente se o lojista não passou texto prévio
  if (!ctx) {
    const inpTit = el.inputTitulo || document.getElementById('input-titulo');
    const inpDesc = el.inputDescricao || document.getElementById('input-descricao');
    const inpDest = el.inputDestino || document.getElementById('input-destino');
    if (inpTit && inpTit.value.trim() && inpTit.value.trim() !== (state.loja?.nome || '')) {
      ctx = inpTit.value.trim();
    } else if (inpDesc && inpDesc.value.trim()) {
      ctx = inpDesc.value.trim();
    } else if (inpDest && inpDest.value.trim()) {
      ctx = inpDest.value.trim();
    } else if (state.loja?.nome) {
      ctx = `Oferta especial da ${state.loja.nome}`;
    }
  }

  if (inputCtx) {
    inputCtx.value = ctx;
  }

  // Oculta loading prévio
  if (loading) loading.classList.add('hidden');

  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.classList.add('overflow-hidden');
  } else {
    console.error('[PostLink IA] Elemento #modal-assistente-ia não encontrado no DOM!');
  }

  if (inputCtx) {
    setTimeout(() => {
      inputCtx.focus();
      inputCtx.select();
    }, 100);
  }
}

function fecharModalAssistenteIa() {
  const modal = el.modalAssistenteIa || document.getElementById('modal-assistente-ia');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    document.body.classList.remove('overflow-hidden');
  }
}

function selecionarTomIa(tom) {
  state.ia.tomSelecionado = tom;
  document.querySelectorAll('.btn-ia-tom').forEach((btn) => {
    if (btn.dataset.tom === tom) {
      btn.className = 'btn-ia-tom p-2.5 rounded-xl border border-primary bg-primary/10 text-primary text-xs font-bold flex flex-col items-center gap-1 text-center transition-all shadow-2xs';
    } else {
      btn.className = 'btn-ia-tom p-2.5 rounded-xl border border-outline-variant bg-surface-container-low hover:border-primary text-on-surface text-xs font-semibold flex flex-col items-center gap-1 text-center transition-all';
    }
  });
}

async function executarGeracaoIa(contextoForcado = null, acao = 'sugestoes_completas') {
  if (state.ia.gerando) return;

  const inputCtx = el.modalIaInputContexto || document.getElementById('modal-ia-input-contexto');
  const btnGerar = el.modalIaBtnGerar || document.getElementById('modal-ia-btn-gerar');
  const loading = el.modalIaLoading || document.getElementById('modal-ia-loading');
  const resultados = el.modalIaResultados || document.getElementById('modal-ia-resultados');
  const inputDest = el.inputDestino || document.getElementById('input-destino');

  const contexto = (contextoForcado !== null ? contextoForcado : (inputCtx?.value || '')).trim();
  if (!contexto) {
    toast('Por favor, descreva o produto ou informe o link da oferta.', 'warning');
    if (inputCtx) inputCtx.focus();
    return;
  }

  state.ia.gerando = true;
  if (btnGerar) {
    btnGerar.disabled = true;
    btnGerar.classList.add('opacity-70');
  }
  if (loading) loading.classList.remove('hidden');
  if (resultados) resultados.classList.add('hidden');

  try {
    const res = await fetch('/api/ia-gerar-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loja_id: state.loja?.id,
        contexto,
        url_destino: inputDest?.value.trim() || '',
        tom: state.ia.tomSelecionado || 'urgencia',
        tipo_acao: acao,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      if (res.status === 429 || data.limite_atingido) {
        atualizarBadgeCotaIa(0, data.limite_diario || 40);
        throw new Error(data.erro || 'Você atingiu o limite diário de uso de IA para o seu plano. Faça upgrade para ter mais créditos ou aguarde a renovação amanhã!');
      }
      throw new Error(data.erro || 'Falha ao gerar textos com IA');
    }

    // Atualiza contadores de cota
    atualizarBadgeCotaIa(data.restantes_hoje ?? 39, data.limite_diario ?? 40);

    state.ia.sugestoes = data.sugestoes || [];
    renderizarSugestoesIa(state.ia.sugestoes, data.provedor || '');

    toast('Sugestões geradas com sucesso! ✨', 'success');
  } catch (err) {
    console.error('[PostLink IA] Erro na IA:', err);
    toast(err.message, 'error');
  } finally {
    state.ia.gerando = false;
    if (btnGerar) {
      btnGerar.disabled = false;
      btnGerar.classList.remove('opacity-70');
    }
    if (loading) loading.classList.add('hidden');
  }
}

function renderizarSugestoesIa(sugestoes = [], provedor = '') {
  const cardsLista = el.modalIaCardsLista || document.getElementById('modal-ia-cards-lista');
  const resultados = el.modalIaResultados || document.getElementById('modal-ia-resultados');
  if (!cardsLista) return;
  cardsLista.innerHTML = '';

  if (sugestoes.length === 0) {
    cardsLista.innerHTML = '<p class="text-xs text-outline text-center py-4">Nenhuma sugestão retornada.</p>';
    if (resultados) resultados.classList.remove('hidden');
    return;
  }

  // Indicador de modelo/motor utilizado
  const indicadorEngine = document.createElement('div');
  indicadorEngine.className = 'flex items-center justify-between text-[11px] text-outline font-medium pb-1';
  const tagEngine = provedor.includes('gemini') ? '✨ Google Gemini IA' : '✨ Motor Inteligente PostLink';
  indicadorEngine.innerHTML = `
    <span>${tagEngine}</span>
    <span>Clique em "Usar esta opção" para aplicar</span>
  `;
  cardsLista.appendChild(indicadorEngine);

  sugestoes.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'p-3.5 sm:p-4 rounded-2xl bg-surface-container-low border border-outline-variant/70 hover:border-primary/50 transition-all space-y-3 shadow-2xs group';
    
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
          <span>✨</span>
          <span>${item.tom || `Opção ${index + 1}`}</span>
        </span>
        <button type="button" class="btn-aplicar-ia bg-secondary hover:bg-secondary-dark text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1" data-index="${index}">
          <span class="material-symbols-outlined text-sm">check</span>
          <span>Usar esta opção</span>
        </button>
      </div>

      <div class="space-y-1">
        <div class="flex items-center justify-between text-[11px] text-outline font-semibold">
          <span>Título:</span>
          <span>${(item.titulo || '').length}/80</span>
        </div>
        <p class="text-xs font-bold text-on-surface leading-snug bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/40">
          ${item.titulo || ''}
        </p>
      </div>

      <div class="space-y-1">
        <div class="flex items-center justify-between text-[11px] text-outline font-semibold">
          <span>Descrição do WhatsApp:</span>
          <span>${(item.descricao || '').length}/200</span>
        </div>
        <p class="text-xs text-on-surface-variant leading-relaxed bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/40">
          ${item.descricao || ''}
        </p>
      </div>

      <div class="space-y-1">
        <span class="text-[11px] text-outline font-semibold block">Mensagem Inicial Pronta (wa.me):</span>
        <p class="text-xs text-secondary-dark font-medium italic bg-[#E7FFDB] p-2 rounded-lg border border-[#C8E6C9] leading-snug">
          💬 "${item.mensagem_whatsapp || ''}"
        </p>
      </div>

      ${item.mensagem_compartilhamento ? `
      <div class="space-y-1">
        <div class="flex items-center justify-between text-[11px] text-outline font-semibold">
          <span>Mensagem de Divulgação para Envio:</span>
          <span>${item.mensagem_compartilhamento.length}/1000</span>
        </div>
        <div class="text-xs text-on-surface leading-relaxed bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/40 whitespace-pre-line select-all max-h-36 overflow-y-auto">
          ${escapeHtml(item.mensagem_compartilhamento)}
        </div>
      </div>` : ''}
    `;

    const btnAplicar = card.querySelector('.btn-aplicar-ia');
    if (btnAplicar) {
      btnAplicar.addEventListener('click', () => {
        aplicarSugestaoIa(item);
      });
    }

    cardsLista.appendChild(card);
  });

  if (resultados) resultados.classList.remove('hidden');
}

function aplicarSugestaoIa(sugestao) {
  if (!sugestao) return;

  const inpTit = el.inputTitulo || document.getElementById('input-titulo');
  const inpDesc = el.inputDescricao || document.getElementById('input-descricao');
  const presetMsg = el.presetMessage || document.getElementById('preset-message');
  const inpSlug = el.inputSlug || document.getElementById('input-slug');
  const inpComp = el.inputMensagemCompartilhamento || document.getElementById('input-mensagem-compartilhamento');
  const detPers = el.detalhesPersonalizar || document.getElementById('detalhes-personalizar');

  // 1. Título
  if (inpTit && sugestao.titulo) {
    inpTit.value = sugestao.titulo;
  }

  // 2. Descrição
  if (inpDesc && sugestao.descricao) {
    inpDesc.value = sugestao.descricao;
    atualizarContadorDescricao();
  }

  // 3. Mensagem WhatsApp
  if (presetMsg && sugestao.mensagem_whatsapp) {
    presetMsg.value = sugestao.mensagem_whatsapp;
  }

  // 4. Mensagem de Compartilhamento / Divulgação
  if (inpComp && sugestao.mensagem_compartilhamento) {
    inpComp.value = sugestao.mensagem_compartilhamento;
    atualizarContadorMensagemCompartilhamento();
  }

  // 5. Slug amigável (se o campo estiver vazio ou padrão)
  if (inpSlug && sugestao.slug && (!inpSlug.value || inpSlug.value.length < 4)) {
    inpSlug.value = sugestao.slug;
  }

  // Abre o accordion de personalização do cartão para o lojista ver os dados aplicados
  if (detPers) {
    detPers.open = true;
  }

  // Atualiza Live Preview em tempo real
  atualizarLivePreview();

  // Fecha o modal
  fecharModalAssistenteIa();

  toast('✨ Textos de alta conversão aplicados com sucesso!', 'success');
}

// Exposição explícita no objeto window para acessibilidade global e chamadas inline
window.abrirModalAssistenteIa = abrirModalAssistenteIa;
window.fecharModalAssistenteIa = fecharModalAssistenteIa;
window.executarGeracaoIa = executarGeracaoIa;
window.aplicarSugestaoIa = aplicarSugestaoIa;
window.selecionarTomIa = selecionarTomIa;

// Chips de Tags dinâmicas e Emojis na mensagem de divulgação
document.querySelectorAll('.btn-tag-compartilhamento').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tag = btn.dataset.tag;
    const inp = el.inputMensagemCompartilhamento || document.getElementById('input-mensagem-compartilhamento');
    if (inp && tag) {
      const start = inp.selectionStart ?? inp.value.length;
      const end = inp.selectionEnd ?? inp.value.length;
      const val = inp.value;
      inp.value = val.slice(0, start) + tag + val.slice(end);
      inp.selectionStart = inp.selectionEnd = start + tag.length;
      inp.focus();
      atualizarContadorMensagemCompartilhamento();
      atualizarLivePreview();
    }
  });
});

document.querySelectorAll('.btn-emoji-compartilhamento').forEach((btn) => {
  btn.addEventListener('click', () => {
    const emoji = btn.dataset.emoji;
    const inp = el.inputMensagemCompartilhamento || document.getElementById('input-mensagem-compartilhamento');
    if (inp && emoji) {
      const start = inp.selectionStart ?? inp.value.length;
      const end = inp.selectionEnd ?? inp.value.length;
      const val = inp.value;
      inp.value = val.slice(0, start) + emoji + val.slice(end);
      inp.selectionStart = inp.selectionEnd = start + emoji.length;
      inp.focus();
      atualizarContadorMensagemCompartilhamento();
      atualizarLivePreview();
    }
  });
});

// Listeners diretos do Assistente de IA
if (el.btnAbrirAssistenteIa) {
  el.btnAbrirAssistenteIa.addEventListener('click', () => abrirModalAssistenteIa());
}
if (el.btnIaInlineTitulo) {
  el.btnIaInlineTitulo.addEventListener('click', () => {
    const v = el.inputTitulo?.value || document.getElementById('input-titulo')?.value || '';
    abrirModalAssistenteIa(v, 'titulo');
  });
}
if (el.btnIaInlineDescricao) {
  el.btnIaInlineDescricao.addEventListener('click', () => {
    const v = el.inputDescricao?.value || document.getElementById('input-descricao')?.value || el.inputTitulo?.value || '';
    abrirModalAssistenteIa(v, 'descricao');
  });
}
if (el.btnIaInlineMensagem) {
  el.btnIaInlineMensagem.addEventListener('click', () => {
    const v = el.presetMessage?.value || document.getElementById('preset-message')?.value || el.inputTitulo?.value || '';
    abrirModalAssistenteIa(v, 'mensagem');
  });
}
if (el.btnIaInlineCompartilhamento) {
  el.btnIaInlineCompartilhamento.addEventListener('click', () => {
    const v = el.inputMensagemCompartilhamento?.value || document.getElementById('input-mensagem-compartilhamento')?.value || el.inputTitulo?.value || '';
    abrirModalAssistenteIa(v, 'compartilhamento');
  });
}
if (el.modalIaBtnFechar) {
  el.modalIaBtnFechar.addEventListener('click', fecharModalAssistenteIa);
}
if (el.modalIaBtnCancelar) {
  el.modalIaBtnCancelar.addEventListener('click', fecharModalAssistenteIa);
}
if (el.modalIaBtnGerar) {
  el.modalIaBtnGerar.addEventListener('click', () => executarGeracaoIa());
}
if (el.modalAssistenteIa) {
  el.modalAssistenteIa.addEventListener('click', (e) => {
    if (e.target === el.modalAssistenteIa) fecharModalAssistenteIa();
  });
}

// Event Delegation global no document como camada de resiliência total
document.addEventListener('click', (e) => {
  // Botão Principal "Gerar com IA" no banner
  const btnAbrirIa = e.target.closest('#btn-abrir-assistente-ia, [data-action="abrir-ia"]');
  if (btnAbrirIa) {
    e.preventDefault();
    abrirModalAssistenteIa();
    return;
  }

  // Botão inline Mensagem
  const btnInlineMsg = e.target.closest('#btn-ia-inline-mensagem, [data-action="abrir-ia-mensagem"]');
  if (btnInlineMsg) {
    e.preventDefault();
    const msgVal = el.presetMessage?.value || document.getElementById('preset-message')?.value || '';
    abrirModalAssistenteIa(msgVal, 'mensagem');
    return;
  }

  // Botão inline Mensagem de Compartilhamento / Divulgação
  const btnInlineComp = e.target.closest('#btn-ia-inline-compartilhamento, [data-action="abrir-ia-compartilhamento"]');
  if (btnInlineComp) {
    e.preventDefault();
    const compVal = el.inputMensagemCompartilhamento?.value || document.getElementById('input-mensagem-compartilhamento')?.value || el.inputTitulo?.value || '';
    abrirModalAssistenteIa(compVal, 'compartilhamento');
    return;
  }

  // Botão inline Título
  const btnInlineTit = e.target.closest('#btn-ia-inline-titulo, [data-action="abrir-ia-titulo"]');
  if (btnInlineTit) {
    e.preventDefault();
    const titVal = el.inputTitulo?.value || document.getElementById('input-titulo')?.value || '';
    abrirModalAssistenteIa(titVal, 'titulo');
    return;
  }

  // Botão inline Descrição
  const btnInlineDesc = e.target.closest('#btn-ia-inline-descricao, [data-action="abrir-ia-descricao"]');
  if (btnInlineDesc) {
    e.preventDefault();
    const descVal = el.inputDescricao?.value || document.getElementById('input-descricao')?.value || '';
    abrirModalAssistenteIa(descVal, 'descricao');
    return;
  }

  // Botões de Tom de Voz
  const btnTom = e.target.closest('.btn-ia-tom');
  if (btnTom && btnTom.dataset.tom) {
    e.preventDefault();
    selecionarTomIa(btnTom.dataset.tom);
    return;
  }
});

document.addEventListener('keydown', (e) => {
  const modal = el.modalAssistenteIa || document.getElementById('modal-assistente-ia');
  if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
    fecharModalAssistenteIa();
  }
});

console.log('[PostLink IA] Módulo do Assistente de IA carregado e inicializado.');

// Iniciar Aplicação
init();

