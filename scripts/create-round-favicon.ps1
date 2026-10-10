param(
  [string]$SourceImage = (Join-Path (Split-Path $PSScriptRoot -Parent) 'assets\app-icon.ico')
)

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path $PSScriptRoot -Parent
$targets = @(
  (Join-Path $repoRoot 'app\icon.ico'),
  (Join-Path $repoRoot 'public\icon.ico')
)
$pngTarget = Join-Path $repoRoot 'public\icon.png'
$sizes = @(256, 64, 32, 16)
$source = [Drawing.Image]::FromFile((Resolve-Path -LiteralPath $SourceImage))

try {
  $pngs = @()
  foreach ($size in $sizes) {
    $bitmap = [Drawing.Bitmap]::new($size, $size, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.Clear([Drawing.Color]::Transparent)

    $path = [Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddEllipse(0, 0, $size - 1, $size - 1)
    $graphics.SetClip($path)
    $graphics.DrawImage($source, [Drawing.Rectangle]::new(0, 0, $size, $size))
    $graphics.ResetClip()

    if ($size -eq 256) {
      $bitmap.Save($pngTarget, [Drawing.Imaging.ImageFormat]::Png)
    }

    $stream = [IO.MemoryStream]::new()
    $bitmap.Save($stream, [Drawing.Imaging.ImageFormat]::Png)
    $pngs += ,$stream.ToArray()
    $stream.Dispose()
    $path.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
  }

  $output = [IO.MemoryStream]::new()
  $writer = [IO.BinaryWriter]::new($output)
  $writer.Write([UInt16]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]$pngs.Count)
  $offset = 6 + (16 * $pngs.Count)

  for ($index = 0; $index -lt $pngs.Count; $index++) {
    $size = $sizes[$index]
    $writer.Write([Byte]$(if ($size -eq 256) { 0 } else { $size }))
    $writer.Write([Byte]$(if ($size -eq 256) { 0 } else { $size }))
    $writer.Write([Byte]0)
    $writer.Write([Byte]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]32)
    $writer.Write([UInt32]$pngs[$index].Length)
    $writer.Write([UInt32]$offset)
    $offset += $pngs[$index].Length
  }

  foreach ($png in $pngs) { $writer.Write($png) }
  $writer.Flush()
  foreach ($target in $targets) { [IO.File]::WriteAllBytes($target, $output.ToArray()) }
  $writer.Dispose()
  $output.Dispose()
} finally {
  $source.Dispose()
}

Write-Output 'Generated round favicon assets.'
