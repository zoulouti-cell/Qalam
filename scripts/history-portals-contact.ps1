Add-Type -AssemblyName System.Drawing
$manifest=Get-Content -LiteralPath 'reports/history-portals-image-manifest.json' -Raw | ConvertFrom-Json
foreach($audience in @('kids','academic')){foreach($group in @('sciences','war-peace','regions')){
 $items=@($manifest.images | Where-Object{$_.audience -eq $audience -and $(if($group -eq 'sciences'){$_.family -in @('mathematics','chemistry','physics')}elseif($group -eq 'war-peace'){$_.family -in @('war','peace')}else{$_.family -in @('medicine','transport')})})
 $rows=[int][Math]::Ceiling($items.Count/4);$canvas=[System.Drawing.Bitmap]::new(1120,$rows*184);$g=[System.Drawing.Graphics]::FromImage($canvas);$font=[System.Drawing.Font]::new('Segoe UI',10)
 try{$g.Clear([System.Drawing.Color]::White);for($i=0;$i -lt $items.Count;$i++){$im=[System.Drawing.Image]::FromFile([System.IO.Path]::GetFullPath($items[$i].thumbnail));try{$x=($i%4)*280;$y=[Math]::Floor($i/4)*184;$g.DrawImage($im,[int]$x,[int]$y,280,157);$g.DrawString(($items[$i].family+'/'+$items[$i].id),$font,[System.Drawing.Brushes]::Black,[single]($x+5),[single]($y+160))}finally{$im.Dispose()}};$canvas.Save([System.IO.Path]::GetFullPath("reports/history-portals-$group-$audience-contact.jpg"),[System.Drawing.Imaging.ImageFormat]::Jpeg)}finally{$font.Dispose();$g.Dispose();$canvas.Dispose()}
}}
