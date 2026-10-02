import type { Metadata } from "next";
import { Lights } from "@/components/games/lights";

export const metadata: Metadata = { title: "Електрична табла" };

export default function Page() {
  return <Lights />;
}
