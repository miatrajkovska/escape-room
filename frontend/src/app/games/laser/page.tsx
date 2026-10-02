import type { Metadata } from "next";
import { Laser } from "@/components/games/laser";

export const metadata: Metadata = { title: "Ласерски лавиринт" };

export default function Page() {
  return <Laser />;
}
