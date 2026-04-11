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
  const activeFormaId = useCatalogStore((state) => state.activeFormaId);
  const isZoomed = useUIStore((state) => state.isZoomed);
  const template = useCatalogStore((state) => state.activeTemplate);
  const clearCatalogSelection = useUIStore((state) => state.clearSelection);
  const disableAllImageEditModes = useCatalogStore((state) => state.disableAllImageEditModes);

  const activeForma = formas.find((f) => f.id === activeFormaId);
  const pages = activeForma?.pages || [];

  const [scale, setScale] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
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
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isZoomed) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const scaleW = (width - 60) / referenceWidthPx;
      const scaleH = (height - 60) / referenceHeightPx;
      setScale(Math.min(scaleW, scaleH));
    });

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [isZoomed, referenceWidthPx, referenceHeightPx]);

  // KURAL: Hiçbir hook bu satırın altında olamaz! (Rules of Hooks)
  if (!isMounted) return null;

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
        className={`canvas relative transition-transform duration-200 ${isZoomed ? "mx-auto mt-20 mb-8" : "absolute top-1/2 left-1/2 origin-center"}`}
        style={{
          boxSizing: "border-box",
          width: `${totalWidthMm}mm`,
          height: `${physicalHeight}mm`,
          padding: `${bleedMm}mm`,
          backgroundColor: "#ffffff",
          outline: "1px dashed #ef4444", // 1. KIRMIZI KESİKLİ ÇİZGİ (Taşma Payı)
          outlineOffset: "-1px",
          transform: isZoomed ? "scale(1)" : `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <LayerStack forma={activeForma} />

        <div 
          className="relative z-10 flex h-full w-full flex-row items-stretch bg-transparent"
          style={{ outline: "1px solid #22c55e" }} // 2. YEŞİL ÇİZGİ (Kesim Yeri)
        >
          {/* 3. MAVİ KESİKLİ ÇİZGİ (Güvenli Alan) - Yeşilden şaşmaz şekilde 5mm içeride */}
          <div
            data-hide-on-export="true"
            className="pointer-events-none absolute print:hidden z-50"
            style={{
              top: `5mm`,
              bottom: `5mm`,
              left: `5mm`,
              right: `5mm`,
              border: "1px dashed #3b82f6",
              boxSizing: "border-box",
            }}
          />

          {order.map((n) => (
            <Page key={n} pageNumber={n} />
          ))}
        </div>
      </div>
    </div>
  );
}