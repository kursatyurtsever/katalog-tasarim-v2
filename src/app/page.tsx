"use client";

import { Canvas } from "@/components/Canvas";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar"; // <-- TOPBAR'I İÇERİ ALDIK

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-200">
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar /> {/* <-- EKRANIN EN ÜSTÜNE YERLEŞTİRDİK */}
        <Canvas />
      </div>
      <Sidebar />
    </main>
  );
}