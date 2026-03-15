"use client";

import { Canvas } from "@/components/Canvas";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-200">
      <div className="flex-1 flex flex-col min-w-0">
        <Canvas />
      </div>
      <Sidebar />
    </main>
  );
}