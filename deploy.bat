@echo off
echo Sunucuya baglaniliyor ve TEMIZ guncelleme baslatiliyor...
ssh -i "D:\US\Oracle\Guvenlik_keyleri\ssh-key-2025-09-20.key" ubuntu@161.118.172.246 "cd /home/katalog.161.118.172.246.nip.io/public_html && sudo docker compose build --no-cache && sudo docker compose up -d"
echo Islem tamamlandi!