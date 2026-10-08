// public/assets/js/compressao.js
// Utilitários de compressão de imagem, normalização de URLs e geração de slugs

export async function comprimirImagem(arquivo, { larguraMax = 1200, alvoKB = 300 } = {}) {
  const bmp = await createImageBitmap(arquivo);
  const escala = Math.min(1, larguraMax / bmp.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);
  const ctx = canvas.getContext('2d');
  
  // Fundo branco para garantir que transparências em PNG não fiquem pretas no JPEG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);

  let q = 0.85;
  let blob;
  do {
    blob = await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', q));
    q -= 0.1;
  } while (blob.size > alvoKB * 1024 && q > 0.4);

  if (blob.size > 500 * 1024) {
    throw new Error('A imagem selecionada é muito pesada (acima de 500 KB mesmo após compressão). Por favor, escolha outra foto.');
  }
  return blob;
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
