"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarIcon, CardsIcon, MailIcon, ShieldIcon, TicketIcon, UsersIcon } from "@/components/icons";
import { ErrorState, LoadingNote, PageHeader, RankCell } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/provider";
import { refreshRooms } from "@/app/actions";
import { api, useApi } from "@/lib/api";
import { formatDate, formatDuration, formatPrice, pick, toIsoDate } from "@/lib/format";
import type { AdminRoom, AdminStats, Booking, ContactMessage, LeaderboardRow, Room, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StatusBadge, useRequireUser } from "./profile-view";

const selectClass = "h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:border-ring";

export function AdminView() {
  const { t } = useLang();
  const user = useRequireUser();

  if (!user) return <div className="mx-auto max-w-7xl px-4 py-20"><LoadingNote /></div>;
  if (!user.is_admin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShieldIcon className="mx-auto size-16 text-destructive" />
        <p className="mt-4 text-lg">{t.admin.noAccess}</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={t.admin.title} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Stats />
        <Tabs defaultValue="bookings" className="mt-10">
          <TabsList className="mb-6 h-10! flex-wrap">
            <TabsTrigger value="bookings" className="px-4">{t.admin.bookings}</TabsTrigger>
            <TabsTrigger value="rooms" className="px-4">{t.admin.rooms}</TabsTrigger>
            <TabsTrigger value="messages" className="px-4">{t.admin.messages}</TabsTrigger>
            <TabsTrigger value="leaderboard" className="px-4">{t.admin.leaderboard}</TabsTrigger>
            <TabsTrigger value="users" className="px-4">{t.admin.users}</TabsTrigger>
          </TabsList>
          <TabsContent value="bookings"><BookingsTab /></TabsContent>
          <TabsContent value="rooms"><RoomsTab /></TabsContent>
          <TabsContent value="messages"><MessagesTab /></TabsContent>
          <TabsContent value="leaderboard"><LeaderboardTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
        </Tabs>
      </section>
    </>
  );
}

function Stats() {
  const { t, lang } = useLang();
  const stats = useApi<AdminStats>("/api/admin/stats");
  if (stats.error) return <ErrorState onRetry={stats.reload} />;
  const items: { key: keyof AdminStats; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "upcoming_bookings", icon: CalendarIcon },
    { key: "today_bookings", icon: TicketIcon },
    { key: "revenue_completed", icon: ShieldIcon },
    { key: "users", icon: UsersIcon },
    { key: "unread_messages", icon: MailIcon },
    { key: "game_plays", icon: CardsIcon },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {items.map(({ key, icon: Icon }) => (
        <div key={key} className="rounded-2xl border border-border bg-card p-5">
          <Icon className="size-6 text-primary" />
          <div className="mt-3 font-heading text-2xl">
            {stats.data ? (key === "revenue_completed" ? formatPrice(stats.data[key], lang) : stats.data[key]) : "…"}
          </div>
          <div className="text-xs uppercase text-muted-foreground">{t.admin.stats[key]}</div>
        </div>
      ))}
    </div>
  );
}

function BookingsTab() {
  const { t, lang } = useLang();
  const [scope, setScope] = useState<"upcoming" | "past" | "all">("upcoming");
  const bookings = useApi<Booking[]>(`/api/admin/bookings?scope=${scope}&limit=150`);

  async function setStatus(b: Booking, status: string) {
    try {
      await api(`/api/admin/bookings/${b.id}`, { method: "PATCH", body: { status } });
      toast.success(t.admin.updated);
      bookings.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t.common.error);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        {(["upcoming", "past", "all"] as const).map((s) => (
          <Button key={s} variant={scope === s ? "default" : "outline"} onClick={() => setScope(s)}>
            {t.admin.scope[s]}
          </Button>
        ))}
      </div>
      {!bookings.data ? (
        <LoadingNote />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">{t.admin.code}</th>
                <th className="py-2 pr-3">{t.booking.room}</th>
                <th className="py-2 pr-3">{t.booking.when}</th>
                <th className="py-2 pr-3">{t.admin.customer}</th>
                <th className="py-2 pr-3 text-center">{t.common.players}</th>
                <th className="py-2 pr-3 text-right">{t.booking.total}</th>
                <th className="py-2">{t.admin.status}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.data.map((b) => (
                <tr key={b.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3 font-mono text-xs">{b.code}</td>
                  <td className="py-2 pr-3">{pick({ name_mk: b.room_name_mk, name_en: b.room_name_en }, "name", lang)}</td>
                  <td className="whitespace-nowrap py-2 pr-3">
                    {formatDate(b.date, lang, { month: "short", year: undefined })} {b.time}
                  </td>
                  <td className="py-2 pr-3">
                    <div>{b.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{b.phone}</div>
                    {b.email && <div className="text-xs text-muted-foreground">{b.email}</div>}
                  </td>
                  <td className="py-2 pr-3 text-center">{b.players}</td>
                  <td className="py-2 pr-3 text-right">{formatPrice(b.price, lang)}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} />
                      <select className={selectClass} value={b.status} onChange={(e) => setStatus(b, e.target.value)} aria-label={t.admin.status}>
                        {(["confirmed", "completed", "cancelled"] as const).map((s) => (
                          <option key={s} value={s}>
                            {t.profile.status[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Празна форма за нова соба
const emptyRoom = {
  slug: "", name_mk: "", name_en: "", tagline_mk: "", tagline_en: "",
  description_mk: "", description_en: "", highlights_mk: "", highlights_en: "",
  difficulty: "2", min_players: "2", max_players: "6", duration_min: "60",
  min_age: "12", success_rate: "50", theme: "other",
};

function RoomsTab() {
  const { t, lang } = useLang();
  const rooms = useApi<AdminRoom[]>("/api/admin/rooms");
  const [form, setForm] = useState(emptyRoom);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    // Истакнатите точки се пишуваат по една во ред
    const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);
    try {
      await api("/api/admin/rooms", {
        method: "POST",
        body: {
          ...form,
          highlights_mk: lines(form.highlights_mk),
          highlights_en: lines(form.highlights_en),
          difficulty: Number(form.difficulty),
          min_players: Number(form.min_players),
          max_players: Number(form.max_players),
          duration_min: Number(form.duration_min),
          min_age: Number(form.min_age),
          success_rate: Number(form.success_rate),
        },
      });
      toast.success(t.admin.roomAdded);
      setForm(emptyRoom);
      rooms.reload();
      await refreshRooms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.common.error);
    }
  }

  async function remove(slug: string) {
    if (!confirm(t.admin.deleteRoomConfirm)) return;
    try {
      await api(`/api/admin/rooms/${slug}`, { method: "DELETE" });
      toast.success(t.admin.roomDeleted);
      rooms.reload();
      await refreshRooms();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.common.error);
    }
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const field = (key: keyof typeof form, label: string, extra: React.ComponentProps<typeof Input> = {}) => (
    <div>
      <Label htmlFor={`room-${key}`} className="mb-1.5 block text-xs">{label}</Label>
      <Input id={`room-${key}`} required value={form[key]} onChange={set(key)} {...extra} />
    </div>
  );

  const area = (key: keyof typeof form, label: string, required = true) => (
    <div>
      <Label htmlFor={`room-${key}`} className="mb-1.5 block text-xs">{label}</Label>
      <Textarea id={`room-${key}`} required={required} rows={3} value={form[key]} onChange={set(key)} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      {/* Преглед на постоечките соби */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card p-5">
        {!rooms.data ? (
          <LoadingNote />
        ) : (
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">{t.booking.room}</th>
                <th className="py-2 pr-3">{t.common.players}</th>
                <th className="py-2 pr-3 text-center">{t.admin.upcoming}</th>
                <th className="py-2 pr-3 text-right">{t.admin.revenue}</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {rooms.data.map((r) => (
                <tr key={r.slug} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3">
                    <div className="font-medium">{pick(r, "name", lang)}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.common.difficulty[r.difficulty]} · {r.duration_min} {t.common.minutes}
                    </div>
                  </td>
                  <td className="py-2 pr-3">{r.min_players}–{r.max_players}</td>
                  <td className="py-2 pr-3 text-center">{r.upcoming_bookings}</td>
                  <td className="py-2 pr-3 text-right">{formatPrice(r.revenue, lang)}</td>
                  <td className="py-2 text-right">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(r.slug)}>
                      {t.admin.delete}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Форма за нова соба */}
      <form onSubmit={add} className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h3 className="text-lg uppercase text-primary">{t.admin.addRoom}</h3>
        {field("slug", t.admin.slug, { pattern: "[a-z0-9\\-]{2,60}", placeholder: "vampirski-zamok" })}
        <div className="grid grid-cols-2 gap-2">
          {field("name_mk", t.admin.nameMk, { minLength: 2 })}
          {field("name_en", t.admin.nameEn, { minLength: 2 })}
        </div>
        {field("tagline_mk", t.admin.taglineMk, { minLength: 2 })}
        {field("tagline_en", t.admin.taglineEn, { minLength: 2 })}
        {area("description_mk", t.admin.descriptionMk)}
        {area("description_en", t.admin.descriptionEn)}
        {area("highlights_mk", t.admin.highlightsMk, false)}
        {area("highlights_en", t.admin.highlightsEn, false)}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="room-difficulty" className="mb-1.5 block text-xs">{t.admin.difficulty}</Label>
            <select id="room-difficulty" className={cn(selectClass, "w-full")} value={form.difficulty} onChange={set("difficulty")}>
              {[1, 2, 3].map((d) => (
                <option key={d} value={d}>{t.common.difficulty[d]}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="room-theme" className="mb-1.5 block text-xs">{t.admin.theme}</Label>
            <select id="room-theme" className={cn(selectClass, "w-full")} value={form.theme} onChange={set("theme")}>
              {(Object.keys(t.admin.themes) as (keyof typeof t.admin.themes)[]).map((k) => (
                <option key={k} value={k}>{t.admin.themes[k]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {field("min_players", t.admin.minPlayers, { type: "number", min: 2, max: 6 })}
          {field("max_players", t.admin.maxPlayers, { type: "number", min: 2, max: 6 })}
          {field("duration_min", t.admin.duration, { type: "number", min: 30, max: 120 })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {field("min_age", t.admin.minAge, { type: "number", min: 6, max: 18 })}
          {field("success_rate", t.admin.successRate, { type: "number", min: 0, max: 100 })}
        </div>
        <Button type="submit" className="w-full" size="lg">{t.admin.addRoom}</Button>
      </form>
    </div>
  );
}

function MessagesTab() {
  const { t, lang } = useLang();
  const messages = useApi<ContactMessage[]>("/api/admin/messages");

  async function markRead(id: number) {
    await api(`/api/admin/messages/${id}/read`, { method: "PATCH" });
    messages.reload();
  }

  if (!messages.data) return <LoadingNote />;
  return (
    <div className="space-y-3">
      {messages.data.map((m) => (
        <div key={m.id} className={cn("rounded-2xl border bg-card p-5", m.is_read ? "border-border" : "border-primary/50")}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">
                {!m.is_read && <span className="mr-2 inline-block size-2 rounded-full bg-primary" />}
                {m.subject}
              </p>
              <p className="text-sm text-muted-foreground">
                {m.name} · <a href={`mailto:${m.email}`} className="hover:text-primary">{m.email}</a> · {formatDate(m.created_at, lang, { month: "short" })}
              </p>
            </div>
            {!m.is_read && (
              <Button variant="outline" size="sm" onClick={() => markRead(m.id)}>
                {t.admin.markRead}
              </Button>
            )}
          </div>
          <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

function LeaderboardTab() {
  const { t, lang } = useLang();
  const rooms = useApi<Room[]>("/api/rooms");
  const [slug, setSlug] = useState("laboratorija");
  const board = useApi<LeaderboardRow[]>(`/api/leaderboard/${slug}?limit=50`);
  const [form, setForm] = useState({ team_name: "", players: "4", minutes: "45", seconds: "0", hints_used: "0", played_on: toIsoDate(new Date()) });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/api/admin/leaderboard", {
        method: "POST",
        body: {
          room_slug: slug,
          team_name: form.team_name,
          players: Number(form.players),
          time_seconds: Number(form.minutes) * 60 + Number(form.seconds),
          hints_used: Number(form.hints_used),
          played_on: form.played_on,
        },
      });
      toast.success(t.admin.added);
      setForm({ ...form, team_name: "" });
      board.reload();
      await refreshRooms(); // најдоброто време на собата можеби се сменило
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.common.error);
    }
  }

  async function remove(id: number) {
    await api(`/api/admin/leaderboard/${id}`, { method: "DELETE" });
    board.reload();
    await refreshRooms();
  }

  const input = (key: keyof typeof form, label: string, type = "number", extra: React.ComponentProps<typeof Input> = {}) => (
    <div>
      <Label htmlFor={`lb-${key}`} className="mb-1.5 block text-xs">{label}</Label>
      <Input id={`lb-${key}`} type={type} required value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...extra} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <form onSubmit={add} className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h3 className="text-lg uppercase text-primary">{t.admin.addEntry}</h3>
        <div>
          <Label htmlFor="lb-room" className="mb-1.5 block text-xs">{t.booking.room}</Label>
          <select id="lb-room" className={cn(selectClass, "w-full")} value={slug} onChange={(e) => setSlug(e.target.value)}>
            {rooms.data?.map((r) => (
              <option key={r.slug} value={r.slug}>{pick(r, "name", lang)}</option>
            ))}
          </select>
        </div>
        {input("team_name", t.admin.teamName, "text", { minLength: 2 })}
        <div className="grid grid-cols-3 gap-2">
          {input("minutes", t.admin.minutes, "number", { min: 1, max: 99 })}
          {input("seconds", t.admin.seconds, "number", { min: 0, max: 59 })}
          {input("players", t.common.players, "number", { min: 2, max: 6 })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {input("hints_used", t.common.hints, "number", { min: 0, max: 20 })}
          {input("played_on", t.common.date, "date")}
        </div>
        <Button type="submit" className="w-full" size="lg">{t.admin.addEntry}</Button>
      </form>

      <div className="rounded-2xl border border-border bg-card p-5">
        {!board.data ? (
          <LoadingNote />
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {board.data.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="w-10 py-2"><RankCell rank={r.rank} /></td>
                  <td className="py-2">{r.team_name}</td>
                  <td className="py-2 font-heading text-primary">{formatDuration(r.time_seconds)}</td>
                  <td className="hidden py-2 text-muted-foreground sm:table-cell">{formatDate(r.played_on, lang, { month: "short" })}</td>
                  <td className="py-2 text-right">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(r.id)}>✕</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function UsersTab() {
  const { t, lang } = useLang();
  const users = useApi<(User & { created_at: string })[]>("/api/admin/users");
  if (!users.data) return <LoadingNote />;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card p-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
            <th className="py-2 pr-3">{t.common.name}</th>
            <th className="py-2 pr-3">{t.common.email}</th>
            <th className="py-2 pr-3">{t.admin.role}</th>
            <th className="py-2">{t.admin.joined}</th>
          </tr>
        </thead>
        <tbody>
          {users.data.map((u) => (
            <tr key={u.id} className="border-b border-border/60 last:border-0">
              <td className="py-2 pr-3">{u.name}</td>
              <td className="py-2 pr-3 text-muted-foreground">{u.email}</td>
              <td className="py-2 pr-3">{u.is_admin ? <span className="text-primary">admin</span> : "user"}</td>
              <td className="py-2">{formatDate(u.created_at, lang, { month: "short" })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
