"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useUIStore } from "@/store/useUIStore";
import { useLayerStore } from "@/store/useLayerStore";
import { Page } from "./Page";
import { LayerStack } from "./LayerStack";

const MM_TO_PX = 96 / 25.4;

export function Canvas() {
  const formas = useCatalogStore((state) => state.formas);
  const layers = useLayerStore((state) => state.layers);
  const activeFormaId = useCatalogStore((state) => state.activeFormaId);
  const globalSettings = useCatalogStore((state) => state.globalSettings);
  const isZoomed = useUIStore((state) => state.isZoomed);
  const template = useCatalogStore((state) => state.activeTemplate);
  const clearCatalogSelection = useUIStore((state) => state.clearSelection);
  const disableAllImageEditModes = useCatalogStore((state) => state.disableAllImageEditModes);

  const activeForma = formas.find((f) => f.id === activeFormaId);
  const pages = activeForma?.pages || [];

  const [scale, setScale] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { bleedMm, openHeightMm } = template;
  const physicalHeight = openHeightMm + bleedMm * 2;

  const order = pages.map((p) => p.pageNumber);

  const totalWidthMm = useMemo(() => {
    return order.reduce((sum, n) => {
      const pc = template.pages.find((p) => p.pageNumber === n);
      return sum + (pc ? pc.widthMm : 210);
    }, 0) + (bleedMm * 2);
  }, [order, template, bleedMm]);

  const referenceWidthPx = totalWidthMm * MM_TO_PX;
  const referenceHeightPx = physicalHeight * MM_TO_PX;

  useEffect(() => {
    if (isZoomed) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const scaleW = (width - 80) / referenceWidthPx;
      const scaleH = (height - 80) / referenceHeightPx;
      setScale(Math.min(scaleW, scaleH));
    });

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [isZoomed, referenceWidthPx, referenceHeightPx]);

  return (
    <div
      ref={wrapperRef}
      className={`flex-1 relative w-full h-full min-w-0 min-h-0 bg-slate-300 ${isZoomed ? "overflow-auto" : "overflow-hidden"}`}
    >
<div
        id="canvas"
        onClick={() => {
          clearCatalogSelection();
          disableAllImageEditModes();
        }}
        className={`canvas relative shadow-2xl transition-transform duration-200 ${isZoomed ? "mx-auto mt-20 mb-8" : "absolute top-1/2 left-1/2 origin-center"}`}
        style={{
          boxSizing: "border-box",
          width: `${totalWidthMm}mm`, // Bleed DAHİL: 627 + 4 = 631mm
          height: `${physicalHeight}mm`, // Bleed DAHİL: 297 + 4 = 301mm
          padding: `${bleedMm}mm`, // İçeriği 2mm içeri it
          backgroundColor: "#ffffff", // Beyaz zemin
          outline: "0.5px dashed rgba(255, 0, 0, 0.4)", // INDESIGN: Kırmızı Taşma Çizgisi (Bleed)
          outlineOffset: "-1px",
          transform: isZoomed
            ? "scale(1)"
            : `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <LayerStack forma={activeForma} />

        <div className="relative z-10 flex h-full w-full flex-row items-stretch bg-transparent">
          {order.map((n) => (
            <Page key={n} pageNumber={n} />
          ))}
        </div>

        {/* INDESIGN: Siyah Kesim Çizgisi (Trim Box) */}
        <div
          className="pointer-events-none absolute print:hidden z-50"
          style={{
            top: `${bleedMm}mm`, 
            bottom: `${bleedMm}mm`, 
            left: `${bleedMm}mm`, 
            right: `${bleedMm}mm`,
            border: "0.5px solid rgba(0, 0, 0, 0.2)", 
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}
