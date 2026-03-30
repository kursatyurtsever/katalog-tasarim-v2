"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { defaultBackground, useCatalogStore } from "@/store/useCatalogStore";
import { useLayerStore } from "@/store/useLayerStore";
import { Page } from "./Page";
import Image from "next/image"; // Import Image component for next/image

const MM_TO_PX = 96 / 25.4;

export function Canvas() {
  const formas = useCatalogStore((state) => state.formas);
  const layers = useLayerStore((state) => state.layers);
  const activeFormaId = useCatalogStore((state) => state.activeFormaId);
  const globalSettings = useCatalogStore((state) => state.globalSettings);
  const isZoomed = useCatalogStore((state) => state.isZoomed);
  const template = useCatalogStore((state) => state.activeTemplate);
  const clearCatalogSelection = useCatalogStore((state) => state.clearSelection);
  const disableAllImageEditModes = useCatalogStore((state) => state.disableAllImageEditModes);

  const activeForma = formas.find((f) => f.id === activeFormaId);
  const pages = activeForma?.pages || [];
  // globalBg ve formaBg tanımları artık doğrudan kullanılmıyor, ancak migration için gerekebilir.
  const globalBg = { ...defaultBackground, ...(globalSettings.globalBackground || {}) };
  // const formaBg = { ...defaultBackground, ...(activeForma?.globalBackground || {}) }; // Artık kullanılmıyor

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
          disableAllImageEditModes(); // YENİ: Boşluğa tıklanınca serbest konumu kapat
        }}
        className={`canvas relative shadow-2xl transition-transform duration-200 ${isZoomed ? "mx-auto mt-20 mb-8" : "absolute top-1/2 left-1/2 origin-center"}`}
        style={{
          boxSizing: "border-box",
          width: `${totalWidthMm}mm`,
          height: `${physicalHeight}mm`,
          padding: `${bleedMm}mm`,
          transform: isZoomed
            ? "scale(1)"
            : `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {/* Katmanları render etme (en altta) */}
        {layers.map((layer) => {
          // Katmanın hangi sayfalara maskeleneceğini belirle
          const maskedPageIds = layer.mask?.targetIds || [];
          let clipPath = "none";

          if (maskedPageIds.length > 0) {
            // Maskelenecek sayfaların toplam bounding box'ını hesapla
            const boundingBox = maskedPageIds.reduce((acc, pageId) => {
              const formaPage = activeForma?.pages.find((p) => p.id === pageId);
              const pageConfig = template.pages.find((p) => p.pageNumber === formaPage?.pageNumber);

              if (!formaPage || !pageConfig) return acc; // Sayfa veya konfigürasyon bulunamazsa atla

              // Sayfanın Canvas içindeki X koordinatını hesapla
              const pageOffsetX = activeForma?.pages.slice(0, activeForma.pages.findIndex(p => p.id === pageId))
                .reduce((sum, p) => {
                  const pTemplate = template.pages.find(tp => tp.pageNumber === p.pageNumber);
                  return sum + (pTemplate?.widthMm || 0);
                }, 0) || 0;

              const pageX = pageOffsetX * MM_TO_PX;
              const pageY = 0; // Sayfa Y koordinatı canvas'ın üstüne göre 0
              const pageRenderedWidth = pageConfig.widthMm * MM_TO_PX;
              const pageRenderedHeight = template.openHeightMm * MM_TO_PX;

              if (acc.minX === null || pageX < acc.minX) acc.minX = pageX;
              if (acc.minY === null || pageY < acc.minY) acc.minY = pageY;
              if (acc.maxX === null || (pageX + pageRenderedWidth) > acc.maxX) acc.maxX = pageX + pageRenderedWidth;
              if (acc.maxY === null || (pageY + pageRenderedHeight) > acc.maxY) acc.maxY = pageY + pageRenderedHeight;

              return acc;
            }, { minX: null as number | null, minY: null as number | null, maxX: null as number | null, maxY: null as number | null });

            if (boundingBox.minX !== null && boundingBox.minY !== null && boundingBox.maxX !== null && boundingBox.maxY !== null) {
              // Canvas'ın toplam piksel boyutları
              const canvasWidthPx = totalWidthMm * MM_TO_PX;
              const canvasHeightPx = physicalHeight * MM_TO_PX;

              // clip-path: inset() değerleri (top, right, bottom, left)
              const topClip = boundingBox.minY;
              const rightClip = canvasWidthPx - boundingBox.maxX;
              const bottomClip = canvasHeightPx - boundingBox.maxY;
              const leftClip = boundingBox.minX;

              clipPath = `inset(${topClip}px ${rightClip}px ${bottomClip}px ${leftClip}px)`;
            }
          }

          const layerStyle: React.CSSProperties = {
            position: "absolute",
            left: `${layer.bounds.x * MM_TO_PX}px`,
            top: `${layer.bounds.y * MM_TO_PX}px`,
            width: `${layer.bounds.w * MM_TO_PX}px`,
            height: `${layer.bounds.h * MM_TO_PX}px`,
            zIndex: layer.zIndex, // Z-index katman verisinden gelsin
            clipPath: clipPath,
            transform: `rotate(${layer.transform.rotation}deg) scale(${layer.transform.flipX ? -1 : 1}, ${layer.transform.flipY ? -1 : 1})`,
            transformOrigin: "center",
            boxSizing: "border-box",
          };

          if (layer.type === "solid") {
            return (
              <div
                key={layer.id}
                style={{
                  ...layerStyle,
                  backgroundColor: layer.properties.color,
                  opacity: layer.properties.opacity / 100,
                }}
              />
            );
          } else if (layer.type === "image") {
            return (
              <Image
                key={layer.id}
                src={layer.properties.imageUrl}
                alt="Layer Image"
                // Image component'i width/height prop'larını doğrudan piksel olarak bekler
                width={layer.bounds.w * MM_TO_PX}
                height={layer.bounds.h * MM_TO_PX}
                style={{
                  ...layerStyle,
                  // transform zaten layerStyle içinde ayarlandı
                  objectFit: "cover", // Resmin bounds'a sığdırılması
                  opacity: layer.properties.opacity / 100,
                }}
              />
            );
          }
          return null;
        })}

        <div className="relative z-10 flex h-full w-full flex-row items-stretch bg-transparent">
          {order.map((n) => (
            <Page key={n} pageNumber={n} />
          ))}
        </div>

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
