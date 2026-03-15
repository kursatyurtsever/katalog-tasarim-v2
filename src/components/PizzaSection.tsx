"use client";

import { useState, useRef } from "react";
import { useCatalogStore } from "@/store/useCatalogStore";

/** Tek bir pizza fiyat hücresi: arka planda formatlı gösterim, üstte input */
function PizzaPriceCell({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  const [int, frac] = value.includes(",")
    ? value.split(",")
    : value.includes(".")
    ? value.split(".")
    : [value, ""];

  return (
    <div className="relative flex h-10 cursor-text items-center justify-center bg-[#e3000f]">
      <div className="formatted-pizza-price pointer-events-none flex items-start text-white">
        <span className="int text-[26px] font-black leading-none tracking-tight mt-0.5">
          {int || "0"}
        </span>
        {frac && (
          <>
            <span className="int">,</span>
            <span className="frac ml-0.5 mt-1 text-[15px] font-extrabold">
              {frac}
            </span>
          </>
        )}
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pizza-input absolute inset-0 h-full w-full cursor-text border-0 bg-transparent text-center text-transparent caret-white outline-none"
      />
    </div>
  );
}

const LEFT_LABELS_ROW1 = ["20x20", "22x22", "24x24", "26x26"];
const LEFT_LABELS_ROW2 = ["28x28", "29x29", "30x30", "32x32"];
const RIGHT_LABELS = [
  { title: "Rollo", sub: "(200 Stk.)" },
  { title: "Calzone", sub: "(100 Stk.)" },
  { title: "Familie 40x60", sub: "(50 Stk.)" },
];

/**
 * Sayfa 6: PIZZAKARTONS KRAFT !!! başlığı, fiyat tabloları (19 input), pizza resim alanı.
 */
export function PizzaSection() {
  const pizza = useCatalogStore((state) => state.pizza);
  const setPizza = useCatalogStore((state) => state.setPizza);
  const setPizzaPrice = useCatalogStore((state) => state.setPizzaPrice);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prices = pizza.prices.length >= 19 ? pizza.prices : [
    ...pizza.prices,
    ...Array(19 - pizza.prices.length).fill(""),
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex h-[calc(50%-4px)] shrink-0 flex-col gap-2 border border-slate-400 bg-[#f8f9fa] p-4 box-border">
        <input
          type="text"
          value={pizza.title}
          onChange={(e) => setPizza({ title: e.target.value })}
          className="w-full shrink-0 border-0 bg-transparent text-center font-black leading-none tracking-tight text-black outline-none mb-6"
          style={{ fontFamily: "'Arial Black', Impact, sans-serif", fontSize: "38px" }}
        />

        <div className="flex min-h-0 w-full flex-grow gap-8">
          {/* Sol: New York Kraft Braun + Weiss */}
          <div className="flex w-1/2 flex-col justify-between min-h-0">
            <div className="flex flex-col">
              <div className="mb-1 flex h-[18px] items-end font-bold leading-none text-[#1a365d] text-[15px]">
                New York Kraft Braun 100 Stk.
              </div>
              <div className="grid grid-cols-4 gap-[2px]">
                {LEFT_LABELS_ROW1.map((l) => (
                  <div
                    key={l}
                    className="flex h-8 items-center justify-center bg-[#e2e4e9] text-center font-bold text-[12px] text-[#4b5563]"
                  >
                    {l}
                  </div>
                ))}
                {[0, 1, 2, 3].map((i) => (
                  <PizzaPriceCell
                    key={i}
                    id={`piz-${i + 1}`}
                    value={prices[i] ?? ""}
                    onChange={(v) => setPizzaPrice(i, v)}
                  />
                ))}
              </div>
              <div className="h-3 w-full" />
              <div className="grid grid-cols-4 gap-[2px]">
                {LEFT_LABELS_ROW2.map((l) => (
                  <div
                    key={l}
                    className="flex h-8 items-center justify-center bg-[#e2e4e9] text-center font-bold text-[12px] text-[#4b5563]"
                  >
                    {l}
                  </div>
                ))}
                {[4, 5, 6, 7].map((i) => (
                  <PizzaPriceCell
                    key={i}
                    id={`piz-${i + 1}`}
                    value={prices[i] ?? ""}
                    onChange={(v) => setPizzaPrice(i, v)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-2 flex flex-col">
              <div className="mb-1 flex h-[18px] items-end font-bold leading-none text-[#1a365d] text-[15px]">
                New York Kraft Weiss 100 Stk.
              </div>
              <div className="grid grid-cols-4 gap-[2px]">
                {LEFT_LABELS_ROW1.map((l) => (
                  <div
                    key={`w-${l}`}
                    className="flex h-8 items-center justify-center bg-[#e2e4e9] text-center font-bold text-[12px] text-[#4b5563]"
                  >
                    {l}
                  </div>
                ))}
                {[8, 9, 10, 11].map((i) => (
                  <PizzaPriceCell
                    key={i}
                    id={`piz-${i + 1}`}
                    value={prices[i] ?? ""}
                    onChange={(v) => setPizzaPrice(i, v)}
                  />
                ))}
              </div>
              <div className="h-3 w-full" />
              <div className="grid grid-cols-4 gap-[2px]">
                {LEFT_LABELS_ROW2.map((l) => (
                  <div
                    key={`w2-${l}`}
                    className="flex h-8 items-center justify-center bg-[#e2e4e9] text-center font-bold text-[12px] text-[#4b5563]"
                  >
                    {l}
                  </div>
                ))}
                {[12, 13, 14, 15].map((i) => (
                  <PizzaPriceCell
                    key={i}
                    id={`piz-${i + 1}`}
                    value={prices[i] ?? ""}
                    onChange={(v) => setPizzaPrice(i, v)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sağ: Rollo / Calzone / Familie + pizza resim alanı */}
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="h-[22px] w-full shrink-0" />
            <div className="grid grid-cols-3 gap-[2px] shrink-0">
              {RIGHT_LABELS.map(({ title, sub }) => (
                <div
                  key={title}
                  className="flex h-8 flex-col items-center justify-center bg-[#e2e4e9] px-1 text-center font-bold leading-tight text-[11px] text-[#4b5563]"
                >
                  <span>{title}</span>
                  <span className="mt-[-2px] font-normal text-[9px]">{sub}</span>
                </div>
              ))}
              {[16, 17, 18].map((i) => (
                <PizzaPriceCell
                  key={i}
                  id={`piz-${i + 1}`}
                  value={prices[i] ?? ""}
                  onChange={(v) => setPizzaPrice(i, v)}
                />
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPizza({ customImageUrl: String(reader.result) });
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />
            <div
              id="pizza-custom-image-zone"
              role="button"
              tabIndex={0}
              onClick={() => (!pizza.customImageUrl ? fileInputRef.current?.click() : null)}
              onKeyDown={(e) => e.key === "Enter" && !pizza.customImageUrl && fileInputRef.current?.click()}
              className="group relative mt-4 flex min-h-0 flex-grow cursor-pointer items-center justify-center overflow-hidden bg-[#e9eaef] rounded-bl-3xl rounded-tr-3xl"
            >
              {pizza.customImageUrl ? (
                <>
                  <img
                    src={pizza.customImageUrl}
                    alt=""
                    className="pointer-events-none relative z-10 h-full w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                    className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md hover:bg-red-600"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <span className="pointer-events-none relative z-10 text-xl font-bold tracking-wide text-[#a0aab8] group-hover:text-slate-600">
                  Resim Seç
                </span>
              )}

              {showDeleteConfirm && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/95 text-white">
                  <span className="mb-3 text-sm font-semibold">Silinsin mi?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPizza({ customImageUrl: null });
                        setShowDeleteConfirm(false);
                      }}
                      className="rounded bg-red-500 px-4 py-1.5 text-xs text-white hover:bg-red-600"
                    >
                      Sil
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded bg-slate-500 px-4 py-1.5 text-xs text-white hover:bg-slate-600"
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
