# scripts/processar_favicon.ps1 - Processador de Favicons e Ícones do PostLink
Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path 'imagens\Favicon.jpg'
if (-not (Test-Path $srcPath)) {
    Write-Error "Arquivo imagens\Favicon.jpg não encontrado!"
    exit 1
}

$origImg = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Output ("Origem: {0}x{1}" -f $origImg.Width, $origImg.Height)

# Criar canvas mestre quadrado 512x512 com fundo transparente e cantos elegantes
$masterSize = 512
$masterBmp = New-Object System.Drawing.Bitmap($masterSize, $masterSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($masterBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

# Criar cantos arredondados sutis estilo squircle para ícones modernos (raio 72px em 512x512)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$cornerR = 72
$cornerD = $cornerR * 2
$path.AddArc(0, 0, $cornerD, $cornerD, 180, 90)
$path.AddArc($masterSize - $cornerD, 0, $cornerD, $cornerD, 270, 90)
$path.AddArc($masterSize - $cornerD, $masterSize - $cornerD, $cornerD, $cornerD, 0, 90)
$path.AddArc(0, $masterSize - $cornerD, $cornerD, $cornerD, 90, 90)
$path.CloseFigure()
$g.SetClip($path)

$g.DrawImage($origImg, 0, 0, $masterSize, $masterSize)
$path.Dispose()
$g.Dispose()
$origImg.Dispose()

# Função para redimensionar e salvar
function Salvar-Icone($bmp, $tamanho, $destinos) {
    $targetBmp = New-Object System.Drawing.Bitmap($tamanho, $tamanho, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $tg = [System.Drawing.Graphics]::FromImage($targetBmp)
    $tg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $tg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $tg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $tg.Clear([System.Drawing.Color]::Transparent)
    $tg.DrawImage($bmp, 0, 0, $tamanho, $tamanho)
    $tg.Dispose()

    foreach ($dest in $destinos) {
        $parent = Split-Path -Parent $dest
        if ($parent -and -not (Test-Path $parent)) {
            New-Item -ItemType Directory -Path $parent -Force | Out-Null
        }
        $targetBmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output ("Gerado: {0} ({1}x{1}, {2} bytes)" -f $dest, $tamanho, (Get-Item $dest).Length)
    }
    $targetBmp.Dispose()
}

# Gerar resoluções em public/ e na raiz
Salvar-Icone $masterBmp 16 @('public\favicon-16x16.png', 'favicon-16x16.png')
Salvar-Icone $masterBmp 32 @('public\favicon-32x32.png', 'favicon-32x32.png', 'public\assets\img\favicon.png')
Salvar-Icone $masterBmp 48 @('public\favicon-48x48.png', 'favicon-48x48.png')
Salvar-Icone $masterBmp 180 @('public\apple-touch-icon.png', 'apple-touch-icon.png')
Salvar-Icone $masterBmp 192 @('public\icon-192x192.png', 'icon-192x192.png')
Salvar-Icone $masterBmp 512 @('public\icon-512x512.png', 'icon-512x512.png', 'public\favicon.png', 'favicon.png')

# Criar favicon.ico legítimo com cabeçalho ICO de 32x32
$icoBmp = New-Object System.Drawing.Bitmap(32, 32, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$icog = [System.Drawing.Graphics]::FromImage($icoBmp)
$icog.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$icog.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$icog.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$icog.Clear([System.Drawing.Color]::Transparent)
$icog.DrawImage($masterBmp, 0, 0, 32, 32)
$icog.Dispose()

# Salvar como PNG primeiro e empacotar como ICO
$pngStream = New-Object System.IO.MemoryStream
$icoBmp.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $pngStream.ToArray()
$pngStream.Dispose()
$icoBmp.Dispose()
$masterBmp.Dispose()

# Estrutura do arquivo ICO (6 bytes header + 16 bytes directory entry + png data)
$icoStream = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter($icoStream)

# ICONHEADER
$writer.Write([uint16]0) # Reserved
$writer.Write([uint16]1) # Type (1 = ICO)
$writer.Write([uint16]1) # Count (1 image)

# ICONDIRENTRY
$writer.Write([byte]32)                   # Width
$writer.Write([byte]32)                   # Height
$writer.Write([byte]0)                    # Color count (0 = >=8bpp)
$writer.Write([byte]0)                    # Reserved
$writer.Write([uint16]1)                  # Color planes
$writer.Write([uint16]32)                 # Bits per pixel
$writer.Write([uint32]$pngBytes.Length)   # Size of image data
$writer.Write([uint32]22)                 # Offset (6 + 16 = 22)

# Image Data
$writer.Write($pngBytes)
$writer.Flush()

$icoBytes = $icoStream.ToArray()
$writer.Dispose()
$icoStream.Dispose()

$pubDir = (Resolve-Path 'public').Path
$rootDir = (Resolve-Path '.').Path
[System.IO.File]::WriteAllBytes((Join-Path $pubDir 'favicon.ico'), $icoBytes)
[System.IO.File]::WriteAllBytes((Join-Path $rootDir 'favicon.ico'), $icoBytes)

Write-Output ("Gerado: public\favicon.ico ({0} bytes)" -f $icoBytes.Length)
Write-Output ("Gerado: favicon.ico ({0} bytes)" -f $icoBytes.Length)
