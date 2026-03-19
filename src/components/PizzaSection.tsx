"use client";

import { useCatalogStore, PizzaItem } from "@/store/useCatalogStore";

export function PizzaSection() {
  const { pizzaItems, updatePizzaItem } = useCatalogStore();
  const braunItems = pizzaItems.filter(i => i.category === "Braun");
  const weissItems = pizzaItems.filter(i => i.category === "Weiss");
  const otherItems = pizzaItems.filter(i => i.category === "Diger");

  const RenderRow = ({ item }: { item: PizzaItem }) => (
    <div className="flex items-center justify-between border-b border-slate-100 py-0.5 group">
      <div contentEditable suppressContentEditableWarning onBlur={(e) => updatePizzaItem(item.id, { size: e.currentTarget.textContent || "" })} className="text-[10px] font-bold text-slate-600 outline-none focus:bg-blue-50 px-1 rounded truncate flex-1">{item.size}</div>
      <div className="flex items-center gap-0.5 bg-red-600 text-white px-1.5 py-0.5 rounded shadow-sm scale-90">
        <div contentEditable suppressContentEditableWarning onBlur={(e) => updatePizzaItem(item.id, { price: e.currentTarget.textContent || "0,00" })} className="text-xs font-black outline-none">{item.price}</div>
        <span className="text-[8px] font-bold">€</span>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-white border-[2px] border-slate-400 rounded-xl flex flex-col p-3 shadow-md overflow-hidden">
      <div className="flex justify-between items-center mb-2 border-b-2 border-slate-800 pb-1">
        <h2 className="text-xl font-black text-slate-900 italic uppercase">Pizzakartons KRAFT !!!</h2>
        <div className="w-12 h-6 bg-slate-100 border border-dashed border-slate-300 rounded flex items-center justify-center text-[6px] font-bold text-slate-400">LOGO</div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 overflow-hidden">
        <div className="flex flex-col">
          <h3 className="text-[9px] font-black bg-slate-800 text-white px-2 py-0.5 rounded mb-1 text-center">New York Kraft Braun</h3>
          {braunItems.map(item => <RenderRow key={item.id} item={item} />)}
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-[9px] font-black bg-slate-300 text-slate-800 px-2 py-0.5 rounded mb-1 text-center">New York Kraft Weiss</h3>
            {weissItems.map(item => <RenderRow key={item.id} item={item} />)}
          </div>
          <div>
            <h3 className="text-[9px] font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded mb-1 text-center">Andere Produkte</h3>
            {otherItems.map(item => <RenderRow key={item.id} item={item} />)}
          </div>
        </div>
      </div>
      <div className="mt-1 flex justify-between items-center text-[7px] text-slate-400 font-bold border-t border-slate-100 pt-1 uppercase">
        <span>* 100 STK. PRO PAKET</span>
        <span className="italic">Matbaai Online Designer</span>
      </div>
    </div>
  );
}