"use server";
// Server Actions – функции што се извршуваат на Next.js серверот, а се повикуваат од прелистувачот
import { updateTag } from "next/cache";
import { ROOMS_TAG } from "@/lib/server-data";

// Админот сменил соба или рекорд: исчисти го кешот за собите веднаш
export async function refreshRooms() {
  updateTag(ROOMS_TAG);
}
