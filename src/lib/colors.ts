/**
 * Bir HEX renk kodunun (örn: #ffffff) parlaklık (Luminance) değerini hesaplar.
 * 0 (Siyah) ile 1 (Beyaz) arasında bir değer döner.
 */
export function calculateLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // W3C formülü: (0.299*R + 0.587*G + 0.114*B) / 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Renge göre en uygun kontrast rengini (Siyah/Beyaz) döner.
 */
export function getContrastColor(hex: string): "#000000" | "#ffffff" {
  return calculateLuminance(hex) > 0.5 ? "#000000" : "#ffffff";
}