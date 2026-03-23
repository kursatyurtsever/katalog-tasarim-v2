"use server";

import { promises as fs } from "fs";
import path from "path";

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const filename = formData.get("filename") as string;

    if (!file || !filename) {
      return { success: false, error: "Dosya veya isim eksik." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const targetDir = path.join(process.cwd(), "public", "images", "products");
    
    await fs.mkdir(targetDir, { recursive: true });
    
    const savePath = path.join(targetDir, filename);
    await fs.writeFile(savePath, buffer);

    return { success: true, path: `/images/products/${filename}` };
  } catch (error: any) {
    console.error("Sunucu tarafında resim yükleme hatası:", error);
    return { success: false, error: error.message || "Bilinmeyen bir sunucu hatası." };
  }
}