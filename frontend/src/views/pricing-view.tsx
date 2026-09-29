"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BriefcaseIcon, CakeIcon, CheckCircleIcon, GiftIcon } from "@/components/icons";
import { CtaLink, LoadingNote, PageHeader, SectionTitle } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fill, useLang } from "@/i18n/provider";
import { api, useApi } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Pricing } from "@/lib/types";

export function PricingView() {
  const { t, lang } = useLang();
  const pricing = useApi<Pricing>("/api/pricing");
  const icons = [CakeIcon, BriefcaseIcon, GiftIcon];

  return (
    <>
      <PageHeader title={t.pricing.title} subtitle={t.pricing.subtitle} />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Табела со цени */}
        <div className="rounded-2xl border border-border bg-card p-6">
          {!pricing.data ? (
            <LoadingNote />
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="py-3">{t.pricing.tablePlayers}</th>
                    <th className="py-3 text-right">{t.pricing.tablePerPerson}</th>
                    <th className="py-3 text-right">{t.pricing.tableTotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(pricing.data.table).map(([n, total]) => (
                    <tr key={n} className="border-b border-border/60 last:border-0">
                      <td className="py-4 font-heading text-2xl">{n}</td>
                      <td className="py-4 text-right text-muted-foreground">{formatPrice(Math.round(total / Number(n)), lang)}</td>
                      <td className="py-4 text-right font-heading text-2xl text-primary">{formatPrice(total, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-sm text-muted-foreground">
                {fill(t.pricing.weekendNote, { amount: formatPrice(pricing.data.weekend_surcharge, lang) })}
              </p>
            </>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl uppercase">{t.pricing.includedTitle}</h2>
          <ul className="mt-5 space-y-3">
            {t.pricing.included.map((item) => (
              <li key={item} className="flex gap-3">
                <CheckCircleIcon className="size-5 shrink-0 text-primary" /> {item}
              </li>
            ))}
          </ul>
          <CtaLink href="/booking" className="mt-8 w-full">
            {t.common.bookNow}
          </CtaLink>
        </div>
      </section>

      {/* Пакети */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SectionTitle title={t.pricing.packagesTitle} />
        <div className="grid gap-6 md:grid-cols-3">
          {t.pricing.packages.map((p, i) => {
            const Icon = icons[i];
            return (
              <div key={p.title} className="flex flex-col rounded-2xl border border-border bg-card p-7">
                <Icon className="size-12 text-primary" />
                <h3 className="mt-5 text-2xl uppercase">{p.title}</h3>
                <p className="font-heading text-xl text-primary">{p.price}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                  {p.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> {item}
                    </li>
                  ))}
                </ul>
                <CtaLink href={i === 2 ? "#voucher" : "/contact"} variant="outline" className="mt-6">
                  {i === 2 ? t.pricing.voucherTitle : t.pricing.ask}
                </CtaLink>
              </div>
            );
          })}
        </div>
      </section>

      <VoucherForm />
    </>
  );
}

// Нарачка на ваучер – се праќа како контакт порака
function VoucherForm() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", recipient: "", amount: "" });
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await api("/api/contact", {
        method: "POST",
        body: {
          name: form.name,
          email: form.email,
          subject: "Ваучер / Voucher",
          message: `${t.pricing.voucherFor} ${form.recipient}\n${t.pricing.voucherAmount}: ${form.amount}`,
        },
      });
      toast.success(t.pricing.voucherSent);
      setForm({ name: "", email: "", recipient: "", amount: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSending(false);
    }
  }

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div>
      <Label htmlFor={key} className="mb-2 block">
        {label}
      </Label>
      <Input id={key} type={type} required value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-10" />
    </div>
  );

  return (
    <section id="voucher" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6">
      <div className="glow-gold grid gap-8 rounded-3xl bg-card p-7 sm:p-10 lg:grid-cols-2">
        <div>
          <GiftIcon className="size-14 text-primary" />
          <h2 className="mt-4 text-3xl uppercase">{t.pricing.voucherTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.pricing.voucherText}</p>
        </div>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {field("name", t.common.name)}
          {field("email", t.common.email, "email")}
          {field("recipient", t.pricing.voucherFor)}
          {field("amount", t.pricing.voucherAmount)}
          <Button type="submit" size="xl" disabled={sending} className="sm:col-span-2">
            {t.common.send}
          </Button>
        </form>
      </div>
    </section>
  );
}
