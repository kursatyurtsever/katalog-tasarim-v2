import { BannerSection } from "@/components/BannerSection";
import { BannerSettingsPanel } from "@/components/sidebar-panels/BannerSettingsPanel";
import { PizzaSection } from "@/components/PizzaSection";
import { PizzaSettingsPanel } from "@/components/sidebar-panels/PizzaSettingsPanel";
import { Megaphone, Pizza, Icon } from "@phosphor-icons/react";

export interface ModuleConfig {
  id: string;
  label: string;
  icon: Icon;
  colorClass: string;
  borderHoverClass: string;
  bgColorClass: string;
  borderColorClass: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canvasComponent: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sidebarComponent: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: () => any;
}

export const ModuleRegistry: Record<string, ModuleConfig> = {
  banner: {
    id: "banner",
    label: "Banner (Izgara)",
    icon: Megaphone,
    colorClass: "text-purple-600",
    borderHoverClass: "hover:border-purple-500",
    bgColorClass: "bg-purple-50",
    borderColorClass: "border-purple-200",
    canvasComponent: BannerSection,
    sidebarComponent: BannerSettingsPanel,
    initialData: () => ({
      type: 'banner',
      cells: Array.from({ length: 32 }, (_, i) => ({
        id: `banner-inst-${i}`,
        text: "",
        colSpan: 1,
        rowSpan: 1,
        hidden: false,
        mergedInto: null,
        font: { fontFamily: "Inter", fontWeight: "700", fontSize: 14, lineHeight: 1.2, letterSpacing: 0, textAlign: "center", verticalAlign: "middle", textTransform: "none", textDecoration: "none", color: "#1e293b", opacity: 100, decimalScale: 100 },
        padding: { t: 0, r: 0, b: 0, l: 0, linked: true },
        bgColor: { c: "#ffffff", o: 0 },
        border: { t: 0, r: 0, b: 0, l: 0, linked: true, color: { c: "#e2e8f0", o: 100 }, style: "solid" },
        image: null
      }))
    })
  },
  pizza: {
    id: "pizza",
    label: "Pizza Menüsü",
    icon: Pizza,
    colorClass: "text-orange-500",
    borderHoverClass: "hover:border-orange-500",
    bgColorClass: "bg-orange-50",
    borderColorClass: "border-orange-200",
    canvasComponent: PizzaSection,
    sidebarComponent: PizzaSettingsPanel,
    initialData: () => ({
      type: 'pizza',
      title: "PIZZA-MENÜ",
      prices: Array(19).fill(""),
      colors: {
        bg: { c: "#ffffff", o: 100 },
        border: { c: "#1e293b", o: 100 },
        tableBg: { c: "#ffffff", o: 100 },
        tableTitleBg: { c: "#1e293b", o: 100 },
        cellBg: { c: "#f1f5f9", o: 100 },
        cellPriceBg: { c: "#ffffff", o: 100 },
        tableLine: { c: "#cbd5e1", o: 100 },
        imgBg: { c: "#f8fafc", o: 100 },
        imgBorder: { c: "#94a3b8", o: 100 },
      },
      fonts: {
        title: { fontFamily: "Inter", fontWeight: "900", fontSize: 18, lineHeight: 1.2, letterSpacing: 0, textAlign: "center", textTransform: "uppercase", textDecoration: "none", color: "#0f172a", opacity: 100, verticalAlign: "middle", decimalScale: 100 },
        tableTitle: { fontFamily: "Inter", fontWeight: "700", fontSize: 11, lineHeight: 1.2, letterSpacing: 0, textAlign: "center", textTransform: "uppercase", textDecoration: "none", color: "#ffffff", opacity: 100, verticalAlign: "middle", decimalScale: 100 },
        sizes: { fontFamily: "Inter", fontWeight: "700", fontSize: 10, lineHeight: 1.2, letterSpacing: 0, textAlign: "center", textTransform: "none", textDecoration: "none", color: "#000000", opacity: 100, verticalAlign: "middle", decimalScale: 100 },
        prices: { fontFamily: "Inter", fontWeight: "900", fontSize: 12, lineHeight: 1.2, letterSpacing: 0, textAlign: "center", textTransform: "none", textDecoration: "none", color: "#dc2626", opacity: 100, verticalAlign: "middle", decimalScale: 100 },
      },
      radiuses: {
        container: { tl: 8, tr: 8, bl: 8, br: 8, linked: true },
        table: { tl: 4, tr: 4, bl: 4, br: 4, linked: true },
        image: { tl: 4, tr: 4, bl: 4, br: 4, linked: true },
      },
      spacings: {
        container: { t: 16, r: 16, b: 16, l: 16, linked: true },
        tableTitle: { t: 6, r: 8, b: 6, l: 8, linked: false },
        cell: { t: 0, r: 0, b: 0, l: 0, linked: true },
      },
      shadows: {
        container: { x: 0, y: 4, blur: 10, spread: -1, color: "#000000", opacity: 5, active: true },
        table: { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, active: false },
        image: { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, active: false },
        cell: { x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, active: false },
      },
      tableLineWidth: 2
    })
  }
};