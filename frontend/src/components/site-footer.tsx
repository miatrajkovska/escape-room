"use client";

import Link from "next/link";
import { useLang } from "@/i18n/provider";
import { Logo, MailIcon, MapPinIcon, PhoneIcon } from "./icons";

export function SiteFooter() {
  const { t } = useLang();
  const explore = [
    { href: "/rooms", label: t.nav.rooms },
    { href: "/booking", label: t.nav.book },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/leaderboard", label: t.nav.leaderboard },
    { href: "/games", label: t.nav.games },
  ];
  const info = [
    { href: "/about", label: t.nav.about },
    { href: "/blog", label: t.nav.blog },
    { href: "/faq", label: t.nav.faq },
    { href: "/contact", label: t.nav.contact },
    { href: "/privacy", label: t.footer.privacy },
  ];

  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="size-9" />
            <span className="font-heading text-xl tracking-wider">
              ENIGMA <span className="text-primary">ESCAPE</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">{t.footer.tagline}</p>
        </div>
        <FooterList title={t.footer.explore} links={explore} />
        <FooterList title={t.footer.info} links={info} />
        <div>
          <h3 className="mb-4 text-sm uppercase text-primary">{t.footer.visit}</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPinIcon className="size-4 shrink-0 text-primary" /> {t.contact.addressValue}
            </li>
            <li className="flex gap-2">
              <PhoneIcon className="size-4 shrink-0 text-primary" /> +389 70 123 456
            </li>
            <li className="flex gap-2">
              <MailIcon className="size-4 shrink-0 text-primary" /> info@enigma-escape.mk
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>
            © {new Date().getFullYear()} Enigma Escape. {t.footer.rights}
          </span>
          <span>{t.footer.student}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-sm uppercase text-primary">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-muted-foreground transition hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
