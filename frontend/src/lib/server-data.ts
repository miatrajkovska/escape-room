// Податоци што ги зема Next.js серверот (не прелистувачот) и ги кешира на Vercel.
// Така страницата веднаш доаѓа со собите, без да се чека бавниот/заспан backend.
import { connection } from "next/server";
import { API_URL } from "./api-url";
import type { Room } from "./types";

export const ROOMS_TAG = "rooms";

export async function getRooms(): Promise<Room[] | null> {
  // Собите се земаат само при вистинско барање, никогаш при build
  // (при docker build backend-от не работи). Кешот подолу (revalidate) останува.
  await connection();
  try {
    const res = await fetch(`${API_URL}/api/rooms`, {
      // Кеш 5 минути; потоа се прикажува старата верзија додека новата се вчитува во позадина
      next: { revalidate: 300, tags: [ROOMS_TAG] },
      // Ако backend-от спие подолго, не чекаме – прелистувачот ќе ги побара сам
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Room[];
  } catch {
    return null;
  }
}
