"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useCatalogStore } from "@/store/useCatalogStore";
import { Page } from "@/components/Canvas/Page";
import { LayerStack } from "@/components/Canvas/LayerStack";

import { Suspense } from "react";

function PrintViewContent() {
  const searchParams = useSearchParams();
  const formaId = searchParams.get("formaId");
  
  const formas = useCatalogStore((state) => state.formas);
  const template = useCatalogStore((state) => state.activeTemplate);
  const setActiveFormaId = useCatalogStore((state) => state.setActiveFormaId);
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (formaId) {
      setActiveFormaId(Number(formaId));
      // Wait a little bit for state to propagate and DOM to update
      setTimeout(() => setIsReady(true), 500);
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
    return <div className="p-4">Yükleniyor...</div>;
  }

  const physicalHeight = template.openHeightMm + template.bleedMm * 2;
  const order = activeForma.pages.map((p) => p.pageNumber);

  return (
    <div className="print-mode bg-white w-screen h-screen overflow-hidden flex items-start justify-start">
      <style dangerouslySetInnerHTML={{__html: `
        /* Print mode styles to hide UI elements */
        .print-mode [data-hide-on-export] { display: none !important; }
        .print-mode .print\\:hidden { display: none !important; }
        .print-mode .outline-dashed { outline: none !important; }
        .print-mode .hover-effect { pointer-events: none !important; }
        body { margin: 0; padding: 0; background: white; }
        @page { margin: 0; size: ${totalWidthMm}mm ${physicalHeight}mm; }
      `}} />
      
      <div
        id="print-canvas"
        className="relative bg-white"
        style={{
          boxSizing: "border-box",
          width: `${totalWidthMm}mm`,
          height: `${physicalHeight}mm`,
          padding: `${template.bleedMm}mm`,
          backgroundColor: "#ffffff",
        }}
      >
        <LayerStack forma={activeForma} />

        <div className="relative z-10 flex h-full w-full flex-row items-stretch bg-transparent">
          {order.map((n) => (
            <Page key={n} pageNumber={n} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PrintView() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <PrintViewContent />
    </Suspense>
  );
}
