"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useCatalogStore } from "@/store/useCatalogStore";
import { useLayerStore } from "@/store/useLayerStore";
import { Page } from "@/components/Canvas/Page";
import { LayerStack } from "@/components/Canvas/LayerStack";
import { Suspense } from "react";
import { availableTemplates } from "@/lib/templates";

function PrintViewContent() {
  const searchParams = useSearchParams();
  const formaId = searchParams.get("formaId");
  
  const formas = useCatalogStore((state) => state.formas);
  const staleTemplate = useCatalogStore((state) => state.activeTemplate);
  const setActiveFormaId = useCatalogStore((state) => state.setActiveFormaId);
  
  // STALE DATA FIX: Her zaman sistemdeki taze şablonu baz alıyoruz.
  const template = useMemo(() => {
    return availableTemplates.find(t => t.id === staleTemplate?.id) || staleTemplate;
  }, [staleTemplate]);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).__INJECTED_LAYER_STATE__) {
      useLayerStore.setState({ layers: (window as any).__INJECTED_LAYER_STATE__.layers });
    }
    if (formaId) {
      setActiveFormaId(Number(formaId));
      setTimeout(() => setIsReady(true), 1500); 
    }
  }, [formaId, setActiveFormaId]);

  const activeForma = formas.find((f) => f.id === Number(formaId));
  
  const totalWidthMm = useMemo(() => {
    if (!activeForma) return 210;
    const order = activeForma.pages.map((p) => p.pageNumber);
    return order.reduce((sum, n) => {
      const pc = template.pages.find((p) => p.pageNumber === n);
      return sum + (pc ? pc.widthMm : 210);
    }, 0) + (template.bleedMm * 2);
  }, [activeForma, template]);

  if (!isReady || !activeForma) {
    return <div className="p-4 bg-white text-black text-center text-xl mt-10">PDF Hazırlanıyor, lütfen bekleyin...</div>;
  }

  const physicalHeight = template.openHeightMm + template.bleedMm * 2;
  const order = activeForma.pages.map((p) => p.pageNumber);

  return (
    <div className="print-mode bg-white overflow-hidden m-0 p-0" style={{ width: `${totalWidthMm}mm`, height: `${physicalHeight}mm`, position: 'absolute', top: 0, left: 0 }}>
      <style dangerouslySetInnerHTML={{__html: `
        .print-mode [data-hide-on-export] { display: none !important; }
        .print-mode [data-hide-border-on-export="true"] { border-style: none !important; }
        .print-mode .print\\:hidden { display: none !important; }
        .print-mode .outline-dashed { outline: none !important; }
        .print-mode .hover-effect { pointer-events: none !important; }
        html, body { 
          width: ${totalWidthMm}mm !important; 
          height: ${physicalHeight}mm !important; 
          margin: 0 !important; 
          padding: 0 !important; 
          background: white !important; 
          overflow: hidden !important; 
          position: absolute;
          top: 0;
          left: 0;
        }
        @page { margin: 0; size: ${totalWidthMm}mm ${physicalHeight}mm; }
      `}} />
      <div
        id="print-canvas"
        className="relative bg-white overflow-hidden m-0 p-0"
        style={{ boxSizing: "border-box", width: `${totalWidthMm}mm`, height: `${physicalHeight}mm`, padding: `${template.bleedMm}mm`, position: 'absolute', top: 0, left: 0 }}
      >
        <LayerStack forma={activeForma} />
        <div className="relative z-10 flex h-full w-full flex-row items-stretch bg-transparent m-0 p-0">
          {order.map((n) => <Page key={n} pageNumber={n} />)}
        </div>
      </div>
      <div id="print-canvas-ready" style={{ display: "none" }}></div>
    </div>
  );
}

export default function PrintView() {
  return (
    <Suspense fallback={<div className="p-4 bg-white">Yükleniyor...</div>}>
      <PrintViewContent />
    </Suspense>
  );
}
