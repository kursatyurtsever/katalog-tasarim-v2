"use client";

import { Canvas } from "@/components/Canvas";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar"; 
import { ContextualBar } from "@/components/ContextualBar"; // Yeni dinamik şeridimiz

export default function Home() {
  return (
    // 1. Ana taşıyıcıyı flex-col (yukarıdan aşağı) yaptık
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-slate-200">
      
      {/* 2. TopBar artık ekranın en üstünde, soldan sağa %100 uzanıyor */}
      <TopBar /> 
      
      {/* 3. Alt Kısım: Dinamik Bar + Broşür + Yan Panel */}
      <div className="flex-1 flex flex-row min-h-0">
        
        {/* Sol ve Orta Alan (Broşür Kısmı) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative items-center">
          <div className="inline-flex justify-center bg-(--bg-panel) shadow-md rounded-b-lg border-b border-x border-(--border-color) overflow-hidden shrink-0 z-50 mb-2">
            <ContextualBar /> {/* YENİ: Seçime göre değişen 2 cm'lik şerit */}
          </div>
          <div className="flex-1 w-full relative min-h-0">
            <Canvas />
          </div>
        </div>

        {/* Sağ Alan: Yan Panel (Artık TopBar'ın altında başlıyor) */}
        <div className="pt-4 pr-4 pb-4 h-full shrink-0 flex relative z-1000">
          <div className="rounded-xl shadow-xl h-full flex flex-col relative z-1000">
            <Sidebar />
          </div>
        </div>
        
      </div>
    </main>
  );
}