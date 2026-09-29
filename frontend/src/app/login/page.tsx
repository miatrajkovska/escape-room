import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginView } from "@/views/auth-views";

export const metadata: Metadata = { title: "Најава" };

export default function Page() {
  // useSearchParams (?next=) бара Suspense
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  );
}
