"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/provider";
import { CookieIcon } from "./icons";

const KEY = "enigma_cookies";

const noop = () => () => {};

function readChoice(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function CookieBanner() {
  const { t } = useLang();
  const [dismissed, setDismissed] = useState(false);
  // Зачуваниот избор од localStorage (на серверот секогаш "server" за да нема банер при прво цртање)
  const stored = useSyncExternalStore(noop, readChoice, () => "server");

  function choose(value: "all" | "essential") {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    setDismissed(true);
  }

  if (stored !== null || dismissed) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border border-primary/30 bg-card/95 p-4 shadow-2xl backdrop-blur animate-in slide-in-from-bottom-4 sm:inset-x-6 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <CookieIcon className="hidden size-10 shrink-0 text-primary sm:block" />
        <p className="flex-1 text-sm text-muted-foreground">
          {t.cookies.text}{" "}
          <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
            {t.cookies.more}
          </Link>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={() => choose("essential")}>
            {t.cookies.decline}
          </Button>
          <Button size="lg" onClick={() => choose("all")}>
            {t.cookies.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
