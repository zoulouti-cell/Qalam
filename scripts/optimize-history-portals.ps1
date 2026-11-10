param([switch]$RefinementsOnly)
Add-Type -AssemblyName System.Drawing
$manifest=Get-Content -LiteralPath 'reports/history-portals-image-manifest.json' -Raw | ConvertFrom-Json
$encoder=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
function Save-Scaled($sourcePath,$targetPath,[int]$width,[int]$quality){
 $source=[System.Drawing.Image]::FromFile($sourcePath)
 try{$height=[int][Math]::Round($source.Height*$width/$source.Width);$bitmap=[System.Drawing.Bitmap]::new($width,$height);try{$g=[System.Drawing.Graphics]::FromImage($bitmap);try{$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic;$g.DrawImage($source,0,0,$width,$height)}finally{$g.Dispose()};$parameters=[System.Drawing.Imaging.EncoderParameters]::new(1);try{$parameters.Param[0]=[System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality,[long]$quality);$bitmap.Save([System.IO.Path]::GetFullPath($targetPath),$encoder,$parameters)}finally{$parameters.Dispose()}}finally{$bitmap.Dispose()}}finally{$source.Dispose()}
}
foreach($item in @($manifest.images | Where-Object{!$RefinementsOnly -or $_.generationRevision -eq 2})){Save-Scaled $item.source $item.asset 1280 81;Save-Scaled $item.source $item.thumbnail 240 73}
$covers=@('transport-networked','qalam-history-peace-peacekeeping','qalam-history-war-worldwar1','qalam-history-peace-uncharter','qalam-history-mathematics-counts','qalam-history-chemistry-measurement','qalam-history-physics-optics')
foreach($stem in $covers){foreach($audience in @('kids','academic')){$original="public/assets/img/$stem-$audience-v1.jpg";Save-Scaled $original ($original.Replace('-v1.jpg','-v1-card.jpg')) 640 78}}
$total=($manifest.images | ForEach-Object{(Get-Item -LiteralPath $_.asset).Length} | Measure-Object -Sum).Sum
Write-Output "122 scenes and thumbnails, 14 cover derivatives: $([Math]::Round($total/1MB,2)) MB full scenes"
