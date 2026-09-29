import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingView } from "@/views/booking-view";

export const metadata: Metadata = { title: "Резервација" };

export default function BookingPage() {
  // useSearchParams (?room=) бара Suspense
  return (
    <Suspense>
      <BookingView />
    </Suspense>
  );
}
