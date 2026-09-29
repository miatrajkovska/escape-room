import type { Metadata } from "next";
import { GamesView } from "@/views/games-view";

export const metadata: Metadata = { title: "Онлајн игри" };

export default function Page() {
  return <GamesView />;
}
