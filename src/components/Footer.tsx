"use client";

import { useCatalogStore } from "@/store/useCatalogStore";

interface FooterProps {
  pageNumber: number;
}

/**
 * Her sayfanın altındaki logo alanı ve düzenlenebilir metin (contenteditable yerine controlled input).
 */
export function Footer({ pageNumber }: FooterProps) {
  const footerText = useCatalogStore((state) => state.footerTexts[pageNumber] ?? "");
  const footerLogo = useCatalogStore((state) => state.footerLogos[pageNumber]);
  const setFooterText = useCatalogStore((state) => state.setFooterText);

  return (
    <div className="flex h-[10mm] shrink-0 items-center gap-2 mt-2">
      <div
        className="footer-logo-zone flex h-[10mm] w-[23mm] shrink-0 cursor-pointer items-center justify-center border border-dashed border-slate-400 bg-white relative"
        title="Logo Seçmek İçin Tıklayın"
        data-page={pageNumber}
      >
        {footerLogo ? (
          <img
            src={footerLogo}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-center text-[8px] leading-none text-slate-400 pointer-events-none">
            Resim
            <br />
            Seç
          </span>
        )}
      </div>
      <div className="relative group flex-grow">
        <textarea
          value={footerText}
          onChange={(e) => setFooterText(pageNumber, e.target.value)}
          className="footer-editable w-full h-full resize-none overflow-hidden rounded border border-dashed border-transparent bg-transparent py-1 text-black outline-none leading-tight hover:border-slate-300 focus:border-slate-400"
          style={{ fontSize: "9pt", minHeight: "10mm" }}
          rows={2}
        />
      </div>
    </div>
  );
}
