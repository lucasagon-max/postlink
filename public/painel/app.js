// public/painel/app.js - Lógica SPA do Painel do Lojista (PostLink)
import { getSupabase } from '/assets/js/supabase-config.js';
import { comprimirImagem, normalizarDestino, slugAleatorio } from '/assets/js/compressao.js';

const sb = getSupabase();

// Estado Global da Aplicação
const state = {
  user: null,
  loja: null,
  assinatura: null,
  links: [],
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
  viewConta: document.getElementById('view-conta'),

  navLojaNome: document.getElementById('nav-loja-nome'),
  btnNovoLinkTop: document.getElementById('btn-novo-link-top'),
  btnSair: document.getElementById('btn-sair'),

  // Onboarding
  formOnboarding: document.getElementById('form-onboarding'),
  onboardingNome: document.getElementById('onboarding-nome'),
  onboardingSlug: document.getElementById('onboarding-slug'),
  onboardingPrefixo: document.getElementById('onboarding-prefixo'),

  // Lista
  bannerTrial: document.getElementById('banner-trial'),
  textoTrial: document.getElementById('texto-trial'),
  listaVazia: document.getElementById('lista-vazia'),
  gridLinks: document.getElementById('grid-links'),
  contadorLinks: document.getElementById('contador-links'),

  // Form Link
  tituloFormLink: document.getElementById('titulo-form-link'),
  formLink: document.getElementById('form-link'),
  inputArquivo: document.getElementById('input-arquivo'),
  dropzone: document.getElementById('dropzone'),
  fname: document.getElementById('fname'),
  infoArquivo: document.getElementById('info-arquivo'),
  eImg: document.getElementById('e-img'),
  inputDestino: document.getElementById('input-destino'),
  eDest: document.getElementById('e-dest'),
  detalhesPersonalizar: document.getElementById('detalhes-personalizar'),
  inputTitulo: document.getElementById('input-titulo'),
  inputDescricao: document.getElementById('input-descricao'),
  inputSlug: document.getElementById('input-slug'),
  inputValidoAte: document.getElementById('input-valido-ate'),
  btnSubmeterLink: document.getElementById('btn-submeter-link'),

  // Live Preview WhatsApp (Conforme exemplo)
  ph: document.getElementById('ph'),
  im: document.getElementById('im'),
  pt: document.getElementById('pt'),
  pd: document.getElementById('pd'),
  waCardHost: document.getElementById('wa-card-host'),
  pu: document.getElementById('pu'),

  // Box Sucesso Inline (Conforme exemplo)
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

  // Conta
  contaEmail: document.getElementById('conta-email'),
  contaLojaNome: document.getElementById('conta-loja-nome'),
  contaLojaSlug: document.getElementById('conta-loja-slug'),
  contaStatus: document.getElementById('conta-status'),
};

// Feedback Toast
function toast(msg, tipo = 'info') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const div = document.createElement('div');
  div.className = `toast toast-${tipo}`;
  div.textContent = msg;
  c.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// Normalização de slug no estilo do exemplo
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
  // Se veio com erro no hash ou query (ex: link expirado), repassa para login com o aviso
  const hashStr = window.location.hash.replace(/^#/, '');
  const searchStr = window.location.search.replace(/^\?/, '');
  const params = new URLSearchParams(hashStr || searchStr);
  if (params.get('error_description') || params.get('error_code')) {
    window.location.href = `/login/#${hashStr || searchStr}`;
    return;
  }

  // Listener para capturar autenticação quando o token está sendo processado na URL
  sb.auth.onAuthStateChange(async (event, session) => {
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && !state.user) {
      state.user = session.user;
      await carregarDadosLojaEAssinatura();
    }
  });

  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    // Se a URL contiver access_token, aguarda o evento do Supabase antes de sair
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
  // Busca dados da loja
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
    el.navLojaNome.style.display = 'inline';
  }
  if (el.btnNovoLinkTop) {
    el.btnNovoLinkTop.style.display = 'inline-flex';
  }

  // Busca dados de assinatura
  const { data: assinaturas } = await sb
    .from('assinaturas')
    .select('*')
    .eq('loja_id', state.loja.id);

  if (assinaturas && assinaturas.length > 0) {
    state.assinatura = assinaturas[0];
    atualizarBarraAssinatura();
  }

  // Router por hash
  window.addEventListener('hashchange', router);
  router();
}

function atualizarBarraAssinatura() {
  if (!state.assinatura || !el.textoTrial) return;
  const trialAte = new Date(state.assinatura.trial_ate);
  const hoje = new Date();
  const diffDias = Math.ceil((trialAte - hoje) / (1000 * 60 * 60 * 24));

  if (state.assinatura.status === 'trial') {
    if (diffDias > 0) {
      el.textoTrial.innerHTML = `Período de teste ativo: restam <strong>${diffDias} dias</strong> de uso completo.`;
    } else {
      el.textoTrial.innerHTML = `Seu período de teste expirou.`;
    }
  } else if (state.assinatura.status === 'ativo') {
    if (el.bannerTrial) {
      el.bannerTrial.style.background = 'var(--bg-success)';
      el.bannerTrial.style.borderColor = 'var(--border-success)';
    }
    el.textoTrial.innerHTML = `Assinatura ativa e regular.`;
  }
}

// Router SPA por Hash
async function router() {
  const hash = window.location.hash || '#/';
  
  if (hash === '#/' || hash === '') {
    mostrarView('lista');
    await carregarLinks();
  } else if (hash === '#/novo') {
    prepararFormularioNovo();
    mostrarView('form');
  } else if (hash.startsWith('#/editar/')) {
    const id = hash.replace('#/editar/', '');
    await prepararFormularioEdicao(id);
    mostrarView('form');
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
  if (el.viewConta) el.viewConta.style.display = nome === 'conta' ? 'block' : 'none';
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
    const slug = el.onboardingSlug.value.trim().toLowerCase();

    const btn = document.getElementById('btn-salvar-loja');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Criando loja…';
    }

    try {
      const { error } = await sb.rpc('criar_loja', { p_nome: nome, p_slug: slug });
      if (error) throw error;

      toast('Loja cadastrada com sucesso!', 'success');
      window.location.reload();
    } catch (err) {
      toast('Erro ao cadastrar loja: ' + (err.message || err), 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Começar Teste Grátis (7 Dias)';
      }
    }
  });
}

// LISTA DE LINKS
async function carregarLinks() {
  if (el.gridLinks) {
    el.gridLinks.innerHTML = '<p style="color:var(--text-secondary); font-size:13px;">Atualizando lista…</p>';
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

  // Estatísticas
  try {
    const { data: stats } = await sb.rpc('estatisticas_links', { p_dias: 30 });
    state.estatisticas = {};
    if (stats) {
      stats.forEach((s) => {
        state.estatisticas[s.link_id] = s;
      });
    }
  } catch (e) {
    // Silencioso se RPC não estiver ativa
  }

  renderizarLinks();
}

function renderizarLinks() {
  if (el.contadorLinks) {
    el.contadorLinks.textContent = `${state.links.length} link(s) cadastrado(s)`;
  }

  if (state.links.length === 0) {
    if (el.listaVazia) el.listaVazia.style.display = 'block';
    if (el.gridLinks) el.gridLinks.style.display = 'none';
    return;
  }

  if (el.listaVazia) el.listaVazia.style.display = 'none';
  if (el.gridLinks) {
    el.gridLinks.style.display = 'grid';
    el.gridLinks.innerHTML = '';
  }

  state.links.forEach((link) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.justifyContent = 'space-between';
    card.style.padding = '14px';

    const fullUrl = `${window.location.origin}/${state.loja.slug}/${link.slug}`;
    const { data: { publicUrl } } = sb.storage.from('banners').getPublicUrl(link.imagem_path);
    const imgUrl = `${publicUrl}?v=${link.versao || 1}`;
    const st = state.estatisticas[link.id] || { total: 0, recentes: 0 };

    card.innerHTML = `
      <div>
        <div style="position:relative; aspect-ratio:1.91/1; border-radius:8px; overflow:hidden; background:var(--surface-1); margin-bottom:10px;">
          <img src="${imgUrl}" alt="${link.titulo || 'Banner'}" style="width:100%; height:100%; object-fit:cover;">
          <span style="position:absolute; top:6px; right:6px; font-size:11px; font-weight:600; padding:2px 7px; border-radius:4px; background:${link.ativo ? 'var(--bg-success)' : 'var(--bg-danger)'}; color:${link.ativo ? 'var(--text-success)' : 'var(--text-danger)'}; border:0.5px solid ${link.ativo ? 'var(--border-success)' : 'var(--border-danger)'};">
            ${link.ativo ? 'Ativo' : 'Pausado'}
          </span>
        </div>

        <h4 style="font-size:14px; font-weight:600; margin-bottom:4px; line-height:1.3; color:var(--text-primary);">
          ${link.titulo || state.loja.nome}
        </h4>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:8px; font-family:var(--font-mono); word-break:break-all;">
          /${state.loja.slug}/${link.slug}
        </p>

        <div style="background:var(--surface-1); border-radius:6px; padding:6px 10px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:var(--text-secondary);">Cliques (30d / Total):</span>
          <strong style="font-size:12px; color:var(--text-primary); font-family:var(--font-mono);">${st.recentes} / ${st.total}</strong>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; gap:6px;">
          <button class="btn btn-secondary btn-sm btn-copiar" data-url="${fullUrl}" style="flex:1;">
            <i class="ti ti-copy"></i> Copiar
          </button>
          <a href="https://wa.me/?text=${encodeURIComponent(fullUrl)}" target="_blank" class="btn btn-whatsapp btn-sm" style="flex:1; text-decoration:none;">
            <i class="ti ti-brand-whatsapp"></i> Enviar
          </a>
        </div>
        <div style="display:flex; gap:6px;">
          <a href="#/editar/${link.id}" class="btn btn-secondary btn-sm" style="flex:1;">
            <i class="ti ti-pencil"></i> Editar
          </a>
          <button class="btn btn-danger-subtle btn-sm btn-toggle-ativo" data-id="${link.id}" data-ativo="${link.ativo}" style="flex:1;">
            ${link.ativo ? '<i class="ti ti-player-pause"></i> Pausar' : '<i class="ti ti-player-play"></i> Ativar'}
          </button>
        </div>
      </div>
    `;

    el.gridLinks.appendChild(card);
  });

  // Ações de botões na lista
  document.querySelectorAll('.btn-copiar').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      navigator.clipboard.writeText(url);
      const originalText = btn.innerHTML;
      btn.textContent = 'Copiado!';
      setTimeout(() => { btn.innerHTML = originalText; }, 1800);
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

// FORMULÁRIO (NOVO / EDITAR)
function prepararFormularioNovo() {
  state.linkEditando = null;
  state.arquivoBlob = null;
  
  if (el.tituloFormLink) el.tituloFormLink.textContent = 'Novo link';
  if (el.btnSubmeterLink) el.btnSubmeterLink.textContent = 'Criar link';
  if (el.formLink) el.formLink.reset();

  if (el.fname) el.fname.textContent = 'Escolher da galeria';
  if (el.infoArquivo) {
    el.infoArquivo.textContent = '';
    el.infoArquivo.style.display = 'none';
  }
  if (el.eImg) el.eImg.textContent = '';
  if (el.eDest) el.eDest.textContent = '';
  if (el.res) el.res.hidden = true;

  if (el.inputSlug) {
    el.inputSlug.value = slugAleatorio();
  }

  if (el.detalhesPersonalizar) {
    el.detalhesPersonalizar.open = false;
  }

  // Reseta Live Preview
  if (el.ph) el.ph.style.display = 'flex';
  if (el.im) {
    el.im.style.display = 'none';
    el.im.src = '';
  }

  atualizarLivePreview();
}

async function prepararFormularioEdicao(id) {
  state.arquivoBlob = null;
  if (el.tituloFormLink) el.tituloFormLink.textContent = 'Editar link';
  if (el.btnSubmeterLink) el.btnSubmeterLink.textContent = 'Salvar alterações';
  if (el.res) el.res.hidden = true;
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
  if (el.inputDestino) el.inputDestino.value = link.destino;
  if (el.inputTitulo) el.inputTitulo.value = link.titulo || '';
  if (el.inputDescricao) el.inputDescricao.value = link.descricao || '';
  if (el.inputSlug) el.inputSlug.value = link.slug;
  if (el.inputValidoAte) {
    el.inputValidoAte.value = link.valido_ate ? new Date(link.valido_ate).toISOString().slice(0, 16) : '';
  }

  // Foto existente
  const { data: { publicUrl } } = sb.storage.from('banners').getPublicUrl(link.imagem_path);
  const imgUrl = `${publicUrl}?v=${link.versao}`;
  
  if (el.fname) el.fname.textContent = 'Trocar imagem atual';
  if (el.im) {
    el.im.src = imgUrl;
    el.im.style.display = 'block';
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
      el.dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    el.dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      el.dropzone.classList.remove('dragover');
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
    el.infoArquivo.textContent = 'Otimizando imagem…';
    el.infoArquivo.style.display = 'block';
  }

  try {
    const blob = await comprimirImagem(file, { larguraMax: 1200, alvoKB: 300 });
    state.arquivoBlob = blob;

    const urlPreview = URL.createObjectURL(blob);
    if (el.im) {
      el.im.src = urlPreview;
      el.im.style.display = 'block';
    }
    if (el.ph) el.ph.style.display = 'none';

    const tamanhoKB = Math.round(blob.size / 1024);
    if (el.infoArquivo) {
      el.infoArquivo.textContent = `✓ Imagem otimizada (${tamanhoKB} KB)`;
    }
  } catch (err) {
    if (el.eImg) el.eImg.textContent = 'Erro ao processar imagem: ' + err.message;
    state.arquivoBlob = null;
  }
}

// Atualização Reativa do Live Preview WhatsApp
function fullUrlExibicao() {
  const lojaSlug = state.loja ? state.loja.slug : 'loja';
  const slug = el.inputSlug ? limparSlug(el.inputSlug.value).replace(/^-|-$/g, '') || 'link' : 'link';
  const host = window.location.host || 'postlink.app';
  return `${host}/${lojaSlug}/${slug}`;
}

function atualizarLivePreview() {
  const lojaNome = state.loja ? state.loja.nome : 'Morangos Tatuí';
  const titulo = (el.inputTitulo && el.inputTitulo.value.trim()) || lojaNome;
  const desc = el.inputDescricao ? el.inputDescricao.value.trim() : '';
  const urlTexto = fullUrlExibicao();

  if (el.pt) el.pt.textContent = titulo;
  if (el.pd) {
    el.pd.textContent = desc;
    el.pd.style.display = desc ? 'block' : 'none';
  }
  if (el.waCardHost) {
    el.waCardHost.textContent = window.location.host || 'postlink.app';
  }
  if (el.pu) {
    el.pu.textContent = 'https://' + urlTexto;
  }
}

if (el.inputTitulo) el.inputTitulo.addEventListener('input', atualizarLivePreview);
if (el.inputDescricao) el.inputDescricao.addEventListener('input', atualizarLivePreview);
if (el.inputSlug) {
  el.inputSlug.addEventListener('input', () => {
    el.inputSlug.value = limparSlug(el.inputSlug.value);
    atualizarLivePreview();
  });
}
if (el.inputDestino) {
  el.inputDestino.addEventListener('input', () => {
    if (el.eDest) el.eDest.textContent = '';
  });
}

// Envio do Formulário (Criar / Editar)
if (el.formLink) {
  el.formLink.addEventListener('submit', async (e) => {
    e.preventDefault();

    const destinoBruto = el.inputDestino ? el.inputDestino.value.trim() : '';
    const destino = normalizarDestino(destinoBruto);

    if (!destino) {
      if (el.eDest) el.eDest.textContent = 'Cole um link que comece com https:// ou um número de WhatsApp com DDD.';
      if (el.inputDestino) el.inputDestino.focus();
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
        // MODO EDIÇÃO
        let caminhoImagem = state.linkEditando.imagem_path;
        let versao = state.linkEditando.versao || 1;

        if (state.arquivoBlob) {
          versao += 1;
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

        toast('Link atualizado com sucesso!', 'success');
        const linkPronto = `${window.location.origin}/${state.loja.slug}/${slugFinal}`;
        exibirResultadoCriado(linkPronto);
      } else {
        // MODO CRIAÇÃO
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
      toast('Erro: ' + (err.message || err), 'error');
    } finally {
      if (el.btnSubmeterLink) {
        el.btnSubmeterLink.disabled = false;
        el.btnSubmeterLink.textContent = state.linkEditando ? 'Salvar alterações' : 'Criar link';
      }
    }
  });
}

function exibirResultadoCriado(url) {
  // 1. Atualiza caixa inline exatamente como no exemplo
  if (el.ru) el.ru.textContent = url;
  if (el.btnShareInline) el.btnShareInline.href = `https://wa.me/?text=${encodeURIComponent(url)}`;
  if (el.res) el.res.hidden = false;

  // 2. Preenche e exibe modal de sucesso amigável
  if (el.modalInputLink) el.modalInputLink.value = url;
  if (el.modalBtnWhatsapp) el.modalBtnWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(url)}`;
  if (el.modalSucesso) el.modalSucesso.style.display = 'flex';
}

// Ações do botão copiar inline (#cp do exemplo)
if (el.cp) {
  el.cp.addEventListener('click', () => {
    const url = el.ru ? el.ru.textContent : '';
    if (!url) return;
    try {
      navigator.clipboard.writeText(url);
    } catch (e) {}
    el.cp.textContent = 'Link copiado';
    setTimeout(() => { el.cp.textContent = 'Copiar link'; }, 2000);
    toast('Link copiado com sucesso!', 'success');
  });
}

// Ações do Modal de Sucesso
if (el.modalBtnCopiar) {
  el.modalBtnCopiar.addEventListener('click', () => {
    if (el.modalInputLink) {
      navigator.clipboard.writeText(el.modalInputLink.value);
      toast('Link copiado com sucesso!', 'success');
    }
  });
}

if (el.modalBtnFechar) {
  el.modalBtnFechar.addEventListener('click', () => {
    if (el.modalSucesso) el.modalSucesso.style.display = 'none';
    window.location.hash = '#/';
  });
}

// TELA DA CONTA
function prepararTelaConta() {
  if (el.contaEmail) el.contaEmail.textContent = state.user.email;
  if (el.contaLojaNome) el.contaLojaNome.textContent = state.loja ? state.loja.nome : '-';
  if (el.contaLojaSlug) el.contaLojaSlug.textContent = state.loja ? state.loja.slug : '-';
  if (el.contaStatus) el.contaStatus.textContent = (state.assinatura ? state.assinatura.status : 'trial').toUpperCase();
}

// LOGOUT
if (el.btnSair) {
  el.btnSair.addEventListener('click', async () => {
    await sb.auth.signOut();
    window.location.href = '/login/';
  });
}

// Inicializa Aplicação
init();
