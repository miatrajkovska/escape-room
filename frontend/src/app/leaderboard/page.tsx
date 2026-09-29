import type { Metadata } from "next";
import { LeaderboardView } from "@/views/leaderboard-view";

export const metadata: Metadata = { title: "Рекорди" };

export default function Page() {
  return <LeaderboardView />;
}
