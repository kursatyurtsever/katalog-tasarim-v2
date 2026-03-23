import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const filename = formData.get("filename") as string;

    if (!file || !filename) {
      return NextResponse.json({ error: "Dosya veya dosya adı eksik gönderildi." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Projenin kök dizinindeki public/images/products yolunu kesin olarak hedefliyoruz
    const targetDir = path.join(process.cwd(), "public", "images", "products");
    
    // Klasör her ihtimale karşı yoksa oluşturulur
    await fs.mkdir(targetDir, { recursive: true });
    
    // Tam dosya yolu (Örn: D:\US\Nuri\katalog-tasarim-v2\public\images\products\125KY.png)
    const savePath = path.join(targetDir, filename);
    
    // Dosyayı diske yaz
    await fs.writeFile(savePath, buffer);
    
    // VS Code terminalinde görebilmen için log bırakıyoruz
    console.log("✅ BAŞARILI: Dosya kaydedildi ->", savePath);

    return NextResponse.json({ success: true, path: `/images/products/${filename}` });
  } catch (error: any) {
    console.error("❌ Upload API Hatası:", error);
    return NextResponse.json({ error: error.message || "Sunucu hatası oluştu." }, { status: 500 });
  }
}