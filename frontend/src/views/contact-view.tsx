"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HourglassIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/i18n/provider";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function ContactView() {
  const { t } = useLang();
  const { user } = useAuth();
  const empty = { name: user?.name ?? "", email: user?.email ?? "", subject: "", message: "" };
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await api("/api/contact", { method: "POST", body: form });
      toast.success(t.contact.sent);
      setForm({ ...empty, subject: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSending(false);
    }
  }

  const info = [
    { icon: MapPinIcon, label: t.contact.address, lines: [t.contact.addressValue] },
    { icon: PhoneIcon, label: t.contact.phone, lines: ["+389 70 123 456"] },
    { icon: MailIcon, label: t.contact.email, lines: ["info@enigma-escape.mk"] },
    { icon: HourglassIcon, label: t.contact.hours, lines: t.contact.hoursValue },
  ];

  return (
    <>
      <PageHeader title={t.contact.title} subtitle={t.contact.subtitle} />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-2xl uppercase">{t.contact.formTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-name" className="mb-2 block">{t.common.name}</Label>
              <Input id="c-name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" />
            </div>
            <div>
              <Label htmlFor="c-email" className="mb-2 block">{t.common.email}</Label>
              <Input id="c-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10" />
            </div>
          </div>
          <div>
            <Label htmlFor="c-subject" className="mb-2 block">{t.common.subject}</Label>
            <Input id="c-subject" required minLength={2} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="h-10" />
          </div>
          <div>
            <Label htmlFor="c-message" className="mb-2 block">{t.common.message}</Label>
            <Textarea id="c-message" required minLength={5} rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button type="submit" size="xl" disabled={sending} className="w-full sm:w-auto">
            <MailIcon /> {t.common.send}
          </Button>
        </form>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {info.map(({ icon: Icon, label, lines }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-5">
                <Icon className="size-7 text-primary" />
                <h3 className="mt-3 text-sm uppercase text-muted-foreground">{label}</h3>
                {lines.map((l) => (
                  <p key={l} className="mt-1 text-sm">{l}</p>
                ))}
              </div>
            ))}
          </div>
          {/* Мапа од OpenStreetMap (центар на Скопје) */}
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Map"
              className="h-72 w-full grayscale invert-[0.9] hue-rotate-180"
              src="https://www.openstreetmap.org/export/embed.html?bbox=21.4200%2C41.9900%2C21.4450%2C42.0020&layer=mapnik&marker=41.9962%2C21.4318"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
