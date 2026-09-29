import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Oswald } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/cookie-banner";
import { LanguageProvider } from "@/i18n/provider";
import { AuthProvider } from "@/lib/auth";
import type { Lang } from "@/lib/types";
import "./globals.css";

// Фонтови со поддршка за кирилица
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "Enigma Escape – Escape room Скопје",
    template: "%s | Enigma Escape",
  },
  description: "Имате 60 минути. Излезете ако можете. Четири escape соби во Скопје.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Јазикот се чита од колаче (МК е стандарден)
  const cookieStore = await cookies();
  const lang: Lang = cookieStore.get("lang")?.value === "en" ? "en" : "mk";

  return (
    <html lang={lang} className={`${inter.variable} ${oswald.variable} dark h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <LanguageProvider initialLang={lang}>
          <AuthProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CookieBanner />
            <Toaster theme="dark" position="top-center" richColors />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
