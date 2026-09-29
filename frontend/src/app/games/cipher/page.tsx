import type { Metadata } from "next";
import { Cipher } from "@/components/games/cipher";

export const metadata: Metadata = { title: "Шифра" };

export default function Page() {
  return <Cipher />;
}
