import os

# Gemini'nin görmesini istediğin klasörler
target_folders = ['src/components', 'src/store', 'src/lib', 'src/app']
# Görmesine gerek olmayan, kafasını karıştıracak yerler
exclude_files = ['node_modules', '.next', 'package-lock.json', '.git']

# Mevcut dosyaları kontrol et ve bir sonraki numarayı bul
counter = 1
while os.path.exists(f"proje_rontgeni_{counter}.txt"):
    counter += 1

output_file = f"proje_rontgeni_{counter}.txt"

with open(output_file, "w", encoding="utf-8") as f:
    for folder in target_folders:
        if not os.path.exists(folder):
            continue
        for root, dirs, files in os.walk(folder):
            for file in files:
                if any(ex in root for ex in exclude_files) or file in exclude_files:
                    continue
                if file.endswith(('.ts', '.tsx', '.css', '.js')):
                    file_path = os.path.join(root, file)
                    f.write(f"\n\n--- DOSYA: {file_path} ---\n\n")
                    try:
                        with open(file_path, "r", encoding="utf-8") as content:
                            f.write(content.read())
                    except Exception as e:
                        f.write(f"Hata: Dosya okunamadı - {str(e)}")

print(f"Röntgen başarıyla oluşturuldu: {output_file}")