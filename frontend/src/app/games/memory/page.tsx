import type { Metadata } from "next";
import { Memory } from "@/components/games/memory";

export const metadata: Metadata = { title: "Меморија" };

export default function Page() {
  return <Memory />;
}
