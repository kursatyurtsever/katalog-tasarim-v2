# Katalog Tasarım V2

Bu proje, kullanıcıların kendi kataloglarını, menülerini (pizza, vb.) veya afişlerini görsel bir arayüz ile oluşturup düzenleyebilmelerine olanak tanıyan, React ve Next.js tabanlı özel bir tasarım uygulamasıdır.

Projeye ait ayarlar ve tasarımlar Zustand kullanılarak tarayıcı tarafında (persist middleware ile) saklanabilir, farklı bileşenler ile özelleştirilebilir bir deneyim sunulur.

## Özellikler

- Dinamik Grid (hücre) tabanlı tasarım alanı
- Özelleştirilebilir arka plan, sınır, gölge ve tipografi ayarları
- Zustand ile durum yönetimi (Banner, Katalog, Pizza, UI vb.)
- Tamamen Dockerize edilmiş altyapı

## Geliştirme Ortamı Kurulumu

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz.

### Önkoşullar
- Node.js (v18+)
- npm veya yarn

### Kurulum Adımları
1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

3. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini ziyaret ederek uygulamayı görüntüleyin.

## Docker ile Dağıtım (Deployment)

Proje üretim ortamında (production) çalışmaya uygun bir Docker altyapısına sahiptir. Projenin kök dizininde bulunan `docker-compose.yml` dosyası, Next.js uygulamasını ayağa kaldırmak ve yüklenen resim dosyalarını sunucuda kalıcı hale getirmek için yapılandırılmıştır.

### Dağıtım Adımları

Uygulamayı Docker ile arka planda başlatmak için:

```bash
docker-compose up -d --build
```

**Konfigürasyon Bilgileri:**
- Varsayılan olarak uygulama **3001** portundan dışarı açılır (örn. `http://localhost:3001`).
- Kalıcı resim yüklemeleri için host makinedeki `./public/images/products` dizini konteyner içerisindeki `/app/public/images/products` dizinine bağlanır (volume map).
- `NEXT_PUBLIC_BASE_URL` değişkeni, API çağrıları veya yönlendirmeler için projenin yayında olduğu alan adına (domain/IP) göre ayarlanmıştır.

Servisi durdurmak için:
```bash
docker-compose down
```