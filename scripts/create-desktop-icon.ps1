param(
  [string]$SourceImage = (Join-Path (Split-Path $PSScriptRoot -Parent) 'assets\app-icon.ico')
)

Add-Type -AssemblyName System.Drawing
$repoRoot = Split-Path $PSScriptRoot -Parent
$iconPath = Join-Path $repoRoot 'data\lugn-lista.ico'
$sizes = @(256, 64, 32, 16)
$source = if (Test-Path -LiteralPath $SourceImage) { [Drawing.Image]::FromFile((Resolve-Path -LiteralPath $SourceImage)) } else { $null }

try {
  $pngs = @()
  foreach ($size in $sizes) {
    $bitmap = [Drawing.Bitmap]::new($size, $size, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.Clear([Drawing.Color]::Transparent)
    if ($source) {
      $graphics.DrawImage($source, [Drawing.Rectangle]::new(0, 0, $size, $size))
    } else {
      $graphics.Clear([Drawing.Color]::FromArgb(255, 13, 19, 18))
      $margin = [Math]::Max(1, [int]($size * 0.12)); $radius = [Math]::Max(2, [int]($size * 0.18))
      $path = [Drawing.Drawing2D.GraphicsPath]::new()
      $path.AddArc($margin, $margin, $radius, $radius, 180, 90); $path.AddArc($size - $margin - $radius, $margin, $radius, $radius, 270, 90)
      $path.AddArc($size - $margin - $radius, $size - $margin - $radius, $radius, $radius, 0, 90); $path.AddArc($margin, $size - $margin - $radius, $radius, $radius, 90, 90); $path.CloseFigure()
      $graphics.FillPath([Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(255, 41, 71, 55)), $path)
      $graphics.FillRectangle([Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(255, 232, 238, 233)), [Drawing.RectangleF]::new($size * .27, $size * .18, $size * .46, $size * .64))
      $graphics.FillRectangle([Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(255, 132, 184, 154)), [Drawing.RectangleF]::new($size * .39, $size * .12, $size * .22, $size * .13))
      $pen = [Drawing.Pen]::new([Drawing.Color]::FromArgb(255, 41, 71, 55), [Math]::Max(1.5, $size * .055))
      $graphics.DrawLine($pen, $size * .38, $size * .43, $size * .44, $size * .49); $graphics.DrawLine($pen, $size * .44, $size * .49, $size * .56, $size * .35)
      $graphics.DrawLine($pen, $size * .38, $size * .62, $size * .64, $size * .62); $graphics.DrawLine($pen, $size * .38, $size * .73, $size * .64, $size * .73)
      $pen.Dispose(); $path.Dispose()
    }
    $stream = [IO.MemoryStream]::new(); $bitmap.Save($stream, [Drawing.Imaging.ImageFormat]::Png); $pngs += ,$stream.ToArray()
    $stream.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
  }
  $output = [IO.MemoryStream]::new(); $writer = [IO.BinaryWriter]::new($output)
  $writer.Write([UInt16]0); $writer.Write([UInt16]1); $writer.Write([UInt16]$pngs.Count); $offset = 6 + (16 * $pngs.Count)
  for ($index = 0; $index -lt $pngs.Count; $index++) { $size = $sizes[$index]; $writer.Write([Byte]$(if ($size -eq 256) { 0 } else { $size })); $writer.Write([Byte]$(if ($size -eq 256) { 0 } else { $size })); $writer.Write([Byte]0); $writer.Write([Byte]0); $writer.Write([UInt16]1); $writer.Write([UInt16]32); $writer.Write([UInt32]$pngs[$index].Length); $writer.Write([UInt32]$offset); $offset += $pngs[$index].Length }
  foreach ($png in $pngs) { $writer.Write($png) }; $writer.Flush(); [IO.File]::WriteAllBytes($iconPath, $output.ToArray()); $writer.Dispose(); $output.Dispose()
  Write-Output "Generated $iconPath from $SourceImage"
} finally { if ($source) { $source.Dispose() } }
