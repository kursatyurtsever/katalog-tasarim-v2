"use client";

import React, { useMemo } from "react";
import { Layer } from "@/types/document";
import { useCatalogStore, Forma } from "@/store/useCatalogStore";

const MM_TO_PX = 96 / 25.4;

interface LayerRendererProps {
  layer: Layer;
  forma: Forma;
}

/**
 * getPageOffsetX: Formadaki sayfaları pageNumber'a göre dizip, 
 * hedef sayfanın başlangıç X noktasını (mm) döndürür.
 */
function getPageOffsetX(forma: Forma, targetPageId: string, template: any): number {
  if (!forma || !template) return 0;

  // Canvas.tsx sayfaları forma.pages sırasıyla render ettiği için X Offset'i tam bu sıraya göre hesaplıyoruz.
  const targetIndex = forma.pages.findIndex(p => p.id === targetPageId);
  if (targetIndex === -1) return 0;

  // Hedef sayfaya kadar olan tüm sayfaların genişliklerini topla
  const offsetX = forma.pages.slice(0, targetIndex).reduce((sum, p) => {
    const pTemplate = template.pages.find((tp: any) => tp.pageNumber === p.pageNumber);
    return sum + (pTemplate?.widthMm || 210);
  }, 0);

  return offsetX;
}

/**
 * LayerRenderer: Yeni hiyerarşi ve gelişmiş poligon mantığı ile katman render eder.
 */
export function LayerRenderer({ layer, forma }: LayerRendererProps) {
  const template = useCatalogStore((state) => state.activeTemplate);
  
  const { clipPath, layerWidthPx, layerHeightPx } = useMemo(() => {
    if (!template) return { clipPath: "none", layerWidthPx: 0, layerHeightPx: 0 };

    const lwPx = layer.bounds.w * MM_TO_PX;
    const lhPx = layer.bounds.h * MM_TO_PX;
    const lxPx = layer.bounds.x * MM_TO_PX;
    const lyPx = layer.bounds.y * MM_TO_PX;

    if (!layer.mask || layer.mask.type === "document") {
      return { clipPath: "none", layerWidthPx: lwPx, layerHeightPx: lhPx };
    }

    const targetIds = layer.mask.targetIds || [];
    if (targetIds.length === 0) return { clipPath: "none", layerWidthPx: lwPx, layerHeightPx: lhPx };

    // Hedef sayfaların koordinatlarını hesapla (Katmana göre rölatif pikseller)
    const pageRects = targetIds.map(pid => {
      const page = forma.pages.find(p => p.id === pid);
      const pConfig = template.pages.find((tp: any) => tp.pageNumber === page?.pageNumber);
      if (!page || !pConfig) return null;

      const pxMm = getPageOffsetX(forma, pid, template) + template.bleedMm;
      const pwMm = pConfig.widthMm;
      const pyMm = 0 + template.bleedMm;
      const phMm = template.openHeightMm;

      return {
        x1: (pxMm * MM_TO_PX) - lxPx,
        y1: (pyMm * MM_TO_PX) - lyPx,
        x2: ((pxMm + pwMm) * MM_TO_PX) - lxPx,
        y2: ((pyMm + phMm) * MM_TO_PX) - lyPx
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    if (pageRects.length === 0) return { clipPath: "none", layerWidthPx: lwPx, layerHeightPx: lhPx };

    let generatedClipPath = "none";

    if (layer.mask.excludeGaps) {
      // 1. Exclude Gaps: Çoklu dikdörtgen (polygon bridge)
      pageRects.sort((a, b) => a.x1 - b.x1);

      const topPoints: string[] = [];
      const bottomPoints: string[] = [];

      pageRects.forEach(rect => {
        // Üst kenarlar (L -> R)
        topPoints.push(`${rect.x1}px ${rect.y1}px`);
        topPoints.push(`${rect.x2}px ${rect.y1}px`);
        // Alt kenarlar (R -> L için reverse order'da unshift)
        bottomPoints.unshift(`${rect.x1}px ${rect.y2}px`);
        bottomPoints.unshift(`${rect.x2}px ${rect.y2}px`);
      });

      generatedClipPath = `polygon(${(topPoints.concat(bottomPoints)).join(", ")})`;
    } else {
      // 2. No Exclude Gaps: Tek büyük dikdörtgen
      const minX = Math.min(...pageRects.map(r => r.x1));
      const minY = Math.min(...pageRects.map(r => r.y1));
      const maxX = Math.max(...pageRects.map(r => r.x2));
      const maxY = Math.max(...pageRects.map(r => r.y2));

      generatedClipPath = `polygon(${minX}px ${minY}px, ${maxX}px ${minY}px, ${maxX}px ${maxY}px, ${minX}px ${maxY}px)`;
    }

    return { clipPath: generatedClipPath, layerWidthPx: lwPx, layerHeightPx: lhPx };
  }, [layer, forma, template]);

  if (!layer.visible) return null;

  // Transform değerleri
  const rotateArr = layer.transform.rotation || 0;
  const scaleX = (layer.transform.flipX ? -1 : 1);
  const scaleY = (layer.transform.flipY ? -1 : 1);

  return (
    /** 
     * WRAPPER DIV: Opacity, Blend Mode ve Ana Pozisyon
     */
    <div
      id={`layer-wrapper-${layer.id}`}
      style={{
        position: "absolute",
        left: `${layer.bounds.x * MM_TO_PX}px`,
        top: `${layer.bounds.y * MM_TO_PX}px`,
        width: `${layerWidthPx}px`,
        height: `${layerHeightPx}px`,
        opacity: (layer.properties.opacity ?? 100) / 100,
        mixBlendMode: (layer.properties.blendMode as any) || "normal",
        pointerEvents: layer.locked ? "none" : "auto",
        zIndex: layer.zIndex,
        clipPath: clipPath,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/** 
       * TRANSFORM DIV: Rotation, Scale, Flip (Merkezden)
       */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `rotate(${rotateArr}deg) scale(${scaleX}, ${scaleY})`,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "stretch",
        }}
      >
        {/** 
         * CONTENT: Solid veya Image
         */}
        {layer.type === "solid" ? (
          <div 
            style={{ 
              flex: 1, 
              background: layer.properties.gradient || layer.properties.color || "transparent" 
            }} 
          />
        ) : (
          layer.properties.imageUrl && (
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <img
                src={layer.properties.imageUrl}
                alt={layer.name || ""}
                style={{ 
                  width: "100%",
                  height: "100%",
                  objectFit: (layer.properties.fitMode === "repeat" ? "fill" : (layer.properties.fitMode || "cover")) as any 
                }}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
