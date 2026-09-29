"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { enGB, mk as mkLocale } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircleIcon, themeIcon } from "@/components/icons";
import { Difficulty, ErrorState, LoadingNote, PageHeader } from "@/components/shared";
import { useLang } from "@/i18n/provider";
import { ApiError, api, useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatPrice, pick, toIsoDate } from "@/lib/format";
import type { Booking, CalendarDay, Pricing, Room, Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BookingView() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const rooms = useApi<Room[]>("/api/rooms");
  const pricing = useApi<Pricing>("/api/pricing");

  const [roomSlug, setRoomSlug] = useState<string | null>(params.get("room"));
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [players, setPlayers] = useState<number | null>(null);
  const [nameInput, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const room = rooms.data?.find((r) => r.slug === roomSlug) ?? null;
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const windowDays = pricing.data?.booking_window_days ?? 60;
  const lastDay = new Date(today.getTime() + windowDays * 86400000);

  // Календар (слободни термини по ден) и термини за избраниот ден
  const calendar = useApi<CalendarDay[]>(roomSlug ? `/api/rooms/${roomSlug}/calendar?start=${toIsoDate(today)}&days=${windowDays + 1}` : null);
  const slots = useApi<{ slots: Slot[] }>(roomSlug && date ? `/api/rooms/${roomSlug}/availability?date=${toIsoDate(date)}` : null);

  // Името од профилот е почетна вредност додека корисникот не го смени
  const name = nameInput ?? user?.name ?? "";

  // При промена на соба: исчисти термин и број на играчи ако не одговара
  function chooseRoom(r: Room) {
    setRoomSlug(r.slug);
    setTime(null);
    if (players && (players < r.min_players || players > r.max_players)) setPlayers(null);
  }

  const fullDays = (calendar.data ?? []).filter((d) => d.free === 0).map((d) => new Date(d.date + "T00:00:00"));
  const fewDays = (calendar.data ?? []).filter((d) => d.free > 0 && d.free <= 3).map((d) => new Date(d.date + "T00:00:00"));
  const freeDays = (calendar.data ?? []).filter((d) => d.free > 3).map((d) => new Date(d.date + "T00:00:00"));

  const isWeekend = date ? date.getDay() === 0 || date.getDay() === 6 : false;
  const basePrice = players && pricing.data ? pricing.data.table[String(players)] : null;
  const total = basePrice !== null ? basePrice + (isWeekend ? pricing.data!.weekend_surcharge : 0) : null;

  const canSubmit = room && date && time && players && name.trim().length >= 2 && phone.trim().length >= 6;

  async function submit() {
    if (!canSubmit) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/booking?room=${roomSlug}`)}`);
      return;
    }
    setSubmitting(true);
    try {
      const booking = await api<Booking>("/api/bookings", {
        method: "POST",
        body: { room_slug: roomSlug, date: toIsoDate(date), time, players, customer_name: name, phone, notes },
      });
      setConfirmed(booking);
      slots.reload();
      calendar.reload();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        toast.error(t.booking.slotTaken);
        setTime(null);
        slots.reload();
        calendar.reload();
      } else {
        toast.error(e instanceof Error ? e.message : t.common.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setConfirmed(null);
    setDate(undefined);
    setTime(null);
    setNotes("");
  }

  return (
    <>
      <PageHeader title={t.booking.title} subtitle={t.booking.subtitle} />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* 1. Соба */}
          <Step n={1} title={t.booking.step1}>
            {rooms.error && <ErrorState onRetry={rooms.reload} />}
            {!rooms.data && !rooms.error && <LoadingNote />}
            <div className="grid gap-3 sm:grid-cols-2">
              {rooms.data?.map((r) => {
                const Icon = themeIcon[r.theme];
                return (
                  <button
                    key={r.slug}
                    onClick={() => chooseRoom(r)}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border p-4 text-left transition",
                      roomSlug === r.slug ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"
                    )}
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-heading text-lg uppercase">{pick(r, "name", lang)}</span>
                      <span className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Difficulty level={r.difficulty} showLabel={false} />
                        {r.min_players}–{r.max_players} {t.common.players} · {r.duration_min} {t.common.minutes}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Step>

          {/* 2. Датум и 3. Термин */}
          <div className={cn("grid gap-8 md:grid-cols-2", !room && "pointer-events-none opacity-40")}>
            <Step n={2} title={t.booking.step2}>
              <div className="rounded-xl border border-border bg-background p-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setTime(null);
                  }}
                  locale={lang === "mk" ? mkLocale : enGB}
                  weekStartsOn={1}
                  startMonth={today}
                  endMonth={lastDay}
                  disabled={[{ before: today }, { after: lastDay }, ...fullDays]}
                  modifiers={{ free: freeDays, few: fewDays, full: fullDays }}
                  modifiersClassNames={{ free: "day-free", few: "day-few", full: "day-full" }}
                  className="mx-auto w-full bg-transparent [--cell-size:--spacing(10)]"
                  classNames={{ root: "w-full" }}
                />
                <div className="flex flex-wrap justify-center gap-4 border-t border-border p-3 text-xs text-muted-foreground">
                  <Legend color="bg-success" label={t.booking.legendFree} />
                  <Legend color="bg-primary" label={t.booking.legendFew} />
                  <Legend color="bg-destructive" label={t.booking.legendFull} />
                </div>
              </div>
            </Step>

            <Step n={3} title={t.booking.step3}>
              {!date && <p className="text-sm text-muted-foreground">{t.booking.pickDate}</p>}
              {date && !slots.data && <LoadingNote />}
              {date && slots.data && (
                <>
                  <p className="mb-3 text-sm text-muted-foreground">{formatDate(toIsoDate(date), lang, { weekday: "long" })}</p>
                  {slots.data.slots.every((s) => !s.available) ? (
                    <p className="text-sm text-muted-foreground">{t.booking.noSlots}</p>
                  ) : null}
                  <div className="grid grid-cols-3 gap-2">
                    {slots.data.slots.map((s) => (
                      <button
                        key={s.time}
                        disabled={!s.available}
                        onClick={() => setTime(s.time)}
                        className={cn(
                          "rounded-lg border py-3 font-heading text-lg tabular-nums transition",
                          !s.available && "cursor-not-allowed border-border bg-muted/40 text-muted-foreground/50 line-through",
                          s.available && time !== s.time && "border-border bg-background hover:border-primary/50",
                          time === s.time && "border-primary bg-primary text-primary-foreground"
                        )}
                        title={s.available ? "" : t.booking.taken}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </Step>
          </div>

          {/* 4. Детали */}
          <div className={cn(!time && "pointer-events-none opacity-40")}>
            <Step n={4} title={t.booking.step4}>
              <div className="space-y-5">
                <div>
                  <Label className="mb-2 block">{t.booking.players}</Label>
                  <div className="flex flex-wrap gap-2">
                    {[2, 3, 4, 5, 6].map((n) => {
                      const allowed = room ? n >= room.min_players && n <= room.max_players : false;
                      return (
                        <button
                          key={n}
                          disabled={!allowed}
                          onClick={() => setPlayers(n)}
                          className={cn(
                            "size-12 rounded-lg border font-heading text-lg transition disabled:cursor-not-allowed disabled:opacity-30",
                            players === n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50"
                          )}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="mb-2 block">
                      {t.common.name}
                    </Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2 block">
                      {t.common.phone}
                    </Label>
                    <Input id="phone" type="tel" placeholder="070 123 456" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes" className="mb-2 block">
                    {t.booking.notes}
                  </Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
              </div>
            </Step>
          </div>
        </div>

        {/* Преглед и цена */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glow-gold rounded-2xl bg-card p-6">
            <h2 className="text-xl uppercase">{t.booking.summary}</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <SummaryRow label={t.booking.room} value={room ? pick(room, "name", lang) : "—"} />
              <SummaryRow label={t.booking.when} value={date ? `${formatDate(toIsoDate(date), lang, { month: "short" })}${time ? `, ${time}` : ""}` : "—"} />
              <SummaryRow label={t.booking.players} value={players ? String(players) : "—"} />
              {basePrice !== null && players && (
                <SummaryRow label={t.booking.perPerson} value={formatPrice(Math.round(basePrice / players), lang)} />
              )}
              {isWeekend && pricing.data && <SummaryRow label={t.booking.weekend} value={`+${formatPrice(pricing.data.weekend_surcharge, lang)}`} />}
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
              <span className="uppercase text-muted-foreground">{t.booking.total}</span>
              <span className="font-heading text-3xl text-primary">{total !== null ? formatPrice(total, lang) : "—"}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t.booking.payOnSite}</p>
            <Button size="xl" className="mt-5 w-full" disabled={!canSubmit || submitting} onClick={submit}>
              {user ? t.booking.confirm : t.booking.loginToBook}
            </Button>
            {!user && <p className="mt-2 text-center text-xs text-muted-foreground">{t.booking.loginRequired}</p>}
          </div>
        </aside>
      </section>

      {/* Потврда */}
      <Dialog open={confirmed !== null} onOpenChange={(open) => !open && reset()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <CheckCircleIcon className="size-16 text-success" />
            <DialogTitle className="font-heading text-2xl uppercase">{t.booking.successTitle}</DialogTitle>
            <DialogDescription>{t.booking.successText}</DialogDescription>
          </DialogHeader>
          {confirmed && (
            <div className="rounded-xl border border-dashed border-primary/60 bg-primary/5 p-4 text-center">
              <div className="font-heading text-3xl tracking-[0.2em] text-primary">{confirmed.code}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {pick({ name_mk: confirmed.room_name_mk, name_en: confirmed.room_name_en }, "name", lang)} ·{" "}
                {formatDate(confirmed.date, lang, { month: "short" })}, {confirmed.time} · {formatPrice(confirmed.price, lang)}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-center">
            <Link href="/profile" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t.booking.myBookings}
            </Link>
            <Button size="lg" onClick={reset}>
              {t.booking.another}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-5 flex items-center gap-3 text-xl uppercase">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary font-heading text-sm text-primary-foreground">{n}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", color)} /> {label}
    </span>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
