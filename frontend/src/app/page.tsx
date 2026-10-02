import { getRooms } from "@/lib/server-data";
import { HomeView } from "@/views/home-view";

export default async function HomePage() {
  // Собите ги зема серверот (кеширани), за да се прикажат веднаш
  return <HomeView initialRooms={await getRooms()} />;
}
