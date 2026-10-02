"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CardsIcon, CipherIcon, DoorIcon, KeyIcon, themeIcon } from "@/components/icons";
import { CtaLink, ErrorState, LoadingNote, PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/provider";
import { api, useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useMyGameSummary } from "@/components/games/game-shell";
import { formatDate, formatPrice, pick, toIsoDate } from "@/lib/format";
import type { Booking, GameId, MyGameStats } from "@/lib/types";
import { cn } from "@/lib/utils";

// Пренасочи кон најава ако корисникот не е најавен
export function useRequireUser() {
  const { user, ready } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [ready, user, router]);
  return user;
}

export function StatusBadge({ status }: { status: Booking["status"] }) {
  const { t } = useLang();
  return (
    <Badge
      className={cn(
        status === "confirmed" && "bg-primary/15 text-primary",
        status === "completed" && "bg-success/15 text-success",
        status === "cancelled" && "bg-destructive/15 text-destructive"
      )}
    >
      {t.profile.status[status]}
    </Badge>
  );
}

export function ProfileView() {
  const { t } = useLang();
  const { logout } = useAuth();
  const router = useRouter();
  const user = useRequireUser();
  if (!user) return <div className="mx-auto max-w-7xl px-4 py-20"><LoadingNote /></div>;

  return (
    <>
      <PageHeader title={t.profile.title}>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10 font-heading text-2xl text-primary">
            {user.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-xl">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Прво одиме на почетната, па се одјавуваме – инаку профилот би не пренасочил на најава */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                router.replace("/");
                logout();
              }}
            >
              <DoorIcon /> {t.profile.logout}
            </Button>
            <DeleteProfile />
          </div>
        </div>
      </PageHeader>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px]">
        <MyBookings />
        <MyGames />
      </section>
    </>
  );
}

// Бришење на профилот, со дијалог за потврда
function DeleteProfile() {
  const { t } = useLang();
  const { logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await api("/api/auth/me", { method: "DELETE" });
      toast.success(t.profile.deleted);
      // Исто како кај одјавата: прво на почетната, па одјава
      router.replace("/");
      logout();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.common.error);
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <>
      {/* Дискретно копче до „Одјави се“; предупредувањето е во дијалогот */}
      <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-destructive" onClick={() => setOpen(true)}>
        {t.profile.deleteProfile}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.profile.deleteProfile}</DialogTitle>
            <DialogDescription>
              {t.profile.deleteConfirm} {t.profile.deleteText}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t.common.back}
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={remove}>
              {t.profile.deleteProfile}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MyBookings() {
  const { t } = useLang();
  const bookings = useApi<Booking[]>("/api/bookings/me");
  const [toCancel, setToCancel] = useState<Booking | null>(null);

  const today = toIsoDate(new Date());
  const upcoming = (bookings.data ?? []).filter((b) => b.date >= today && b.status !== "cancelled").reverse();
  const past = (bookings.data ?? []).filter((b) => b.date < today || b.status === "cancelled");

  async function cancel() {
    if (!toCancel) return;
    try {
      await api(`/api/bookings/${toCancel.id}/cancel`, { method: "POST" });
      toast.success(t.profile.cancelled);
      bookings.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.common.error);
    } finally {
      setToCancel(null);
    }
  }

  return (
    // id="bookings" за линкот /profile#bookings по нова резервација
    <div id="bookings" className="scroll-mt-24">
      <h2 className="mb-4 text-2xl uppercase">{t.profile.bookings}</h2>
      {bookings.error && <ErrorState onRetry={bookings.reload} />}
      {!bookings.data && !bookings.error && <LoadingNote />}
      {bookings.data && (
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming" className="px-4">
              {t.profile.upcoming} ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="px-4">
              {t.profile.past} ({past.length})
            </TabsTrigger>
          </TabsList>
          {(["upcoming", "past"] as const).map((tab) => {
            const list = tab === "upcoming" ? upcoming : past;
            return (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {list.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                    <p className="text-muted-foreground">{t.profile.noBookings}</p>
                    <CtaLink href="/booking" className="mt-4">
                      {t.common.bookNow}
                    </CtaLink>
                  </div>
                )}
                {list.map((b) => (
                  <BookingRow key={b.id} booking={b} onCancel={tab === "upcoming" && b.status === "confirmed" ? () => setToCancel(b) : undefined} />
                ))}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <Dialog open={toCancel !== null} onOpenChange={(open) => !open && setToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.profile.cancelBooking}</DialogTitle>
            <DialogDescription>{t.profile.cancelConfirm}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToCancel(null)}>
              {t.common.back}
            </Button>
            <Button variant="destructive" onClick={cancel}>
              {t.profile.cancelBooking}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingRow({ booking: b, onCancel }: { booking: Booking; onCancel?: () => void }) {
  const { t, lang } = useLang();
  const Icon = themeIcon[b.room_theme];
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="size-6 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/rooms/${b.room_slug}`} className="font-heading text-lg uppercase hover:text-primary">
          {pick({ name_mk: b.room_name_mk, name_en: b.room_name_en }, "name", lang)}
        </Link>
        <p className="text-sm text-muted-foreground">
          {formatDate(b.date, lang, { weekday: "short", month: "short" })} · {b.time} · {b.players} {t.common.players} · {formatPrice(b.price, lang)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">{b.code}</span>
        <StatusBadge status={b.status} />
        {onCancel && (
          <Button variant="destructive" size="sm" onClick={onCancel}>
            {t.profile.cancelBooking}
          </Button>
        )}
      </div>
    </div>
  );
}

const MEDALS = ["🥇", "🥈", "🥉"];

function medal(rank: number | null, placeLabel: string) {
  if (!rank || rank > 3) return null;
  return (
    <span className="ml-2" role="img" aria-label={`${rank}. ${placeLabel}`} title={`${rank}. ${placeLabel}`}>
      {MEDALS[rank - 1]}
    </span>
  );
}

function MyGames() {
  const { t } = useLang();
  const mine = useApi<MyGameStats>("/api/games/me");
  const summary = useMyGameSummary();
  const games: { id: GameId; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "codebreaker", icon: KeyIcon },
    { id: "memory", icon: CardsIcon },
    { id: "cipher", icon: CipherIcon },
  ];
  return (
    <aside>
      <h2 className="mb-4 text-2xl uppercase">{t.profile.games}</h2>
      <div className="space-y-3">
        {games.map(({ id, icon: Icon }) => {
          return (
            <Link key={id} href={`/games/${id}`} className="card-hover flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <Icon className="size-8 text-primary" />
              <div className="flex-1">
                <p className="font-heading uppercase">
                  {t.games.list[id].name}
                  {/* Медал ако корисникот е меѓу првите 3 на ранг-листата */}
                  {mine.data && medal(mine.data[id].rank, t.profile.place)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {mine.data ? summary(mine.data[id]) : t.common.loading}
                </p>
              </div>
              <span className="text-primary">→</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
