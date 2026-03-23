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
        <div className="flex-1 flex flex-col min-w-0 relative">
          <ContextualBar /> {/* YENİ: Seçime göre değişen 2 cm'lik şerit */}
          <Canvas />
        </div>

        {/* Sağ Alan: Yan Panel (Artık TopBar'ın altında başlıyor) */}
        <Sidebar />
        
      </div>
    </main>
  );
}