"use client";

import { LockIcon } from "@/components/icons";
import { CtaLink } from "@/components/shared";
import { useLang } from "@/i18n/provider";

export function NotFoundView() {
  const { t } = useLang();
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-20 text-center">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative">
        <LockIcon className="animate-swing mx-auto size-24 text-primary" />
        <p className="text-gold-gradient mt-6 font-heading text-8xl">404</p>
        <h1 className="mt-2 text-3xl uppercase sm:text-4xl">{t.notFound.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t.notFound.text}</p>
        <CtaLink href="/" className="mt-8">
          {t.notFound.home}
        </CtaLink>
      </div>
    </section>
  );
}
