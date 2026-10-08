// public/admin/app.js - Painel Administrativo Executivo do PostLink
import { getSupabase } from '/assets/js/supabase-config.js';

const sb = getSupabase();

// Estado Global do Admin
const state = {
  user: null,
  dashboard: null,
  lojistas: [],
  topLinks: [],
  lojistaSelecionado: null,
  filtroStatus: 'todos',
  termoBusca: '',
  abaAtiva: 'visao-geral',
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

  // Métricas Faturamento
  valMrr: document.getElementById('val-mrr'),
  valProjecaoAnual: document.getElementById('val-projecao-anual'),
  valAtivas: document.getElementById('val-ativas'),
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
  modalLojistaStatus: document.getElementById('modal-lojista-status'),
  modalLojistaTrial: document.getElementById('modal-lojista-trial'),
  modalLojistaLinks: document.getElementById('modal-lojista-links'),
  modalLojistaBtnFechar: document.getElementById('modal-lojista-btn-fechar'),
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

  // Financeiro
  if (el.valMrr) el.valMrr.textContent = formatarBRL(m.mrr_estimado);
  if (el.valProjecaoAnual) el.valProjecaoAnual.textContent = `Projeção Anual: ${formatarBRL(m.projecao_anual)}`;
  if (el.valAtivas) el.valAtivas.textContent = m.lojas_ativas || 0;
  if (el.valTrial) el.valTrial.textContent = m.lojas_trial || 0;

  const total = m.total_lojas || 0;
  const ativas = m.lojas_ativas || 0;
  const pctConv = total > 0 ? ((ativas / total) * 100).toFixed(1) : '0,0';
  if (el.valConversao) el.valConversao.textContent = `${pctConv}%`;
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
      badgeStatus = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-secondary-dark">● Pro Ativo</span>';
    } else if (lj.status_assinatura === 'trial') {
      badgeStatus = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700">⏱️ Teste (${lj.dias_trial_restantes}d rest.)</span>`;
    } else {
      badgeStatus = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-error-container text-on-error-container">✕ Expirado</span>';
    }

    return `
      <tr class="hover:bg-surface-container-low/60 transition-colors">
        <td class="py-3 px-4">
          <div class="font-bold text-on-surface">${lj.nome}</div>
          <div class="text-[11px] font-mono text-primary">/${lj.slug}</div>
        </td>
        <td class="py-3 px-4 font-mono text-xs text-on-surface-variant">
          ${lj.email}
        </td>
        <td class="py-3 px-4">
          ${badgeStatus}
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
          <button type="button" class="btn-abrir-modal-acao bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-primary font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-all" data-id="${lj.loja_id}">
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
      const lojista = state.lojistas.find((l) => l.loja_id === lojaId);
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
    const fullUrl = `${window.location.origin}/${lk.loja_slug}/${lk.slug}`;
    const medalha = idx === 0 ? '🥇 1º' : (idx === 1 ? '🥈 2º' : (idx === 2 ? '🥉 3º' : `${idx + 1}º`));

    return `
      <tr class="hover:bg-surface-container-low/60 transition-colors">
        <td class="py-3 px-4 font-bold text-on-surface text-xs">${medalha}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-on-surface truncate max-w-xs">${lk.titulo || 'Sem título'}</div>
          <a href="${fullUrl}" target="_blank" class="text-[11px] font-mono text-primary hover:underline">
            /${lk.loja_slug}/${lk.slug}
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
  if (el.modalLojistaTrial) {
    el.modalLojistaTrial.textContent = lojista.status_assinatura === 'trial'
      ? `Restam ${lojista.dias_trial_restantes} dias (${formatarData(lojista.trial_ate)})`
      : (lojista.status_assinatura === 'ativo' ? 'Assinatura Pro Regular' : 'Período Expirado');
  }
  if (el.modalLojistaLinks) el.modalLojistaLinks.textContent = `${lojista.total_links} links cadastrados (máx v${lojista.max_versao})`;

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
    const lojaId = state.lojistaSelecionado.loja_id;

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
    });
  });

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
}

// Inicia
init();
