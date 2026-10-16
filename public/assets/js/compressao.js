// public/assets/js/compressao.js
// Utilitários de compressão de imagem, normalização de URLs e geração de slugs

export async function comprimirImagem(arquivo, { larguraMax = 1200, alvoKB = 300 } = {}) {
  const bmp = await createImageBitmap(arquivo);
  const escala = Math.min(1, larguraMax / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);
  const ctx = canvas.getContext('2d');
  
  // Fundo branco para garantir que transparências em PNG não fiquem pretas no JPEG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);

  return canvasParaBlob(canvas, { alvoKB });
}

export async function canvasParaBlob(canvas, { alvoKB = 300, maxKB = 500 } = {}) {
  let q = 0.88;
  let blob;
  do {
    blob = await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', q));
    q -= 0.08;
  } while (blob.size > alvoKB * 1024 && q > 0.35);

  if (blob.size > maxKB * 1024) {
    throw new Error('A imagem selecionada é muito pesada mesmo após compressão. Por favor, escolha outra foto.');
  }
  return blob;
}

export function aplicarMolduraInteligente(canvasFonte, { tipo = 'blur', corSolida = '#ffffff', largura = 1200, altura = 628 } = {}) {
  const canvasDestino = document.createElement('canvas');
  canvasDestino.width = largura;
  canvasDestino.height = altura;
  const ctx = canvasDestino.getContext('2d');

  if (tipo === 'blur') {
    // 1. Fundo Desfocado (Cover ampliado com blur suave e leve escurecimento para contraste)
    ctx.save();
    try {
      ctx.filter = 'blur(20px) brightness(0.85)';
    } catch (_) {}
    
    const escalaCover = Math.max(largura / canvasFonte.width, altura / canvasFonte.height) * 1.15;
    const wCover = canvasFonte.width * escalaCover;
    const hCover = canvasFonte.height * escalaCover;
    const xCover = (largura - wCover) / 2;
    const yCover = (altura - hCover) / 2;
    ctx.drawImage(canvasFonte, xCover, yCover, wCover, hCover);
    ctx.restore();

    // Vinheta / Overlay suave para acabamento premium
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, largura, altura);
  } else {
    // Fundo sólido limpo
    ctx.fillStyle = corSolida;
    ctx.fillRect(0, 0, largura, altura);
  }

  // 2. Imagem Principal Centralizada (Contain) com borda arredondada e sombra suave
  const escalaContain = Math.min((largura * 0.94) / canvasFonte.width, (altura * 0.94) / canvasFonte.height);
  const wPrincipal = Math.round(canvasFonte.width * escalaContain);
  const hPrincipal = Math.round(canvasFonte.height * escalaContain);
  const xPrincipal = Math.round((largura - wPrincipal) / 2);
  const yPrincipal = Math.round((altura - hPrincipal) / 2);

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;
  ctx.drawImage(canvasFonte, xPrincipal, yPrincipal, wPrincipal, hPrincipal);
  ctx.restore();

  return canvasDestino;
}

export function normalizarDestino(v) {
  v = (v || '').trim();
  if (!v) return null;

  // Se for número de telefone ou WhatsApp (ex: 11999998888, (11) 98888-7777, +5511...)
  if (/^\+?[\d\s().-]{10,}$/.test(v)) {
    let n = v.replace(/\D/g, '');
    if (n.length <= 11) {
      n = '55' + n;
    }
    return `https://wa.me/${n}`;
  }

  // Remove barras iniciais acidentais (ex: //seusite.com)
  v = v.replace(/^\/\//, '');

  // Se começou com http://, converte para https://
  if (/^http:\/\//i.test(v)) {
    v = v.replace(/^http:\/\//i, 'https://');
  } else if (!/^https:\/\//i.test(v)) {
    // Se o cliente não colocou https://, nós adicionamos automaticamente
    v = 'https://' + v;
  }

  // Não pode conter espaços
  if (/\s/.test(v)) return null;

  // Validação por URL e formato seguro
  try {
    const urlObj = new URL(v);
    if (urlObj.protocol !== 'https:') return null;
    if (!urlObj.hostname || !urlObj.hostname.includes('.') || urlObj.hostname.endsWith('.')) {
      return null;
    }
    return /^https:\/\/[^\s]+\.[^\s]+$/i.test(v) ? v : null;
  } catch (_) {
    return null;
  }
}

const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';
export function slugAleatorio(n = 5) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return [...bytes].map((b) => ALFABETO[b % ALFABETO.length]).join('');
}
