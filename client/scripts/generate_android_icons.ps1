Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\aspin\.gemini\antigravity\scratch\nightowl-app\client\public\icon-512.jpg"
$resDir = "C:\Users\aspin\.gemini\antigravity\scratch\nightowl-app\client\android\app\src\main\res"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source icon not found at $sourcePath"
    exit 1
}

$sourceImg = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-And-Save($img, $width, $height, $destPath) {
    $parent = Split-Path $destPath -Parent
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(7, 8, 20)) # Dark Obsidian Background

    $g.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $destPath ($width x $height)"
}

function Create-Splash($img, $w, $h, $destPath) {
    $parent = Split-Path $destPath -Parent
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }

    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(7, 8, 20)) # #070814

    # Center icon at 40% of min dimension
    $iconSize = [int]([Math]::Min($w, $h) * 0.45)
    $x = [int](($w - $iconSize) / 2)
    $y = [int](($h - $iconSize) / 2)

    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, $x, $y, $iconSize, $iconSize)
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated Splash: $destPath ($w x $h)"
}

# 1. Launcher Mipmaps
$mipmapSizes = @{
    "mipmap-mdpi"    = @{ icon = 48;  fg = 108 }
    "mipmap-hdpi"    = @{ icon = 72;  fg = 162 }
    "mipmap-xhdpi"   = @{ icon = 96;  fg = 216 }
    "mipmap-xxhdpi"  = @{ icon = 144; fg = 324 }
    "mipmap-xxxhdpi" = @{ icon = 192; fg = 432 }
}

foreach ($folder in $mipmapSizes.Keys) {
    $size = $mipmapSizes[$folder].icon
    $fgSize = $mipmapSizes[$folder].fg
    $targetFolder = Join-Path $resDir $folder

    Resize-And-Save $sourceImg $size $size (Join-Path $targetFolder "ic_launcher.png")
    Resize-And-Save $sourceImg $size $size (Join-Path $targetFolder "ic_launcher_round.png")
    Resize-And-Save $sourceImg $fgSize $fgSize (Join-Path $targetFolder "ic_launcher_foreground.png")
}

# 2. Splash Screens
Create-Splash $sourceImg 480 480 (Join-Path $resDir "drawable\splash.png")
Create-Splash $sourceImg 320 480 (Join-Path $resDir "drawable-port-mdpi\splash.png")
Create-Splash $sourceImg 480 800 (Join-Path $resDir "drawable-port-hdpi\splash.png")
Create-Splash $sourceImg 720 1280 (Join-Path $resDir "drawable-port-xhdpi\splash.png")
Create-Splash $sourceImg 960 1600 (Join-Path $resDir "drawable-port-xxhdpi\splash.png")
Create-Splash $sourceImg 1280 1920 (Join-Path $resDir "drawable-port-xxxhdpi\splash.png")

# Landscape splashes
Create-Splash $sourceImg 480 320 (Join-Path $resDir "drawable-land-mdpi\splash.png")
Create-Splash $sourceImg 800 480 (Join-Path $resDir "drawable-land-hdpi\splash.png")
Create-Splash $sourceImg 1280 720 (Join-Path $resDir "drawable-land-xhdpi\splash.png")
Create-Splash $sourceImg 1600 960 (Join-Path $resDir "drawable-land-xxhdpi\splash.png")
Create-Splash $sourceImg 1920 1280 (Join-Path $resDir "drawable-land-xxxhdpi\splash.png")

$sourceImg.Dispose()
Write-Host "`nAll Android launcher icons and splash screens successfully replaced with official NightOwl logo!"
