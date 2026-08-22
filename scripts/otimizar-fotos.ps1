<#
.SYNOPSIS
  Prepara fotos para a web: redimensiona, recomprime e renomeia.

.DESCRIPTION
  As fotos que saem do fotografo tem uns 3500px e 3 MB cada -- o navegador
  do convidado baixaria isso do jeito que estiver na pasta, porque tudo em
  /public e servido como arquivo estatico. Este script gera a versao web
  (lado maior 1800px, JPEG 82) e deixa os originais intactos na pasta de
  origem.

  Rode de novo sempre que trocar as fotos da galeria e depois atualize a
  lista em src/config/wedding.ts.

.EXAMPLE
  powershell -File scripts/otimizar-fotos.ps1 `
    -Origem fotos-originais/ensaio -Destino public/images/ensaio -Prefixo ensaio
#>
param(
  [Parameter(Mandatory = $true)][string]$Origem,
  [Parameter(Mandatory = $true)][string]$Destino,
  [string]$Prefixo = "foto",
  [int]$LadoMaior = 1800,
  [int]$Qualidade = 82
)

Add-Type -AssemblyName System.Drawing

New-Item -ItemType Directory -Force -Path $Destino | Out-Null

# Ordena pelo numero no fim do nome (a numeracao do fotografo segue a ordem
# do ensaio); sem numero, cai na ordem alfabetica.
$fotos = Get-ChildItem -Path $Origem -Include *.jpg, *.jpeg -File -Recurse |
  Sort-Object {
    $m = [regex]::Match($_.BaseName, '(\d+)$')
    if ($m.Success) { [int]$m.Groups[1].Value } else { [int]::MaxValue }
  }, Name

if ($fotos.Count -eq 0) { throw "Nenhuma foto encontrada em $Origem" }

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality, [long]$Qualidade)

$i = 0
foreach ($foto in $fotos) {
  $i++
  $imagem = [System.Drawing.Image]::FromFile($foto.FullName)
  try {
    # So diminui: foto menor que o alvo fica no tamanho original.
    $escala = [Math]::Min(1.0, [double]$LadoMaior / [Math]::Max($imagem.Width, $imagem.Height))
    $largura = [int][Math]::Round($imagem.Width * $escala)
    $altura = [int][Math]::Round($imagem.Height * $escala)

    $bitmap = New-Object System.Drawing.Bitmap($largura, $altura)
    $g = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $g.DrawImage($imagem, 0, 0, $largura, $altura)
    } finally { $g.Dispose() }

    $nome = "{0}-{1:d2}.jpg" -f $Prefixo, $i
    $bitmap.Save((Join-Path $Destino $nome), $codec, $params)
    $bitmap.Dispose()

    "{0} <- {1} ({2}x{3})" -f $nome, $foto.Name, $largura, $altura
  } finally { $imagem.Dispose() }
}

"`n{0} fotos em {1}" -f $i, $Destino
