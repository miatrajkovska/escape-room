import type { Metadata } from "next";
import { PricingView } from "@/views/pricing-view";

export const metadata: Metadata = { title: "Цени" };

export default function Page() {
  return <PricingView />;
}
