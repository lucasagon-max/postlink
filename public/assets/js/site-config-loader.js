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
    const heroVitrineImg = document.getElementById('hero-vitrine-img');
    const vitrineDemoImg = document.getElementById('vitrine-demo-main-img');
    const vitrineUrl = (config.preview_imagem_url || config.banner_url || '').trim();
    const bannerAtivo = config.banner_ativo !== false;
    const defaultImg = '/assets/img/logotipo_postlink.jpg';

    if (bannerImg) {
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

    // 4.1. Carrossel de Fotos da Vitrine (Hero e Seção #vitrine)
    let vitrineFotos = [];
    if (Array.isArray(config.vitrine_fotos) && config.vitrine_fotos.length > 0) {
      vitrineFotos = config.vitrine_fotos.filter(Boolean);
    } else if (vitrineUrl) {
      vitrineFotos = [vitrineUrl, '/assets/img/Ex01.png', '/assets/img/logotipo_postlink.jpg'];
    } else {
      vitrineFotos = ['/assets/img/ex02.png', '/assets/img/Ex01.png', '/assets/img/logotipo_postlink.jpg'];
    }

    if (heroVitrineImg && vitrineFotos.length > 0) {
      heroVitrineImg.src = vitrineFotos[0];
    }
    if (vitrineDemoImg && vitrineFotos.length > 0) {
      vitrineDemoImg.src = vitrineFotos[0];
    }

    const heroThumbsBox = document.getElementById('hero-vitrine-thumbs-container');
    if (heroThumbsBox && vitrineFotos.length > 0) {
      heroThumbsBox.innerHTML = vitrineFotos.map((url, i) => `
        <button type="button" onclick="trocarFotoHeroVitrine('${url}', this)" class="hero-vitrine-thumb w-7 h-7 rounded ${i === 0 ? 'border-2 border-white' : 'border border-white/60 opacity-70 hover:opacity-100'} overflow-hidden active:scale-95 transition-all">
          <img src="${url}" alt="Thumb ${i + 1}" class="w-full h-full object-cover">
        </button>
      `).join('');
    }

    const vitrineDemoThumbsBox = document.getElementById('vitrine-demo-thumbs-container');
    if (vitrineDemoThumbsBox && vitrineFotos.length > 0) {
      vitrineDemoThumbsBox.innerHTML = vitrineFotos.map((url, i) => `
        <button type="button" onclick="trocarFotoVitrineSecao('${url}', this)" class="vitrine-sec-thumb w-9 h-9 rounded-lg ${i === 0 ? 'border-2 border-primary' : 'border border-slate-300 opacity-70 hover:opacity-100'} overflow-hidden shadow-2xs active:scale-95 transition-all">
          <img src="${url}" alt="Foto ${i + 1}" class="w-full h-full object-cover">
        </button>
      `).join('');
    }

    // 4.2. Dados Comerciais da Vitrine (Desconto, Preços, Condições e Benefícios)
    const heroBadgeDesc = document.getElementById('hero-vitrine-badge-desconto');
    const vitrineBadgeDesc = document.getElementById('vitrine-demo-badge-desconto');
    if (config.vitrine_badge_desconto) {
      if (heroBadgeDesc) heroBadgeDesc.textContent = config.vitrine_badge_desconto;
      if (vitrineBadgeDesc) vitrineBadgeDesc.textContent = config.vitrine_badge_desconto;
    }

    const formatarPrecoDe = (p) => !p ? '' : (p.startsWith('De') ? p : `De R$ ${p}`);
    const formatarPrecoPor = (p) => !p ? '' : (p.startsWith('Por') ? p : `Por R$ ${p}`);

    if (config.vitrine_preco_de) {
      const pDe = formatarPrecoDe(config.vitrine_preco_de);
      const elHDe = document.getElementById('hero-vitrine-preco-de');
      const elVDe = document.getElementById('vitrine-demo-preco-de');
      if (elHDe) elHDe.textContent = pDe;
      if (elVDe) elVDe.textContent = pDe;
    }

    if (config.vitrine_preco_por) {
      const pPor = formatarPrecoPor(config.vitrine_preco_por);
      const elHPor = document.getElementById('hero-vitrine-preco-por');
      const elVPor = document.getElementById('vitrine-demo-preco-por');
      if (elHPor) elHPor.textContent = pPor;
      if (elVPor) elVPor.textContent = pPor;
    }

    if (config.vitrine_condicao) {
      const heroCondicao = document.getElementById('hero-vitrine-condicao');
      const vitrineCondicao = document.getElementById('vitrine-demo-condicao');
      if (heroCondicao) {
        heroCondicao.innerHTML = `<span class="material-symbols-outlined text-xs">payments</span><span>${config.vitrine_condicao}</span>`;
      }
      if (vitrineCondicao) {
        vitrineCondicao.textContent = config.vitrine_condicao;
      }
    }

    if (config.vitrine_titulo) {
      const elVitrineDemoTit = document.getElementById('vitrine-demo-titulo');
      if (elVitrineDemoTit) elVitrineDemoTit.textContent = config.vitrine_titulo;
    }

    if (Array.isArray(config.vitrine_beneficios) && config.vitrine_beneficios.length > 0) {
      const heroBeneficios = document.getElementById('hero-vitrine-beneficios');
      if (heroBeneficios) {
        heroBeneficios.innerHTML = config.vitrine_beneficios.map(b => `
          <li class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-xs text-secondary font-bold">check_circle</span>
            <span>${b}</span>
          </li>
        `).join('');
      }
      const vitrineBeneficiosLista = document.getElementById('vitrine-demo-beneficios-lista');
      if (vitrineBeneficiosLista) {
        vitrineBeneficiosLista.innerHTML = config.vitrine_beneficios.map(b => `
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-xs text-secondary font-bold">check</span>
            <span>${b}</span>
          </div>
        `).join('');
      }
    }

    // 4.3. Mockup da Seção Como Funciona
    const comoFuncionaImg = document.getElementById('como-funciona-img');
    if (comoFuncionaImg) {
      comoFuncionaImg.src = config.como_funciona_imagem_url || vitrineFotos[0] || defaultImg;
    }

    // 4.4. Identidade da Loja Demonstrativa
    if (config.loja_demonstrativa_nome) {
      const n1 = document.getElementById('hero-social-author-nome');
      const n2 = document.getElementById('hero-vitrine-loja-nome');
      const n3 = document.getElementById('vitrine-demo-loja-nome');
      if (n1) n1.textContent = config.loja_demonstrativa_nome;
      if (n2) n2.textContent = config.loja_demonstrativa_nome;
      if (n3) n3.textContent = config.loja_demonstrativa_nome;
    }
    if (config.loja_demonstrativa_avatar) {
      const a1 = document.getElementById('hero-social-author-avatar');
      const a2 = document.getElementById('hero-vitrine-loja-avatar');
      const a3 = document.getElementById('vitrine-demo-loja-avatar');
      if (a1) a1.src = config.loja_demonstrativa_avatar;
      if (a2) a2.src = config.loja_demonstrativa_avatar;
      if (a3) a3.src = config.loja_demonstrativa_avatar;
    }

    // 4.5. Textos da Pré-visualização de Exemplo na Landing Page
    const elPreviewTexto = document.getElementById('hero-preview-texto');
    if (elPreviewTexto && (config.preview_descricao || config.preview_texto)) {
      elPreviewTexto.textContent = config.preview_descricao || config.preview_texto;
    }

    const elPreviewTitulo = document.getElementById('hero-preview-titulo');
    const elVitrineTitulo = document.getElementById('hero-vitrine-titulo');
    if (config.preview_titulo) {
      if (elPreviewTitulo) elPreviewTitulo.textContent = config.preview_titulo;
      if (elVitrineTitulo) elVitrineTitulo.textContent = config.preview_titulo;
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
