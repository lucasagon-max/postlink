# scripts/gerar_banner_og.ps1 - Gerador de Banner Oficial 1200x630 para WhatsApp
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Fundo escuro elegante com gradiente moderno
$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point($width, $height)),
    [System.Drawing.Color]::FromArgb(255, 10, 25, 47),    # Deep Navy
    [System.Drawing.Color]::FromArgb(255, 15, 33, 55)     # Dark Blue
)
$g.FillRectangle($brushBg, $rect)

# Brilhos ambientais decorativos (Ambient Glows)
$glowBrush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 34, 197, 94))  # Emerald glow
$g.FillEllipse($glowBrush1, -80, -80, 520, 520)

$glowBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 14, 165, 233)) # Sky blue glow
$g.FillEllipse($glowBrush2, 720, 180, 560, 560)

# Grid de pontos sutis (Tech pattern)
$dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 255, 255, 255))
for ($x = 35; $x -lt $width; $x += 35) {
    for ($y = 35; $y -lt $height; $y += 35) {
        $g.FillEllipse($dotBrush, $x, $y, 2, 2)
    }
}

# Inserir o logotipo original PostLink
$logoPath = Resolve-Path 'public\assets\img\logotipo_postlink_1x1.jpg'
if (Test-Path $logoPath) {
    $origLogo = [System.Drawing.Image]::FromFile($logoPath)
    
    # Card branco de suporte para o logotipo no canto superior esquerdo
    $logoCardRect = New-Object System.Drawing.Rectangle(70, 55, 105, 105)
    $logoCardBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($logoCardBg, $logoCardRect)
    
    # Desenhar o logotipo no card
    $g.DrawImage($origLogo, 75, 60, 95, 95)
    $origLogo.Dispose()
}

# Tipografia
$fontBrand = New-Object System.Drawing.Font('Segoe UI', 38, [System.Drawing.FontStyle]::Bold)
$fontTagline = New-Object System.Drawing.Font('Segoe UI', 12, [System.Drawing.FontStyle]::Bold)
$fontH1 = New-Object System.Drawing.Font('Segoe UI', 30, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font('Segoe UI', 15, [System.Drawing.FontStyle]::Regular)
$fontBadge = New-Object System.Drawing.Font('Segoe UI', 11, [System.Drawing.FontStyle]::Bold)
$fontCardTit = New-Object System.Drawing.Font('Segoe UI', 12, [System.Drawing.FontStyle]::Bold)
$fontCardDesc = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Regular)
$fontCardUrl = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)

# Cores e Pincéis
$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$brushGreen = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 34, 197, 94))
$brushSky = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
$brushMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 203, 213, 225))

# Marca e Tagline
$g.DrawString('postlink', $fontBrand, $brushWhite, 195, 58)
$g.DrawString([char]0x2022 + ' SMART LINKS EM ALTA DEFINICAO', $fontTagline, $brushGreen, 200, 122)

# Badge "OTIMIZADO PARA WHATSAPP"
$badgeRect = New-Object System.Drawing.Rectangle(70, 195, 255, 30)
$badgeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(50, 34, 197, 94))
$g.FillRectangle($badgeBg, $badgeRect)
$badgeBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 34, 197, 94), 1)
$g.DrawRectangle($badgeBorder, $badgeRect)
$g.DrawString([char]0x2714 + '  OTIMIZADO PARA WHATSAPP', $fontBadge, $brushGreen, 82, 202)

# Headline Principal (Título em 3 linhas compactas com margem segura)
$g.DrawString('Transforme ofertas em', $fontH1, $brushWhite, 70, 240)
$g.DrawString('cartoes em alta definicao', $fontH1, $brushWhite, 70, 285)
$g.DrawString('que abrem sozinhos e vendem.', $fontH1, $brushSky, 70, 330)

# Subtítulo explicativo
$subText1 = 'Chega de fotos avulsas que ninguem baixa na galeria.'
$subText2 = 'Seu produto aparece aberto com 1 clique para o seu WhatsApp.'
$g.DrawString($subText1, $fontSub, $brushMuted, 70, 405)
$g.DrawString($subText2, $fontSub, $brushMuted, 70, 432)

# Badges inferiores de recursos
$badges = @('Abre direto na conversa', 'Zero fotos na galeria', '1 clique p/ comprar')
$bx = 70
foreach ($b in $badges) {
    $textWithIcon = [char]0x2713 + ' ' + $b
    $bSize = $g.MeasureString($textWithIcon, $fontBadge)
    $bRect = New-Object System.Drawing.Rectangle($bx, 520, [int]($bSize.Width + 18), 36)
    $bBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 255, 255, 255))
    $g.FillRectangle($bBg, $bRect)
    $bBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(55, 255, 255, 255), 1)
    $g.DrawRectangle($bBorder, $bRect)
    $g.DrawString($textWithIcon, $fontBadge, $brushWhite, ($bx + 9), 529)
    $bx += [int]($bSize.Width + 28)
}

# Lado Direito: Ilustração do Mockup de WhatsApp HD Aberto
$mockCardRect = New-Object System.Drawing.Rectangle(740, 75, 390, 475)
# Sombra suave do mockup
$mockShadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(95, 0, 0, 0))
$g.FillRectangle($mockShadow, 752, 87, 390, 475)

# Fundo do Balão WhatsApp
$mockBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 231, 255, 219))
$g.FillRectangle($mockBg, $mockCardRect)

# Card Interno da Mídia
$mediaCardRect = New-Object System.Drawing.Rectangle(754, 89, 362, 330)
$mediaBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillRectangle($mediaBg, $mediaCardRect)

# Banner dentro do card do WhatsApp (usando gradiente vivo)
$bannerInner = New-Object System.Drawing.Rectangle(754, 89, 362, 205)
$brushInner = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(754, 89)),
    (New-Object System.Drawing.Point(1116, 294)),
    [System.Drawing.Color]::FromArgb(255, 225, 29, 72),   # Rose/Vermelho vivo
    [System.Drawing.Color]::FromArgb(255, 245, 158, 11)   # Amber Dourado
)
$g.FillRectangle($brushInner, $bannerInner)

# Textos dentro do banner do mockup
$fontMockSub = New-Object System.Drawing.Font('Segoe UI', 11, [System.Drawing.FontStyle]::Bold)
$fontMockBanner = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Bold)
$fontMockPrice = New-Object System.Drawing.Font('Segoe UI', 24, [System.Drawing.FontStyle]::Bold)

$g.DrawString('OFERTA DO DIA', $fontMockSub, $brushWhite, 775, 110)
$g.DrawString('Kit Granola Artesanal 500g', $fontMockBanner, $brushWhite, 775, 138)
$g.DrawString('R$ 34,90', $fontMockPrice, $brushWhite, 775, 220)

# Textos do card (URL, Título, Descrição)
$brushDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 17, 27, 33))
$brushGray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 102, 119, 129))
$brushWaLink = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 11, 107, 203))

$g.DrawString('postlink.com.br/emporio', $fontCardUrl, $brushGray, 768, 305)
$g.DrawString('Granola Crocante com Mel Puro', $fontCardTit, $brushDark, 768, 328)
$g.DrawString('Peca direto pelo WhatsApp com 1 clique!', $fontCardDesc, $brushGray, 768, 350)

# Linha de Link Clicável abaixo do balão
$g.DrawString('postlink.com.br/emporio/granola-mel', $fontCardUrl, $brushWaLink, 768, 435)

# Badge "Toque p/ Comprar"
$clickBadgeRect = New-Object System.Drawing.Rectangle(845, 485, 180, 36)
$clickBadgeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 34, 197, 94))
$g.FillRectangle($clickBadgeBg, $clickBadgeRect)
$g.DrawString([char]0x26A1 + ' Toque p/ Comprar', $fontBadge, $brushWhite, 862, 493)

# Salvar imagem otimizada em JPEG
$dest1 = 'public\assets\img\banner_postlink_og_1200x630.jpg'
$dest2 = 'imagens\banner_postlink_og_1200x630.jpg'

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]92)

$bmp.Save($dest1, $codec, $encoderParams)
$bmp.Save($dest2, $codec, $encoderParams)

$bmp.Dispose()
$g.Dispose()

Write-Output ('Sucesso! {0} gerado com {1} bytes' -f $dest1, (Get-Item $dest1).Length)
Write-Output ('Sucesso! {0} gerado com {1} bytes' -f $dest2, (Get-Item $dest2).Length)
