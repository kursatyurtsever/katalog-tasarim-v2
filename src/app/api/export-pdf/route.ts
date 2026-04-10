import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const { formaIds } = await req.json();

    if (!formaIds || !Array.isArray(formaIds) || formaIds.length === 0) {
      return NextResponse.json({ error: "Geçersiz formaId listesi." }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const browser = await puppeteer.launch({
      executablePath: process.env.NODE_ENV === "production" ? "/usr/bin/chromium-browser" : undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    
    // Yüksek çözünürlük için viewport ayarla
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

    const mergedPdf = await PDFDocument.create();

    for (const formaId of formaIds) {
      const targetUrl = `${baseUrl}/print-view?formaId=${formaId}`;
      await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });

      // Dinamik boyutları al (print-canvas elementinden)
      const dimensions = await page.evaluate(() => {
        const el = document.getElementById("print-canvas");
        if (!el) return { width: 210, height: 297 };
        
        // Style'daki width ve height mm cinsinden
        const widthStr = el.style.width.replace("mm", "");
        const heightStr = el.style.height.replace("mm", "");
        
        return {
          width: parseFloat(widthStr) || 210,
          height: parseFloat(heightStr) || 297
        };
      });

      const pdfBuffer = await page.pdf({
        printBackground: true,
        width: `${dimensions.width}mm`,
        height: `${dimensions.height}mm`,
        pageRanges: "1", // Sadece ilk sayfa
      });

      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, [0]);
      const [firstPage] = copiedPages;
      mergedPdf.addPage(firstPage);
    }

    await browser.close();

    const finalPdfBytes = await mergedPdf.save();

    return new NextResponse(Buffer.from(finalPdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Katalog.pdf"',
      },
    });
  } catch (error: any) {
    console.error("PDF Export Hatası:", error);
    return NextResponse.json({ error: error.message || "PDF oluşturulurken hata oluştu." }, { status: 500 });
  }
}