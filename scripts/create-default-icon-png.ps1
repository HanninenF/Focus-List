Add-Type -AssemblyName System.Drawing
$repoRoot = Split-Path $PSScriptRoot -Parent
$assets = Join-Path $repoRoot 'assets'
New-Item -ItemType Directory -Path $assets -Force | Out-Null
$bitmap = [Drawing.Bitmap]::new(256, 256, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([Drawing.Color]::FromArgb(255, 13, 19, 18))
$graphics.FillRectangle([Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(255, 41, 71, 55)), 24, 24, 208, 208)
$graphics.FillRectangle([Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(255, 232, 238, 233)), 82, 47, 92, 164)
$graphics.FillRectangle([Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(255, 132, 184, 154)), 104, 31, 48, 34)
$pen = [Drawing.Pen]::new([Drawing.Color]::FromArgb(255, 41, 71, 55), 14)
$graphics.DrawLine($pen, 88, 112, 106, 130); $graphics.DrawLine($pen, 106, 130, 143, 88)
$graphics.DrawLine($pen, 88, 163, 164, 163); $graphics.DrawLine($pen, 88, 190, 164, 190)
$bitmap.Save((Join-Path $assets 'app-icon.png'), [Drawing.Imaging.ImageFormat]::Png)
$pen.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
