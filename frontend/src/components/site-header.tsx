"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/i18n/provider";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { DoorIcon, KeyIcon, Logo, ShieldIcon, TicketIcon } from "./icons";

const links = [
  { href: "/rooms", key: "rooms" },
  { href: "/pricing", key: "pricing" },
  { href: "/leaderboard", key: "leaderboard" },
  { href: "/games", key: "games" },
  { href: "/about", key: "about" },
  { href: "/blog", key: "blog" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={cn("flex rounded-lg border border-border p-0.5 text-xs font-semibold", className)}>
      {(["mk", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-md px-2 py-1 uppercase transition",
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={lang === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function UserMenu() {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) {
    return (
      <Link href="/login" className={buttonVariants({ variant: "ghost", size: "lg" })}>
        <KeyIcon className="size-4" />
        {t.nav.login}
      </Link>
    );
  }
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex size-9 items-center justify-center rounded-full border border-primary/50 bg-primary/10 font-heading text-sm text-primary transition hover:bg-primary/20" />
        }
        aria-label={user.name}
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <TicketIcon /> {t.nav.profile}
        </DropdownMenuItem>
        {user.is_admin && (
          <DropdownMenuItem onClick={() => router.push("/admin")}>
            <ShieldIcon /> {t.nav.admin}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          <DoorIcon /> {t.nav.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const { t } = useLang();
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Press Esc">
          <Logo className="size-9" />
          <span className="font-heading text-xl tracking-wider">
            PRESS <span className="text-primary">ESC</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 xl:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition hover:text-primary",
                isActive(l.href) ? "text-primary" : "text-foreground/80"
              )}
            >
              {t.nav[l.key]}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LangSwitch className="hidden sm:flex" />
          <div className="hidden sm:block">
            <UserMenu />
          </div>
          <Link href="/booking" className={cn(buttonVariants({ size: "lg" }), "hidden px-4 md:inline-flex")}>
            {t.nav.book}
          </Link>

          {/* Мени за мобилен */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="xl:hidden" aria-label={t.nav.menu} />}>
              <MenuIcon className="size-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6">
              <SheetTitle className="flex items-center gap-2 font-heading text-lg">
                <Logo className="size-7" /> PRESS ESC
              </SheetTitle>
              <nav className="mt-4 flex flex-col gap-1">
                {[{ href: "/", key: "home" as const }, ...links].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-base transition hover:bg-muted",
                      (l.href === "/" ? pathname === "/" : isActive(l.href)) && "bg-muted text-primary"
                    )}
                  >
                    {t.nav[l.key]}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3">
                <LangSwitch className="self-start" />
                {user ? (
                  <Link href="/profile" onClick={() => setOpen(false)} className={buttonVariants({ variant: "outline", size: "xl" })}>
                    {t.nav.profile}
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)} className={buttonVariants({ variant: "outline", size: "xl" })}>
                    {t.nav.login}
                  </Link>
                )}
                <Link href="/booking" onClick={() => setOpen(false)} className={buttonVariants({ size: "xl" })}>
                  {t.nav.book}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
