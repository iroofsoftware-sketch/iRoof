Add-Type -AssemblyName System.Drawing

$baseDir = $PSScriptRoot
$logoWhitePath = Join-Path $baseDir "assets\logos\iroofing_wordmark_white_small.png"

if (-not (Test-Path $logoWhitePath)) {
    Write-Error "Logo not found at $logoWhitePath"
    exit 1
}

$logo = [System.Drawing.Image]::FromFile($logoWhitePath)

# Color definitions
$navyColor = [System.Drawing.ColorTranslator]::FromHtml("#081A36")
$darkNavy = [System.Drawing.ColorTranslator]::FromHtml("#040D1B")
$goldColor = [System.Drawing.ColorTranslator]::FromHtml("#C9940A")

function Generate-AppIcon([int]$size, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # 1. Background fill: Obsidian Navy
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $navyColor, $darkNavy, 45.0)
    $g.FillRectangle($brush, $rect)

    # 2. Gold border accent ring
    $penWidth = [float][Math]::Max(1.5, [double]($size * 0.03))
    $pen = New-Object System.Drawing.Pen($goldColor, $penWidth)
    $pad = [int][Math]::Max(2.0, [double]($size * 0.04))
    $innerSize = [int]($size - ($pad * 2))
    $borderRect = New-Object System.Drawing.Rectangle($pad, $pad, $innerSize, $innerSize)
    $g.DrawRectangle($pen, $borderRect)

    # 3. Scale and Center Logo
    # Logo is wide, so fit it comfortably with 18% horizontal padding
    $targetWidth = $size * 0.82
    $aspect = $logo.Height / $logo.Width
    $targetHeight = $targetWidth * $aspect
    
    $destX = ($size - $targetWidth) / 2
    $destY = ($size - $targetHeight) / 2

    $destRect = New-Object System.Drawing.RectangleF($destX, $destY, $targetWidth, $targetHeight)
    $g.DrawImage($logo, $destRect)

    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated Icon ($size x $size) -> $outPath"
}

function Generate-SplashImage([string]$outPath) {
    # Crisp 480 x 200 transparent image for native Android splash center
    $w = 560
    $aspect = $logo.Height / $logo.Width
    $h = [int]($w * $aspect)

    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $destRect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $g.DrawImage($logo, $destRect)

    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated Splash Logo ($w x $h) -> $outPath"
}

# Target output directories
$resDir = Join-Path $baseDir "android\app\src\main\res"

Generate-AppIcon 48 (Join-Path $resDir "mipmap-mdpi\ic_launcher.png")
Generate-AppIcon 72 (Join-Path $resDir "mipmap-hdpi\ic_launcher.png")
Generate-AppIcon 96 (Join-Path $resDir "mipmap-xhdpi\ic_launcher.png")
Generate-AppIcon 144 (Join-Path $resDir "mipmap-xxhdpi\ic_launcher.png")
Generate-AppIcon 192 (Join-Path $resDir "mipmap-xxxhdpi\ic_launcher.png")

# Also splash image
Generate-SplashImage (Join-Path $resDir "drawable\launch_image.png")

$logo.Dispose()
Write-Host "All branding assets generated successfully!"
