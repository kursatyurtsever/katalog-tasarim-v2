"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";
import { Page } from "./Page";

const MM_TO_PX = 96 / 25.4;

function splitForms(templatePages: { pageNumber: number }[]) {
  const all = templatePages.map((p) => p.pageNumber);
  const half = Math.ceil(all.length / 2);
  return { outer: all.slice(0, half), inner: all.slice(half) };
}

export function Canvas() {
  const pages = useCatalogStore((state) => state.pages);
  const activeTab = useCatalogStore((state) => state.activeTab);
  const isZoomed = useCatalogStore((state) => state.isZoomed);
  const template = useCatalogStore((state) => state.activeTemplate);
  
  const setActiveTab = useCatalogStore((state) => state.setActiveTab);
  const toggleZoom = useCatalogStore((state) => state.toggleZoom);
  
  const [scale, setScale] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { bleedMm, openHeightMm } = template;
  const physicalHeight = openHeightMm + bleedMm * 2;

  const { outer, inner } = useMemo(() => splitForms(template.pages), [template]);
  const hasInner = inner.length > 0;
  const order = activeTab === "inner" && hasInner ? inner : outer;

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
      setScale(1);
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
        <button
          onClick={() => setActiveTab("outer")}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === "outer" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
        >
          Dış Sayfalar
        </button>
        {hasInner && (
          <button
            onClick={() => setActiveTab("inner")}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === "inner" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            İç Sayfalar
          </button>
        )}
        <div className="w-px h-5 bg-slate-300 mx-2"></div>
        <button
          onClick={toggleZoom}
          className="px-4 py-1.5 rounded-md text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          {isZoomed ? "Ekrana Sığdır" : "Orijinal Boyut"}
        </button>
      </div>

      {/* Kaybolan CSS sınıfları ve box-sizing ayarları buraya geri eklendi */}
      <div
        id="canvas"
        className={`canvas flex flex-row items-stretch bg-white shadow-2xl transition-transform duration-200 ${isZoomed ? "relative mx-auto mt-20 mb-8" : "absolute top-1/2 left-1/2 origin-center"}`}
        style={{
          boxSizing: "border-box",
          width: `${totalWidthMm}mm`,
          height: `${physicalHeight}mm`,
          padding: `${bleedMm}mm`,
          transform: isZoomed ? "scale(1)" : `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {order.map((n) => (
          <Page key={n} pageNumber={n} />
        ))}

        <div
          className="pointer-events-none absolute print:hidden"
          style={{
            top: `${bleedMm}mm`, bottom: `${bleedMm}mm`, left: `${bleedMm}mm`, right: `${bleedMm}mm`,
            border: "1px dashed red", zIndex: 50,
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}