import type { Metadata } from "next";
import { Codebreaker } from "@/components/games/codebreaker";

export const metadata: Metadata = { title: "Codebreaker" };

export default function Page() {
  return <Codebreaker />;
}
