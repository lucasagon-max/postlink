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

    // 4. Banner / Foto de Exemplo da Vitrine na Landing Page
    const bannerContainer = document.getElementById('hero-banner-container');
    const bannerImg = document.getElementById('hero-banner-img');
    if (bannerImg) {
      const bannerAtivo = config.banner_ativo !== false;
      const vitrineUrl = (config.preview_imagem_url || config.banner_url || '').trim();
      const defaultImg = '/assets/img/logotipo_postlink.jpg';

      if (bannerAtivo) {
        bannerImg.src = vitrineUrl ? vitrineUrl : defaultImg;
        if (bannerContainer) {
          bannerContainer.classList.remove('hidden');
          bannerContainer.classList.remove('opacity-40');
        }
      } else {
        if (bannerContainer) bannerContainer.classList.add('opacity-40');
      }
    }

    // 4.1. Textos da Pré-visualização de Exemplo na Landing Page
    const elPreviewTexto = document.getElementById('hero-preview-texto');
    if (elPreviewTexto && (config.preview_descricao || config.preview_texto)) {
      elPreviewTexto.textContent = config.preview_descricao || config.preview_texto;
    }

    const elPreviewTitulo = document.getElementById('hero-preview-titulo');
    if (elPreviewTitulo && config.preview_titulo) {
      elPreviewTitulo.textContent = config.preview_titulo;
    }

    const elPreviewSubtitulo = document.getElementById('hero-preview-subtitulo');
    if (elPreviewSubtitulo && config.preview_subtitulo) {
      elPreviewSubtitulo.textContent = config.preview_subtitulo;
    }

    // 5. Botões de CTA
    const navCtaBtn = document.getElementById('nav-cta-btn');
    if (navCtaBtn && config.cta_texto) {
      const spanTexto = navCtaBtn.querySelector('span');
      if (spanTexto) spanTexto.textContent = config.cta_texto;
      if (config.cta_url) navCtaBtn.href = config.cta_url;
    }
    const heroCtaBtn = document.getElementById('hero-cta-btn');
    const heroCtaTexto = document.getElementById('hero-cta-texto');
    if (heroCtaBtn && config.cta_texto) {
      if (heroCtaTexto) {
        heroCtaTexto.textContent = config.cta_texto;
      } else {
        const spanTexto = heroCtaBtn.querySelector('span');
        if (spanTexto) spanTexto.textContent = config.cta_texto;
      }
      if (config.cta_url) heroCtaBtn.href = config.cta_url;
    }

    // 6. Atualiza Meta Tags Open Graph & Twitter Card do Link Oficial PostLink
    const ogTitleContent = config.oficial_og_titulo || (config.titulo ? `${config.titulo} · PostLink` : 'PostLink · Smart Links em Alta Definição para WhatsApp');
    const ogTitle = document.getElementById('og-title') || document.querySelector('meta[property="og:title"]');
    const twTitle = document.getElementById('tw-title') || document.querySelector('meta[name="twitter:title"]');
    if (ogTitle) ogTitle.setAttribute('content', ogTitleContent);
    if (twTitle) twTitle.setAttribute('content', ogTitleContent);

    const ogDescContent = config.oficial_og_descricao || config.descricao || 'Transforme fotos e ofertas em cartões inteligentes de alta definição que abrem sozinhos no WhatsApp e vendem com 1 clique.';
    const ogDesc = document.getElementById('og-desc') || document.querySelector('meta[property="og:description"]');
    const twDesc = document.getElementById('tw-desc') || document.querySelector('meta[name="twitter:description"]');
    if (ogDesc) ogDesc.setAttribute('content', ogDescContent);
    if (twDesc) twDesc.setAttribute('content', ogDescContent);

    let ogImgContent = config.oficial_og_imagem_url || config.banner_url || 'https://www.postlink.com.br/assets/img/banner_postlink_og_1200x630.jpg';
    if (ogImgContent.startsWith('/')) {
      ogImgContent = 'https://www.postlink.com.br' + ogImgContent;
    } else if (ogImgContent.startsWith('https://postlink.com.br/')) {
      ogImgContent = ogImgContent.replace('https://postlink.com.br/', 'https://www.postlink.com.br/');
    }

    if (ogImgContent) {
      const ogImg = document.getElementById('og-image') || document.querySelector('meta[property="og:image"]');
      const ogImgSec = document.querySelector('meta[property="og:image:secure_url"]');
      const twImg = document.getElementById('tw-image') || document.querySelector('meta[name="twitter:image"]');
      if (ogImg) ogImg.setAttribute('content', ogImgContent);
      if (ogImgSec) ogImgSec.setAttribute('content', ogImgContent);
      if (twImg) twImg.setAttribute('content', ogImgContent);
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
