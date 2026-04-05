# 1. Ayarlar
$SSH_KEY = "D:\US\Oracle\Guvenlik_keyleri\ssh-key-2025-09-20.key"
$REMOTE_USER = "ubuntu"
$REMOTE_IP = "161.118.172.246"
$REMOTE_PATH = "/home/katalog.161.118.172.246.nip.io/public_html"

Write-Host "-----------------------------------------------" -ForegroundColor Gray
Write-Host "🚀 DEPLOY BASLATILDI (Tam Paket)" -ForegroundColor Cyan
Write-Host "-----------------------------------------------" -ForegroundColor Gray

# 2. Dosyaları Sunucuya Yükle (scp kullanarak)
# İstenmeyen klasörleri göndermemek için sadece gerekli olanları seçiyoruz
Write-Host "📦 1/2: Dosyalar sunucuya yukleniyor..." -ForegroundColor Yellow

# Ana dizindeki dosyalar, src ve public klasörlerini gönder (node_modules ve .next hariç)
scp -i "$SSH_KEY" -r src public Dockerfile docker-compose.yml package.json next.config.ts tsconfig.json "$($REMOTE_USER)@$($REMOTE_IP):$REMOTE_PATH"

# 3. Sunucuda Docker'ı Çalıştır
Write-Host "🖥️  2/2: Sunucuda Docker build baslatiliyor..." -ForegroundColor Yellow
$COMMANDS = "cd $REMOTE_PATH && sudo docker compose up -d --build && sudo systemctl restart lsws"
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_IP" "$COMMANDS"

Write-Host "-----------------------------------------------" -ForegroundColor Gray
Write-Host "✅ ISLEM TAMAM! Site Guncellendi." -ForegroundColor Green
Write-Host "-----------------------------------------------" -ForegroundColor Gray