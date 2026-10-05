// public/painel/app.js - Lógica SPA do Painel do Lojista
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
  dropzonePlaceholder: document.getElementById('dropzone-placeholder'),
  dropzonePreview: document.getElementById('dropzone-preview'),
  imgSelecionada: document.getElementById('img-selecionada'),
  infoArquivo: document.getElementById('info-arquivo'),
  btnTrocarFoto: document.getElementById('btn-trocar-foto'),
  inputDestino: document.getElementById('input-destino'),
  togglePersonalizar: document.getElementById('toggle-personalizar'),
  conteudoPersonalizar: document.getElementById('conteudo-personalizar'),
  setaPersonalizar: document.getElementById('seta-personalizar'),
  inputTitulo: document.getElementById('input-titulo'),
  inputDescricao: document.getElementById('input-descricao'),
  inputSlug: document.getElementById('input-slug'),
  inputValidoAte: document.getElementById('input-valido-ate'),
  btnSubmeterLink: document.getElementById('btn-submeter-link'),

  // Live Preview WhatsApp
  waCardImg: document.getElementById('wa-card-img'),
  waCardTitle: document.getElementById('wa-card-title'),
  waCardDesc: document.getElementById('wa-card-desc'),
  waCardHost: document.getElementById('wa-card-host'),
  waBubbleLink: document.getElementById('wa-bubble-link'),

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
  const div = document.createElement('div');
  div.className = `toast toast-${tipo}`;
  div.textContent = msg;
  c.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// Inicialização da Sessão
async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = '/login/';
    return;
  }
  state.user = session.user;

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
    el.onboardingPrefixo.textContent = window.location.origin + '/';
    return;
  }

  state.loja = lojas[0];
  el.navLojaNome.textContent = state.loja.nome;
  el.navLojaNome.style.display = 'inline';
  el.btnNovoLinkTop.style.display = 'inline-flex';

  // Busca dados de assinatura
  const { data: assinaturas } = await sb
    .from('assinaturas')
    .select('*')
    .eq('loja_id', state.loja.id);

  if (assinaturas && assinaturas.length > 0) {
    state.assinatura = assinaturas[0];
    atualizarBarraAssinatura();
  }

  // Ouvir mudanças de hash de navegação
  window.addEventListener('hashchange', router);
  router();
}

function atualizarBarraAssinatura() {
  if (!state.assinatura) return;
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
    el.bannerTrial.style.background = '#064e3b';
    el.bannerTrial.style.borderColor = '#059669';
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
  el.viewLoading.style.display = 'none';
  el.viewOnboarding.style.display = nome === 'onboarding' ? 'block' : 'none';
  el.viewLista.style.display = nome === 'lista' ? 'block' : 'none';
  el.viewFormLink.style.display = nome === 'form' ? 'block' : 'none';
  el.viewConta.style.display = nome === 'conta' ? 'block' : 'none';
}

// ONBOARDING
el.onboardingNome.addEventListener('input', () => {
  if (!el.onboardingSlug.dataset.manual) {
    const s = el.onboardingNome.value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
    el.onboardingSlug.value = s;
  }
});

el.onboardingSlug.addEventListener('input', () => {
  el.onboardingSlug.dataset.manual = 'true';
});

el.formOnboarding.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = el.onboardingNome.value.trim();
  const slug = el.onboardingSlug.value.trim().toLowerCase();

  const btn = document.getElementById('btn-salvar-loja');
  btn.disabled = true;
  btn.textContent = 'Criando loja…';

  try {
    const { error } = await sb.rpc('criar_loja', { p_nome: nome, p_slug: slug });
    if (error) throw error;

    toast('Loja cadastrada com sucesso!', 'success');
    window.location.reload();
  } catch (err) {
    toast('Erro ao cadastrar loja: ' + (err.message || err), 'error');
    btn.disabled = false;
    btn.textContent = 'Começar Teste Grátis (7 Dias)';
  }
});

// LISTA DE LINKS
async function carregarLinks() {
  el.gridLinks.innerHTML = '<p style="color:var(--text-muted);">Atualizando lista…</p>';

  // Busca links da loja
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

  // Busca estatísticas consolidadas
  try {
    const { data: stats } = await sb.rpc('estatisticas_links', { p_dias: 30 });
    state.estatisticas = {};
    if (stats) {
      stats.forEach((s) => {
        state.estatisticas[s.link_id] = s;
      });
    }
  } catch (e) {
    // Silencioso se RPC falhar temporariamente
  }

  renderizarLinks();
}

function renderizarLinks() {
  el.contadorLinks.textContent = `${state.links.length} link(s) cadastrado(s)`;

  if (state.links.length === 0) {
    el.listaVazia.style.display = 'block';
    el.gridLinks.style.display = 'none';
    return;
  }

  el.listaVazia.style.display = 'none';
  el.gridLinks.style.display = 'grid';
  el.gridLinks.innerHTML = '';

  state.links.forEach((link) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.justifyContent = 'space-between';

    const fullUrl = `${window.location.origin}/${state.loja.slug}/${link.slug}`;
    const { data: { publicUrl } } = sb.storage.from('banners').getPublicUrl(link.imagem_path);
    const imgUrl = `${publicUrl}?v=${link.versao || 1}`;
    const st = state.estatisticas[link.id] || { total: 0, recentes: 0 };

    card.innerHTML = `
      <div>
        <div style="position:relative; aspect-ratio:1.91/1; border-radius:10px; overflow:hidden; background:#0b1120; margin-bottom:12px;">
          <img src="${imgUrl}" alt="${link.titulo || 'Banner'}" style="width:100%; height:100%; object-fit:cover;">
          <span style="position:absolute; top:8px; right:8px; font-size:0.75rem; font-weight:700; padding:3px 8px; border-radius:6px; background:${link.ativo ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)'}; color:#fff;">
            ${link.ativo ? 'Ativo' : 'Pausado'}
          </span>
        </div>

        <h4 style="font-size:1.05rem; font-weight:700; margin-bottom:4px; line-height:1.3;">
          ${link.titulo || state.loja.nome}
        </h4>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px; word-break:break-all;">
          🔗 <span style="color:#38bdf8;">/${state.loja.slug}/${link.slug}</span>
        </p>

        <div style="background:#090e1a; border-radius:8px; padding:8px 12px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; color:var(--text-dim);">Cliques (30d / Total):</span>
          <strong style="font-size:0.92rem; color:#fff;">${st.recentes} / ${st.total}</strong>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; gap:6px;">
          <button class="btn btn-secondary btn-sm btn-copiar" data-url="${fullUrl}" style="flex:1;">
            📋 Copiar
          </button>
          <a href="https://wa.me/?text=${encodeURIComponent(fullUrl)}" target="_blank" class="btn btn-whatsapp btn-sm" style="flex:1;">
            💬 Enviar
          </a>
        </div>
        <div style="display:flex; gap:6px;">
          <a href="#/editar/${link.id}" class="btn btn-secondary btn-sm" style="flex:1;">
            ✏️ Editar
          </a>
          <button class="btn btn-danger-subtle btn-sm btn-toggle-ativo" data-id="${link.id}" data-ativo="${link.ativo}" style="flex:1;">
            ${link.ativo ? 'Pausar' : 'Ativar'}
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
  el.tituloFormLink.textContent = 'Criar Novo Link para WhatsApp';
  el.btnSubmeterLink.textContent = 'Gerar Link para WhatsApp';
  el.formLink.reset();

  el.dropzonePlaceholder.style.display = 'block';
  el.dropzonePreview.style.display = 'none';
  el.imgSelecionada.src = '';
  el.infoArquivo.textContent = '';

  el.conteudoPersonalizar.style.display = 'none';
  el.setaPersonalizar.textContent = '▼';

  atualizarLivePreview();
}

async function prepararFormularioEdicao(id) {
  state.arquivoBlob = null;
  el.tituloFormLink.textContent = 'Editar Link';
  el.btnSubmeterLink.textContent = 'Salvar Alterações';

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
  el.inputDestino.value = link.destino;
  el.inputTitulo.value = link.titulo || '';
  el.inputDescricao.value = link.descricao || '';
  el.inputSlug.value = link.slug;
  if (link.valido_ate) {
    el.inputValidoAte.value = new Date(link.valido_ate).toISOString().slice(0, 16);
  } else {
    el.inputValidoAte.value = '';
  }

  // Preview da foto atual
  const { data: { publicUrl } } = sb.storage.from('banners').getPublicUrl(link.imagem_path);
  const imgUrl = `${publicUrl}?v=${link.versao}`;
  el.imgSelecionada.src = imgUrl;
  el.infoArquivo.textContent = 'Foto atual do banner mantida';
  el.dropzonePlaceholder.style.display = 'none';
  el.dropzonePreview.style.display = 'block';

  el.conteudoPersonalizar.style.display = 'block';
  el.setaPersonalizar.textContent = '▲';

  atualizarLivePreview();
}

// Toggle do Acordeão de Personalização
el.togglePersonalizar.addEventListener('click', () => {
  const aberto = el.conteudoPersonalizar.style.display === 'block';
  el.conteudoPersonalizar.style.display = aberto ? 'none' : 'block';
  el.setaPersonalizar.textContent = aberto ? '▼' : '▲';
});

// Dropzone e Seleção de Imagem
el.dropzone.addEventListener('click', (e) => {
  if (e.target !== el.btnTrocarFoto) {
    el.inputArquivo.click();
  }
});
el.btnTrocarFoto.addEventListener('click', () => el.inputArquivo.click());

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
  const files = dt.files;
  if (files.length > 0) {
    tratarArquivoSelecionado(files[0]);
  }
});

el.inputArquivo.addEventListener('change', () => {
  if (el.inputArquivo.files.length > 0) {
    tratarArquivoSelecionado(el.inputArquivo.files[0]);
  }
});

async function tratarArquivoSelecionado(file) {
  if (!file.type.startsWith('image/')) {
    toast('Por favor, selecione um arquivo de imagem (JPEG, PNG ou WebP).', 'error');
    return;
  }

  el.infoArquivo.textContent = 'Comprimindo foto no navegador…';
  el.dropzonePlaceholder.style.display = 'none';
  el.dropzonePreview.style.display = 'block';

  try {
    const blob = await comprimirImagem(file, { larguraMax: 1200, alvoKB: 300 });
    state.arquivoBlob = blob;

    const urlPreview = URL.createObjectURL(blob);
    el.imgSelecionada.src = urlPreview;
    el.waCardImg.src = urlPreview;
    const tamanhoKB = Math.round(blob.size / 1024);
    el.infoArquivo.textContent = `✓ Imagem otimizada: ${tamanhoKB} KB (máx 1200x630)`;
  } catch (err) {
    toast('Erro na imagem: ' + err.message, 'error');
    el.dropzonePlaceholder.style.display = 'block';
    el.dropzonePreview.style.display = 'none';
    state.arquivoBlob = null;
  }
}

// Atualização Reativa do Live Preview WhatsApp
function atualizarLivePreview() {
  const lojaNome = state.loja ? state.loja.nome : 'Sua Loja';
  const lojaSlug = state.loja ? state.loja.slug : 'loja';
  const titulo = el.inputTitulo.value.trim() || lojaNome;
  const desc = el.inputDescricao.value.trim();
  const slug = el.inputSlug.value.trim() || 'abc12';

  el.waCardTitle.textContent = titulo;
  if (desc) {
    el.waCardDesc.textContent = desc;
    el.waCardDesc.style.display = 'block';
  } else {
    el.waCardDesc.style.display = 'none';
  }

  el.waCardHost.textContent = window.location.host;
  el.waBubbleLink.textContent = `${window.location.origin}/${lojaSlug}/${slug}`;
}

[el.inputTitulo, el.inputDescricao, el.inputSlug].forEach((input) => {
  input.addEventListener('input', atualizarLivePreview);
});

// Envio do Formulário (Criar / Editar)
el.formLink.addEventListener('submit', async (e) => {
  e.preventDefault();

  const destinoBruto = el.inputDestino.value.trim();
  const destino = normalizarDestino(destinoBruto);

  if (!destino) {
    toast('Insira uma URL https:// válida ou um número de WhatsApp com DDD.', 'error');
    el.inputDestino.focus();
    return;
  }

  if (!state.linkEditando && !state.arquivoBlob) {
    toast('Por favor, selecione uma imagem para o cartão.', 'error');
    el.inputArquivo.click();
    return;
  }

  el.btnSubmeterLink.disabled = true;
  el.btnSubmeterLink.textContent = 'Gravando link…';

  try {
    const titulo = el.inputTitulo.value.trim() || null;
    const descricao = el.inputDescricao.value.trim() || null;
    const slugDesejado = el.inputSlug.value.trim().toLowerCase() || null;
    const validoAte = el.inputValidoAte.value ? new Date(el.inputValidoAte.value).toISOString() : null;

    if (state.linkEditando) {
      // MODO EDIÇÃO
      let caminhoImagem = state.linkEditando.imagem_path;
      let versao = state.linkEditando.versao || 1;

      // Se enviou nova imagem na edição, gera nova versão
      if (state.arquivoBlob) {
        versao += 1;
        caminhoImagem = `${state.user.id}/${state.linkEditando.id}-v${versao}.jpg`;
        const { error: errUpload } = await sb.storage
          .from('banners')
          .upload(caminhoImagem, state.arquivoBlob, { contentType: 'image/jpeg' });
        if (errUpload) throw errUpload;
      }

      const { error: errUpdate } = await sb
        .from('links')
        .update({
          destino,
          titulo,
          descricao,
          valido_ate: validoAte,
          imagem_path: caminhoImagem,
          versao,
          slug: slugDesejado || state.linkEditando.slug,
        })
        .eq('id', state.linkEditando.id);

      if (errUpdate) throw errUpdate;

      toast('Link atualizado com sucesso!', 'success');
      window.location.hash = '#/';
    } else {
      // MODO CRIAÇÃO (com rollback se falhar)
      const linkId = crypto.randomUUID();
      const versao = 1;
      const caminhoImagem = `${state.user.id}/${linkId}-v${versao}.jpg`;

      // Upload da foto comprimida no bucket
      const { error: errUpload } = await sb.storage
        .from('banners')
        .upload(caminhoImagem, state.arquivoBlob, { contentType: 'image/jpeg' });

      if (errUpload) throw errUpload;

      // Tenta inserir o registro (com retry para slug automático em caso de colisão rara)
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

        // Se deu erro de colisão e o slug era automático, tenta outro
        if (errInsert.code === '23505' && !slugDesejado) {
          continue;
        }

        // Se falhou por outro motivo, desfaz upload da imagem
        await sb.storage.from('banners').remove([caminhoImagem]);
        throw errInsert;
      }

      if (!sucesso) {
        await sb.storage.from('banners').remove([caminhoImagem]);
        throw new Error('Não foi possível gerar um apelido livre para o link. Tente novamente.');
      }

      // Exibe Modal de Sucesso
      const linkPronto = `${window.location.origin}/${state.loja.slug}/${slugFinal}`;
      exibirModalSucesso(linkPronto);
    }
  } catch (err) {
    toast('Erro: ' + (err.message || err), 'error');
  } finally {
    el.btnSubmeterLink.disabled = false;
    el.btnSubmeterLink.textContent = state.linkEditando ? 'Salvar Alterações' : 'Gerar Link para WhatsApp';
  }
});

function exibirModalSucesso(url) {
  el.modalInputLink.value = url;
  el.modalBtnWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(url)}`;
  el.modalSucesso.style.display = 'flex';
}

el.modalBtnCopiar.addEventListener('click', () => {
  navigator.clipboard.writeText(el.modalInputLink.value);
  toast('Link copiado com sucesso!', 'success');
});

el.modalBtnFechar.addEventListener('click', () => {
  el.modalSucesso.style.display = 'none';
  window.location.hash = '#/';
});

// TELA DA CONTA
function prepararTelaConta() {
  el.contaEmail.textContent = state.user.email;
  el.contaLojaNome.textContent = state.loja ? state.loja.nome : '-';
  el.contaLojaSlug.textContent = state.loja ? state.loja.slug : '-';
  el.contaStatus.textContent = (state.assinatura ? state.assinatura.status : 'trial').toUpperCase();
}

// LOGOUT
el.btnSair.addEventListener('click', async () => {
  await sb.auth.signOut();
  window.location.href = '/login/';
});

// Start
init();
