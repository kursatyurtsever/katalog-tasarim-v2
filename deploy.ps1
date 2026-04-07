# 1. Dosya Yollarını Tanımla
$SSH_KEY = "D:\US\Oracle\Guvenlik_keyleri\ssh-key-2025-09-20.key"
$REMOTE_USER = "ubuntu"
$REMOTE_IP = "161.118.172.246"
$REMOTE_PATH = "/home/katalog.161.118.172.246.nip.io/public_html"

Write-Host "----------------------------------------------" -ForegroundColor Gray
Write-Host "🚀 Guncelleme baslatiliyor..." -ForegroundColor Cyan
Write-Host "----------------------------------------------" -ForegroundColor Gray

# 2. Sunucuda Docker'i guncelle
$COMMANDS = "cd $REMOTE_PATH && sudo docker compose build --no-cache && sudo docker compose up -d"

Write-Host "🖥️ Sunucuya baglaniliyor ve Docker tetikleniyor..." -ForegroundColor Yellow
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_IP" "$COMMANDS"

Write-Host "----------------------------------------------" -ForegroundColor Gray
Write-Host "✅ Islem Basariyla Tamamlandi! Site Guncellendi." -ForegroundColor Green