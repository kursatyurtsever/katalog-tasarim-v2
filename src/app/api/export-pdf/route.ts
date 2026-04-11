import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import { availableTemplates } from "@/lib/templates";

export async function POST(req: Request) {
  try {
    const { formaIds, catalogState, layerState, format = "pdf" } = await req.json();

    if (!formaIds || !Array.isArray(formaIds) || formaIds.length === 0) {
      return NextResponse.json({ error: "Geçersiz formaId listesi." }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // STALE DATA FIX: Hafızadaki eski şablon yerine sistemin orijinal taze şablonunu al
    const activeForma = catalogState.formas?.find((f: any) => f.id === formaIds[0]);
    const staleTemplate = catalogState.activeTemplate;
    const template = availableTemplates.find(t => t.id === staleTemplate?.id) || staleTemplate;
    
    // Puppeteer'a yollanacak State'i de taze şablonla güncelle
    catalogState.activeTemplate = template;
    
    let totalWidthMm = 210;
    let physicalHeightMm = 297;

    if (activeForma && template) {
      const order = activeForma.pages.map((p: any) => p.pageNumber);
      totalWidthMm = order.reduce((sum: number, n: number) => {
        const pc = template.pages.find((p: any) => p.pageNumber === n);
        return sum + (pc ? pc.widthMm : 210);
      }, 0) + (template.bleedMm * 2);
      physicalHeightMm = template.openHeightMm + (template.bleedMm * 2);
    }

    // Milimetrik kusursuzluk için CSS piksellerini doğrudan matematikle hesaplıyoruz (96 DPI)
    const exactCssWidth = (totalWidthMm * 96) / 25.4;
    const exactCssHeight = (physicalHeightMm * 96) / 25.4;

    const viewportWidth = Math.ceil(exactCssWidth);
    const viewportHeight = Math.ceil(exactCssHeight);

    const browser = await puppeteer.launch({
      executablePath: process.env.NODE_ENV === "production" ? "/usr/bin/chromium-browser" : undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    
    // Görseller için 300 DPI Çarpanı (300 / 96 = 3.125)
    const scaleFactor = format === "pdf" ? 2 : 3.125;

    await page.setViewport({ 
      width: viewportWidth, 
      height: viewportHeight, 
      deviceScaleFactor: scaleFactor 
    });

    await page.evaluateOnNewDocument((catalogData, layerData) => {
      localStorage.setItem("catalog-storage-v2", JSON.stringify({ state: catalogData, version: 0 }));
      (window as any).__INJECTED_LAYER_STATE__ = layerData;
    }, catalogState, layerState);

    if (format === "pdf") {
      const mergedPdf = await PDFDocument.create();

      for (const formaId of formaIds) {
        const targetUrl = `${baseUrl}/print-view?formaId=${formaId}`;
        
        await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForSelector('#print-canvas-ready', { timeout: 60000 });

        // DOM'a güvenmiyoruz. Kesin mm değerlerini margin:0 ile dayatıyoruz.
        const pdfBuffer = await page.pdf({
          printBackground: true,
          width: `${totalWidthMm}mm`,
          height: `${physicalHeightMm}mm`,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
          pageRanges: "1",
          preferCSSPageSize: true
        });

        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, [0]);
        mergedPdf.addPage(copiedPages[0]);
      }

      await browser.close();
      const finalPdfBytes = await mergedPdf.save();

      return new NextResponse(Buffer.from(finalPdfBytes), {
        status: 200,
        headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="Katalog.pdf"' },
      });
    } else {
      const targetUrl = `${baseUrl}/print-view?formaId=${formaIds[0]}`;
      await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
      await page.waitForSelector('#print-canvas-ready', { timeout: 60000 });

      // HTML Elementine güvenmiyoruz, doğrudan milimetrik hesaplanan piksel koordinatlarını kullanıyoruz
      const imageBuffer = await page.screenshot({
        type: format === "jpeg" ? "jpeg" : "png",
        quality: format === "jpeg" ? 100 : undefined,
        omitBackground: format === "png",
        clip: { 
          x: 0, 
          y: 0, 
          width: exactCssWidth, 
          height: exactCssHeight 
        }
      });

      await browser.close();

      if (!imageBuffer) throw new Error("Görsel oluşturulamadı.");

      return new NextResponse(Buffer.from(imageBuffer as Uint8Array), {
        status: 200,
        headers: { "Content-Type": `image/${format}`, "Content-Disposition": `attachment; filename="katalog.${format}"` },
      });
    }
  } catch (error: any) {
    console.error("Export Hatası:", error);
    return NextResponse.json({ error: error.message || "Hata oluştu." }, { status: 500 });
  }
}
