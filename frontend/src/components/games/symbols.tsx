// Симболи (SVG икони во боја) што се користат во игрите
import {
  EyeIcon,
  FlaskIcon,
  HourglassIcon,
  KeyIcon,
  MagnifierIcon,
  MoonIcon,
  PyramidIcon,
  SkullIcon,
  StarIcon,
} from "@/components/icons";

export const SYMBOLS = [
  { id: "key", Icon: KeyIcon, color: "#d4a017" },
  { id: "skull", Icon: SkullIcon, color: "#e6e6e6" },
  { id: "eye", Icon: EyeIcon, color: "#5bc0eb" },
  { id: "star", Icon: StarIcon, color: "#ff8a3d" },
  { id: "moon", Icon: MoonIcon, color: "#a98bff" },
  { id: "flask", Icon: FlaskIcon, color: "#4caf7d" },
  { id: "pyramid", Icon: PyramidIcon, color: "#e0b25c" },
  { id: "magnifier", Icon: MagnifierIcon, color: "#ef6f6c" },
  { id: "hourglass", Icon: HourglassIcon, color: "#7fd1c7" },
] as const;

export type SymbolId = (typeof SYMBOLS)[number]["id"];

export function GameSymbol({ id, className }: { id: SymbolId; className?: string }) {
  const s = SYMBOLS.find((x) => x.id === id)!;
  return <s.Icon className={className} style={{ color: s.color }} />;
}

// Мешање на низа (Fisher–Yates)
export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
