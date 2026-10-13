// public/assets/js/site-config-loader.js
// Carregamento dinâmico das configurações oficiais do PostLink (Banner, Título, Descrição, etc.)

(function () {
  const CACHE_KEY = 'postlink_site_config';

  // Função para aplicar os dados no DOM da página
  function aplicarConfiguracoes(config) {
    if (!config) return;

    // 1. Badge do Topo
    const badgeWrap = document.getElementById('hero-badge-wrap');
    const badgeTexto = document.getElementById('hero-badge-texto');
    if (badgeTexto && config.badge_texto) {
      badgeTexto.textContent = config.badge_texto;
      if (badgeWrap) badgeWrap.classList.remove('hidden');
    }

    // 2. Título Principal (Headline)
    const elTitulo = document.getElementById('hero-titulo');
    if (elTitulo && config.titulo) {
      // Se for o texto padrão original, preserva as tags de estilo e destaque
      const padraoOriginal = 'Transforme ofertas em cartões em alta definição que abrem sozinhos e vendem no WhatsApp';
      if (config.titulo === padraoOriginal) {
        elTitulo.innerHTML = `Transforme ofertas em <br class="hidden sm:inline">
          <span class="text-primary-container">cartões em alta definição</span> que <span class="text-secondary-dark underline decoration-secondary decoration-wavy">abrem sozinhos e vendem</span> no WhatsApp`;
      } else {
        elTitulo.textContent = config.titulo;
      }
    }

    // 3. Descrição / Subtítulo
    const elDesc = document.getElementById('hero-descricao');
    if (elDesc && config.descricao) {
      elDesc.textContent = config.descricao;
    }

    // 4. Banner Oficial da Home
    const bannerContainer = document.getElementById('hero-banner-container');
    const bannerImg = document.getElementById('hero-banner-img');
    if (bannerContainer && bannerImg) {
      const bannerAtivo = config.banner_ativo !== false;
      const temUrl = Boolean(config.banner_url && config.banner_url.trim());

      if (bannerAtivo && temUrl) {
        bannerImg.src = config.banner_url.trim();
        bannerContainer.classList.remove('hidden');
      } else {
        bannerContainer.classList.add('hidden');
      }
    }

    // 5. Botões de CTA
    const navCtaBtn = document.getElementById('nav-cta-btn');
    if (navCtaBtn && config.cta_texto) {
      const spanTexto = navCtaBtn.querySelector('span');
      if (spanTexto) spanTexto.textContent = config.cta_texto;
      if (config.cta_url) navCtaBtn.href = config.cta_url;
    }

    // 6. Atualiza Meta Tags Open Graph & Twitter Card
    if (config.titulo) {
      const ogTitle = document.getElementById('og-title') || document.querySelector('meta[property="og:title"]');
      const twTitle = document.getElementById('tw-title') || document.querySelector('meta[name="twitter:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${config.titulo} · PostLink`);
      if (twTitle) twTitle.setAttribute('content', `${config.titulo} · PostLink`);
    }

    if (config.descricao) {
      const ogDesc = document.getElementById('og-desc') || document.querySelector('meta[property="og:description"]');
      const twDesc = document.getElementById('tw-desc') || document.querySelector('meta[name="twitter:description"]');
      if (ogDesc) ogDesc.setAttribute('content', config.descricao);
      if (twDesc) twDesc.setAttribute('content', config.descricao);
    }

    if (config.banner_url && config.banner_ativo !== false) {
      const ogImg = document.getElementById('og-image') || document.querySelector('meta[property="og:image"]');
      const twImg = document.getElementById('tw-image') || document.querySelector('meta[name="twitter:image"]');
      if (ogImg) ogImg.setAttribute('content', config.banner_url);
      if (twImg) twImg.setAttribute('content', config.banner_url);
    }
  }

  // 1. Aplicação Imediata do Cache (Zero Flash / 0ms delay)
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      aplicarConfiguracoes(parsed);
    }
  } catch (_) {}

  // 2. Busca Atualizada em Background (Edge API ou Fallback)
  async function sincronizarConfiguracoes() {
    try {
      const res = await fetch('/api/configuracoes-site', {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Falha HTTP ' + res.status);
      const data = await res.json();

      if (data && data.titulo) {
        aplicarConfiguracoes(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (_) {}
      }
    } catch (err) {
      // Fallback secundário direto via REST Supabase se a rota da Edge falhar localmente
      try {
        const SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaWN3a2FnY3BodmVqenljbnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjQwOTksImV4cCI6MjEwNjgwMDA5OX0.RyxiEa0aojXvBaJTdIdtk1Sst35-mFDKXb_CTnt7WiA';
        const resFb = await fetch(`${SUPABASE_URL}/rest/v1/rpc/obter_configuracoes_site`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'authorization': `Bearer ${SUPABASE_KEY}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        if (resFb.ok) {
          const fbData = await resFb.json();
          if (fbData && fbData.titulo) {
            aplicarConfiguracoes(fbData);
            localStorage.setItem(CACHE_KEY, JSON.stringify(fbData));
          }
        }
      } catch (_) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sincronizarConfiguracoes);
  } else {
    sincronizarConfiguracoes();
  }
})();
