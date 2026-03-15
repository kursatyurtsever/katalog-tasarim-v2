"use client";

import { useCatalogStore } from "@/store/useCatalogStore";

/**
 * Eski HTML'deki #top-bar: Dış Sayfalar / İç Sayfalar sekmeleri ve Zoom butonu.
 */
export function TopBar() {
  const activeTab = useCatalogStore((state) => state.activeTab);
  const isZoomed = useCatalogStore((state) => state.isZoomed);
  const setActiveTab = useCatalogStore((state) => state.setActiveTab);
  const toggleZoom = useCatalogStore((state) => state.toggleZoom);
  const template = useCatalogStore((state) => state.activeTemplate);
  const half = Math.ceil(template.pages.length / 2);
  const hasInner = template.pages.length > half;

  return (
    <div
      id="top-bar"
      className="flex w-full shrink-0 items-center justify-between border-b border-slate-700 bg-slate-900 px-4 pt-4"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("outer")}
          className={`rounded-t-lg px-6 py-2 font-semibold transition-colors ${
            activeTab === "outer"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-300 text-slate-700 hover:bg-slate-400"
          }`}
        >
          Dış Sayfalar
        </button>
        {hasInner && (
          <button
            type="button"
            onClick={() => setActiveTab("inner")}
            className={`rounded-t-lg px-6 py-2 font-semibold transition-colors ${
              activeTab === "inner"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-300 text-slate-700 hover:bg-slate-400"
            }`}
          >
            İç Sayfalar
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={toggleZoom}
        className="zoom-btn mb-2 flex items-center gap-2 rounded border border-slate-600 bg-slate-700 px-4 py-1.5 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
        <span id="zoom-text">{isZoomed ? "Orijinal Boyut" : "Ekrana Sığdır"}</span>
      </button>
    </div>
  );
}
