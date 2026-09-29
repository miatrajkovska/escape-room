"use client";

// Едноставни информативни страници: За нас, ЧПП, Приватност
import { BrainIcon, CheckCircleIcon, ScrollIcon, ShieldIcon, SparkleIcon } from "@/components/icons";
import { CtaLink, PageHeader, SectionTitle } from "@/components/shared";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLang } from "@/i18n/provider";

export function AboutView() {
  const { t } = useLang();
  const valueIcons = [ScrollIcon, BrainIcon, ShieldIcon];
  const colors = ["#d4a017", "#4caf7d", "#5b8def", "#c0392b"];

  return (
    <>
      <PageHeader title={t.about.title} subtitle={t.about.subtitle} />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionTitle title={t.about.storyTitle} className="mb-6" />
          {t.about.story.map((p) => (
            <p key={p} className="mb-4 text-lg leading-relaxed text-foreground/90">
              {p}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {t.about.facts.map(({ value, label }) => (
            <div key={value} className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center">
              <span className="text-gold-gradient font-heading text-4xl">{value}</span>
              <span className="mt-1 text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title={t.about.valuesTitle} />
          <div className="grid gap-6 md:grid-cols-3">
            {t.about.values.map((v, i) => {
              const Icon = valueIcons[i];
              return (
                <div key={v.title} className="rounded-2xl border border-border bg-card p-7">
                  <Icon className="size-10 text-primary" />
                  <h3 className="mt-4 text-xl uppercase">{v.title}</h3>
                  <p className="mt-2 text-muted-foreground">{v.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle title={t.about.teamTitle} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.about.team.map((m, i) => (
            <div key={m.name} className="card-hover rounded-2xl border border-border bg-card p-6 text-center">
              <Avatar name={m.name} color={colors[i]} />
              <h3 className="mt-4 text-lg">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// SVG аватар со иницијали (наместо фотографија)
function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <svg viewBox="0 0 120 120" className="mx-auto size-28" aria-hidden="true">
      <circle cx="60" cy="60" r="58" fill="#0f0f14" stroke={color} strokeWidth="2" />
      <circle cx="60" cy="60" r="50" fill={color} fillOpacity="0.12" />
      <circle cx="60" cy="48" r="18" fill={color} fillOpacity="0.35" />
      <path d="M26 98c4-18 18-26 34-26s30 8 34 26" fill={color} fillOpacity="0.35" />
      <text x="60" y="68" textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize="30" fill="#eaeaea">
        {initials}
      </text>
    </svg>
  );
}

export function FaqView() {
  const { t } = useLang();
  return (
    <>
      <PageHeader title={t.faq.title} subtitle={t.faq.subtitle} />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.5fr_1fr]">
        <Accordion className="rounded-2xl border border-border bg-card px-6">
          {t.faq.items.map((item, i) => (
            <AccordionItem key={item.q} value={i}>
              <AccordionTrigger className="py-5 text-base hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="pb-5 text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-xl uppercase">
              <ScrollIcon className="size-6 text-primary" /> {t.faq.rulesTitle}
            </h2>
            <ul className="mt-5 space-y-3">
              {t.faq.rules.map((r) => (
                <li key={r} className="flex gap-3 text-sm">
                  <CheckCircleIcon className="size-5 shrink-0 text-primary" /> {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="glow-gold rounded-2xl bg-card p-6 text-center">
            <SparkleIcon className="mx-auto size-8 text-primary" />
            <p className="mt-3 text-muted-foreground">{t.faq.subtitle}</p>
            <CtaLink href="/contact" className="mt-4">
              {t.nav.contact}
            </CtaLink>
          </div>
        </aside>
      </section>
    </>
  );
}

export function PrivacyView() {
  const { t } = useLang();
  return (
    <>
      <PageHeader title={t.privacy.title} subtitle={t.privacy.updated} />
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        {t.privacy.sections.map((s) => (
          <div key={s.h}>
            <h2 className="text-2xl uppercase text-primary">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-foreground/90">{s.p}</p>
          </div>
        ))}
      </section>
    </>
  );
}
