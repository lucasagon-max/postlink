// public/assets/js/site-config-loader.js
// Carregamento dinâmico das configurações oficiais do PostLink (por seções e atributos individuais)

(function () {
  const CACHE_KEY = 'postlink_site_config';

  // Helper para atualizar texto com segurança
  function setTexto(id, valor) {
    if (!valor) return;
    const el = document.getElementById(id);
    if (el) el.textContent = valor;
  }

  // Helper para atualizar HTML com segurança
  function setHTML(id, html) {
    if (!html) return;
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  // Helper para atualizar atributo src
  function setSrc(id, src) {
    if (!src) return;
    const el = document.getElementById(id);
    if (el) el.src = src;
  }

  // Helper para atualizar link href
  function setHref(id, href) {
    if (!href) return;
    const el = document.getElementById(id);
    if (el) el.href = href;
  }

  // Função principal para aplicar os dados no DOM da página
  function aplicarConfiguracoes(config) {
    if (!config) return;

    const secoes = config.secoes_conteudo || {};

    // ==========================================
    // 1. SEÇÃO HERO
    // ==========================================
    const heroSec = secoes.hero || {};
    const badgeTexto = heroSec.badge_texto || config.badge_texto;
    if (badgeTexto) {
      setTexto('hero-badge-texto', badgeTexto);
      const badgeWrap = document.getElementById('hero-badge-wrap');
      if (badgeWrap) badgeWrap.classList.remove('hidden');
    }

    const heroTitulo = heroSec.titulo || config.titulo;
    if (heroTitulo) {
      const elTitulo = document.getElementById('hero-titulo');
      if (elTitulo) {
        const padraoOriginal = 'Transforme ofertas em cartões em alta definição que abrem sozinhos e vendem no WhatsApp';
        if (heroTitulo === padraoOriginal) {
          elTitulo.innerHTML = `Transforme ofertas em <br class="hidden sm:inline">
            <span class="text-primary-container">cartões em alta definição</span> que <span class="text-secondary-dark underline decoration-secondary decoration-wavy">abrem sozinhos e vendem</span> no WhatsApp`;
        } else {
          elTitulo.textContent = heroTitulo;
        }
      }
    }

    const heroDescricao = heroSec.descricao || config.descricao;
    setTexto('hero-descricao', heroDescricao);

    const ctaTexto = heroSec.cta_texto || config.cta_texto;
    if (ctaTexto) {
      setTexto('hero-cta-texto', ctaTexto);
      const navCta = document.getElementById('nav-cta-btn');
      if (navCta) {
        const span = navCta.querySelector('span');
        if (span) span.textContent = ctaTexto;
      }
    }

    const ctaUrl = heroSec.cta_url || config.cta_url;
    if (ctaUrl) {
      setHref('hero-cta-btn', ctaUrl);
      setHref('nav-cta-btn', ctaUrl);
    }

    // Banner da Hero
    const bannerContainer = document.getElementById('hero-banner-container');
    const bannerImg = document.getElementById('hero-banner-img');
    const vitrineUrl = (config.preview_imagem_url || config.banner_url || '').trim();
    const bannerAtivo = config.banner_ativo !== false;
    const defaultImg = '/assets/img/logotipo_postlink.jpg';

    if (bannerImg) {
      if (bannerAtivo) {
        bannerImg.src = vitrineUrl || defaultImg;
        if (bannerContainer) {
          bannerContainer.classList.remove('hidden', 'opacity-40');
        }
      } else {
        if (bannerContainer) bannerContainer.classList.add('opacity-40');
      }
    }

    // ==========================================
    // 2. SEÇÃO DORES / BARREIRAS
    // ==========================================
    const doresSec = secoes.dores || {};
    setTexto('dores-titulo', doresSec.titulo);
    setTexto('dores-subtitulo', doresSec.subtitulo);
    setTexto('dores-barreira1-titulo', doresSec.barreira1_titulo);
    setTexto('dores-barreira1-texto', doresSec.barreira1_texto);
    setTexto('dores-barreira2-titulo', doresSec.barreira2_titulo);
    setTexto('dores-barreira2-texto', doresSec.barreira2_texto);
    setTexto('dores-solucao-texto', doresSec.solucao_texto);

    // ==========================================
    // 3. SEÇÃO COMPARATIVO
    // ==========================================
    const compSec = secoes.comparativo || {};
    setTexto('comparativo-titulo', compSec.titulo);
    setTexto('comparativo-subtitulo', compSec.subtitulo);
    setTexto('comparativo-depois-titulo', compSec.depois_titulo);
    setTexto('comparativo-depois-texto', compSec.depois_texto);

    const compImgUrl = compSec.imagem_url || config.como_funciona_imagem_url;
    if (compImgUrl) {
      setSrc('como-funciona-img', compImgUrl);
    }

    // ==========================================
    // 4. SEÇÃO VITRINE (OFERTA INTERATIVA & CARROSSEL)
    // ==========================================
    const vitrineSec = secoes.vitrine || {};
    setTexto('vitrine-secao-badge-texto', vitrineSec.badge_texto);
    if (vitrineSec.titulo) {
      setHTML('vitrine-secao-titulo', vitrineSec.titulo);
    }
    setTexto('vitrine-secao-subtitulo', vitrineSec.subtitulo);

    // 4.1 Carrossel de Fotos da Vitrine
    let vitrineFotos = [];
    if (Array.isArray(vitrineSec.fotos) && vitrineSec.fotos.length > 0) {
      vitrineFotos = vitrineSec.fotos.filter(Boolean);
    } else if (Array.isArray(config.vitrine_fotos) && config.vitrine_fotos.length > 0) {
      vitrineFotos = config.vitrine_fotos.filter(Boolean);
    } else if (vitrineUrl) {
      vitrineFotos = [vitrineUrl, '/assets/img/Ex01.png', '/assets/img/logotipo_postlink.jpg'];
    } else {
      vitrineFotos = ['/assets/img/ex02.png', '/assets/img/Ex01.png', '/assets/img/logotipo_postlink.jpg'];
    }

    const heroVitrineImg = document.getElementById('hero-vitrine-img');
    const vitrineDemoImg = document.getElementById('vitrine-demo-main-img');
    if (heroVitrineImg && vitrineFotos.length > 0) heroVitrineImg.src = vitrineFotos[0];
    if (vitrineDemoImg && vitrineFotos.length > 0) vitrineDemoImg.src = vitrineFotos[0];

    // Miniaturas interativas da Vitrine na Hero
    const heroThumbsBox = document.getElementById('hero-vitrine-thumbs-container');
    if (heroThumbsBox && vitrineFotos.length > 0) {
      heroThumbsBox.innerHTML = vitrineFotos.map((url, i) => `
        <button type="button" onclick="trocarFotoHeroVitrine('${url}', this)" class="hero-vitrine-thumb w-7 h-7 rounded ${i === 0 ? 'border-2 border-white' : 'border border-white/60 opacity-70 hover:opacity-100'} overflow-hidden active:scale-95 transition-all">
          <img src="${url}" alt="Thumb ${i + 1}" class="w-full h-full object-cover">
        </button>
      `).join('');
    }

    // Miniaturas interativas da Vitrine na Seção #vitrine
    const vitrineDemoThumbsBox = document.getElementById('vitrine-demo-thumbs-container');
    if (vitrineDemoThumbsBox && vitrineFotos.length > 0) {
      vitrineDemoThumbsBox.innerHTML = vitrineFotos.map((url, i) => `
        <button type="button" onclick="trocarFotoVitrineSecao('${url}', this)" class="vitrine-sec-thumb w-9 h-9 rounded-lg ${i === 0 ? 'border-2 border-primary' : 'border border-slate-300 opacity-70 hover:opacity-100'} overflow-hidden shadow-2xs active:scale-95 transition-all">
          <img src="${url}" alt="Foto ${i + 1}" class="w-full h-full object-cover">
        </button>
      `).join('');
    }

    // 4.2 Dados Comerciais da Vitrine (Desconto, Preços, Condições e Benefícios)
    const badgeDesconto = vitrineSec.badge_desconto || config.vitrine_badge_desconto;
    if (badgeDesconto) {
      setTexto('hero-vitrine-badge-desconto', badgeDesconto);
      setTexto('vitrine-demo-badge-desconto', badgeDesconto);
    }

    const formatarPrecoDe = (p) => !p ? '' : (p.startsWith('De') ? p : `De R$ ${p}`);
    const formatarPrecoPor = (p) => !p ? '' : (p.startsWith('Por') ? p : `Por R$ ${p}`);

    const precoDe = vitrineSec.preco_de || config.vitrine_preco_de;
    if (precoDe) {
      const pDe = formatarPrecoDe(precoDe);
      setTexto('hero-vitrine-preco-de', pDe);
      setTexto('vitrine-demo-preco-de', pDe);
    }

    const precoPor = vitrineSec.preco_por || config.vitrine_preco_por;
    if (precoPor) {
      const pPor = formatarPrecoPor(precoPor);
      setTexto('hero-vitrine-preco-por', pPor);
      setTexto('vitrine-demo-preco-por', pPor);
    }

    const condicao = vitrineSec.condicao || config.vitrine_condicao;
    if (condicao) {
      const heroCondicao = document.getElementById('hero-vitrine-condicao');
      if (heroCondicao) {
        heroCondicao.innerHTML = `<span class="material-symbols-outlined text-xs">payments</span><span>${condicao}</span>`;
      }
      setTexto('vitrine-demo-condicao', condicao);
    }

    const vitrineTitulo = vitrineSec.produto_titulo || config.vitrine_titulo;
    if (vitrineTitulo) {
      setTexto('vitrine-demo-titulo', vitrineTitulo);
      setTexto('hero-vitrine-titulo', vitrineTitulo);
      setTexto('hero-preview-titulo', vitrineTitulo);
    }

    const beneficios = (Array.isArray(vitrineSec.beneficios) && vitrineSec.beneficios.length > 0)
      ? vitrineSec.beneficios
      : config.vitrine_beneficios;

    if (Array.isArray(beneficios) && beneficios.length > 0) {
      const heroBeneficios = document.getElementById('hero-vitrine-beneficios');
      if (heroBeneficios) {
        heroBeneficios.innerHTML = beneficios.map(b => `
          <li class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-xs text-secondary font-bold">check_circle</span>
            <span>${b}</span>
          </li>
        `).join('');
      }
      const vitrineBeneficiosLista = document.getElementById('vitrine-demo-beneficios-lista');
      if (vitrineBeneficiosLista) {
        vitrineBeneficiosLista.innerHTML = beneficios.map(b => `
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-xs text-secondary font-bold">check</span>
            <span>${b}</span>
          </div>
        `).join('');
      }
    }

    // 4.3 Identidade da Loja Demonstrativa
    const lojaNome = vitrineSec.loja_nome || config.loja_demonstrativa_nome;
    if (lojaNome) {
      setTexto('hero-social-author-nome', lojaNome);
      setTexto('hero-vitrine-loja-nome', lojaNome);
      setTexto('vitrine-demo-loja-nome', lojaNome);
    }

    const lojaAvatar = vitrineSec.loja_avatar || config.loja_demonstrativa_avatar;
    if (lojaAvatar) {
      setSrc('hero-social-author-avatar', lojaAvatar);
      setSrc('hero-vitrine-loja-avatar', lojaAvatar);
      setSrc('vitrine-demo-loja-avatar', lojaAvatar);
    }

    // Textos da Pré-visualização do Hero Card
    const previewTexto = config.preview_descricao || config.preview_texto;
    if (previewTexto) setTexto('hero-preview-texto', previewTexto);
    if (config.preview_subtitulo) setTexto('hero-preview-subtitulo', config.preview_subtitulo);

    // ==========================================
    // 5. SEÇÃO PASSOS (COMO FUNCIONA)
    // ==========================================
    const passosSec = secoes.passos || {};
    setTexto('passos-titulo', passosSec.titulo);
    setTexto('passos-subtitulo', passosSec.subtitulo);
    setTexto('passo1-titulo', passosSec.passo1_titulo);
    setTexto('passo1-desc', passosSec.passo1_desc);
    setTexto('passo2-titulo', passosSec.passo2_titulo);
    setTexto('passo2-desc', passosSec.passo2_desc);
    setTexto('passo3-titulo', passosSec.passo3_titulo);
    setTexto('passo3-desc', passosSec.passo3_desc);

    // ==========================================
    // 6. SEÇÃO CTA FINAL (TRIAL)
    // ==========================================
    const ctaFinalSec = secoes.cta_final || {};
    setTexto('cta-final-badge-texto', ctaFinalSec.badge_texto);
    setTexto('cta-final-titulo', ctaFinalSec.titulo);
    setTexto('cta-final-subtitulo', ctaFinalSec.subtitulo);
    setTexto('cta-final-btn-texto', ctaFinalSec.btn_texto);
    if (ctaFinalSec.btn_url) {
      setHref('cta-final-btn', ctaFinalSec.btn_url);
    }

    // ==========================================
    // 7. COMPARTILHAMENTO OFICIAL / OPEN GRAPH
    // ==========================================
    const oficialSec = secoes.oficial || {};
    const ogTitleContent = oficialSec.og_titulo || config.oficial_og_titulo || (config.titulo ? `${config.titulo} · PostLink` : 'PostLink · Smart Links em Alta Definição para WhatsApp');
    const ogTitle = document.getElementById('og-title') || document.querySelector('meta[property="og:title"]');
    const twTitle = document.getElementById('tw-title') || document.querySelector('meta[name="twitter:title"]');
    if (ogTitle) ogTitle.setAttribute('content', ogTitleContent);
    if (twTitle) twTitle.setAttribute('content', ogTitleContent);

    const ogDescContent = oficialSec.og_descricao || config.oficial_og_descricao || config.descricao || 'Transforme fotos e ofertas em cartões inteligentes de alta definição que abrem sozinhos no WhatsApp e vendem com 1 clique.';
    const ogDesc = document.getElementById('og-desc') || document.querySelector('meta[property="og:description"]');
    const twDesc = document.getElementById('tw-desc') || document.querySelector('meta[name="twitter:description"]');
    if (ogDesc) ogDesc.setAttribute('content', ogDescContent);
    if (twDesc) twDesc.setAttribute('content', ogDescContent);

    let ogImgContent = oficialSec.og_imagem_url || config.oficial_og_imagem_url || config.banner_url || 'https://www.postlink.com.br/assets/img/banner_postlink_og_1200x630.jpg';
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
