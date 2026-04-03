"use client";

import React, { useMemo } from "react";
import { Layer } from "@/types/document";
import { useCatalogStore, Forma, CatalogPage } from "@/store/useCatalogStore";

const MM_TO_PX = 96 / 25.4;

interface LayerRendererProps {
  layer: Layer;
  forma: Forma;
}

function getPageOffsetX(forma: Forma, targetPageId: string, template: any): number {
  if (!forma || !template) return 0;
  const targetIndex = forma.pages.findIndex((p: CatalogPage) => p.id === targetPageId);
  if (targetIndex === -1) return 0;
  return forma.pages.slice(0, targetIndex).reduce((sum: number, p: CatalogPage) => {
    const pTemplate = template.pages.find((tp: any) => tp.pageNumber === p.pageNumber);
    return sum + (pTemplate?.widthMm || 210);
  }, 0);
}

export function LayerRenderer({ layer, forma }: LayerRendererProps) {
  const template = useCatalogStore((state) => state.activeTemplate);
  
  const { clipPath, layerWidthPx, layerHeightPx, layerLeftPx, layerTopPx } = useMemo(() => {
    if (!template) return { clipPath: "none", layerWidthPx: 0, layerHeightPx: 0, layerLeftPx: 0, layerTopPx: 0 };

    let fallbackLeft = (layer.bounds.x + template.bleedMm) * MM_TO_PX;
    let fallbackTop = (layer.bounds.y + template.bleedMm) * MM_TO_PX;
    let fallbackWidth = layer.bounds.w * MM_TO_PX;
    let fallbackHeight = layer.bounds.h * MM_TO_PX;

    if (!layer.mask || layer.mask.type === "document" || !layer.mask.targetIds || layer.mask.targetIds.length === 0) {
      if (layer.type === 'solid' || layer.type === 'image') {
         fallbackLeft = 0;
         fallbackTop = 0;
         fallbackWidth = (template.openWidthMm + template.bleedMm * 2) * MM_TO_PX;
         fallbackHeight = (template.openHeightMm + template.bleedMm * 2) * MM_TO_PX;
      }
      return { clipPath: "none", layerWidthPx: fallbackWidth, layerHeightPx: fallbackHeight, layerLeftPx: fallbackLeft, layerTopPx: fallbackTop };
    }

    const pageRects = layer.mask.targetIds.map((pid: string) => {
      const page = forma.pages.find((p: CatalogPage) => p.id === pid);
      const pConfig = template.pages.find((tp: any) => tp.pageNumber === page?.pageNumber);
      if (!page || !pConfig) return null;

      const pageIndex = forma.pages.findIndex((p: CatalogPage) => p.id === pid);
      const pxMm = getPageOffsetX(forma, pid, template);
      
      let rectX1 = pxMm + template.bleedMm;
      let rectX2 = rectX1 + pConfig.widthMm;
      let rectY1 = template.bleedMm;
      let rectY2 = rectY1 + template.openHeightMm;

      rectY1 -= template.bleedMm;
      rectY2 += template.bleedMm;

      if (pageIndex === 0) rectX1 -= template.bleedMm;
      if (pageIndex === forma.pages.length - 1) rectX2 += template.bleedMm;
      else rectX2 += 0.5;

      return { rectX1, rectX2, rectY1, rectY2 };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    if (pageRects.length === 0) {
       return { clipPath: "none", layerWidthPx: fallbackWidth, layerHeightPx: fallbackHeight, layerLeftPx: fallbackLeft, layerTopPx: fallbackTop };
    }

    const minX = Math.min(...pageRects.map((r: any) => r.rectX1));
    const minY = Math.min(...pageRects.map((r: any) => r.rectY1));
    const maxX = Math.max(...pageRects.map((r: any) => r.rectX2));
    const maxY = Math.max(...pageRects.map((r: any) => r.rectY2));

    const layerLeftPx = minX * MM_TO_PX;
    const layerTopPx = minY * MM_TO_PX;
    const layerWidthPx = (maxX - minX) * MM_TO_PX;
    const layerHeightPx = (maxY - minY) * MM_TO_PX;

    let generatedClipPath = "none";
    if (layer.mask.excludeGaps) {
      pageRects.sort((a: any, b: any) => a.rectX1 - b.rectX1);
      const topPoints: string[] = [];
      const bottomPoints: string[] = [];
      pageRects.forEach((rect: any) => {
        const localX1 = (rect.rectX1 - minX) * MM_TO_PX;
        const localY1 = (rect.rectY1 - minY) * MM_TO_PX;
        const localX2 = (rect.rectX2 - minX) * MM_TO_PX;
        const localY2 = (rect.rectY2 - minY) * MM_TO_PX;
        
        topPoints.push(`${localX1}px ${localY1}px`);
        topPoints.push(`${localX2}px ${localY1}px`);
        bottomPoints.unshift(`${localX1}px ${localY2}px`);
        bottomPoints.unshift(`${localX2}px ${localY2}px`);
      });
      generatedClipPath = `polygon(${(topPoints.concat(bottomPoints)).join(", ")})`;
    } else {
      generatedClipPath = `polygon(0px 0px, ${layerWidthPx}px 0px, ${layerWidthPx}px ${layerHeightPx}px, 0px ${layerHeightPx}px)`;
    }

    return { clipPath: generatedClipPath, layerWidthPx, layerHeightPx, layerLeftPx, layerTopPx };
  }, [layer, forma, template]);

  if (!layer.visible) return null;

  const rotateArr = layer.transform.rotation || 0;
  const scaleX = (layer.transform.flipX ? -1 : 1);
  const scaleY = (layer.transform.flipY ? -1 : 1);

  return (
    <div
      id={`layer-wrapper-${layer.id}`}
      style={{
        position: "absolute",
        left: `${layerLeftPx}px`,
        top: `${layerTopPx}px`,
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
        {layer.type === "solid" ? (
          <div style={{ flex: 1, background: layer.properties.gradient || layer.properties.color || "transparent" }} />
        ) : (
          layer.properties.imageUrl && (
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <img
                src={layer.properties.imageUrl}
                alt={layer.name || ""}
                style={{ width: "100%", height: "100%", objectFit: (layer.properties.fitMode === "repeat" ? "fill" : (layer.properties.fitMode || "cover")) as any }}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
