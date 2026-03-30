"use client";

import React, { useMemo } from "react";
import { useLayerStore } from "@/store/useLayerStore";
import { useCatalogStore, Forma } from "@/store/useCatalogStore";
import { LayerRenderer } from "./LayerRenderer";

const MM_TO_PX = 96 / 25.4;

interface LayerStackProps {
  forma?: Forma;
}

/**
 * LayerStack: Aktif formaya ait katmanları filtreleyen, zIndex sırasıyla LayerRenderer'a gönderen
 * ve maskeleme (clipPath) hesaplarını yapan bileşendir.
 */
export function LayerStack({ forma }: LayerStackProps) {
  const layers = useLayerStore((state) => state.layers);
  const template = useCatalogStore((state) => state.activeTemplate);

  // 1. Filreleme Mantığı: Aktif formaya özel katmanları belirle
  const filteredLayers = useMemo(() => {
    if (!forma) return [];
    
    // Aktif formadaki sayfaların ID listesi
    const formaPageIds = forma.pages.map((p) => p.id);
    
    return layers.filter((layer) => {
      const mask = layer.mask;
      
      // Maske yoksa veya Document tipindeyse her zaman göster
      if (!mask || mask.type === "document") return true;

      // Spread Mantığı: Tüm targetId'lerin bu formanın sayfası olması gerekir (Spread yayılımı bir forma ile sınırlıdır)
      if (mask.type === "spread") {
        return mask.targetIds.every((id) => formaPageIds.includes(id));
      }

      // Page Mantığı: En az bir targetId bu formanın sayfası ise göster
      if (mask.type === "page") {
        return mask.targetIds.some((id) => formaPageIds.includes(id));
      }

      return false;
    }).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)); // Z-Index'e göre küçükten büyüğe sırala
  }, [layers, forma]);

  if (!forma || !template) return null;

  return (
    <>
      {filteredLayers.map((layer) => (
        <LayerRenderer key={layer.id} layer={layer} forma={forma} />
      ))}
    </>
  );
}
