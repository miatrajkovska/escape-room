import type { Metadata } from "next";
import { getRooms } from "@/lib/server-data";
import { LeaderboardView } from "@/views/leaderboard-view";

export const metadata: Metadata = { title: "Рекорди" };

export default async function Page() {
  return <LeaderboardView initialRooms={await getRooms()} />;
}
