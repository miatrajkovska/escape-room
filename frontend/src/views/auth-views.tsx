"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { KeyholeIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fill, useLang } from "@/i18n/provider";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

// Каде да се оди по најава (само внатрешни адреси)
function useNext() {
  const next = useSearchParams().get("next") ?? "/profile";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/profile";
}

function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="glow-gold relative w-full max-w-md rounded-2xl bg-card p-7 sm:p-9">
        <KeyholeIcon className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-center text-3xl uppercase">{title}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

function Field({ id, label, hint, ...props }: { id: string; label: string; hint?: string } & React.ComponentProps<typeof Input>) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <Input id={id} required className="h-11" {...props} />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function LoginView() {
  const { t } = useLang();
  const { login } = useAuth();
  const router = useRouter();
  const next = useNext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email, password);
      toast.success(fill(t.auth.welcome, { name: user.name }));
      router.push(next);
    } catch (err) {
      toast.error(err instanceof ApiError && err.status === 401 ? t.auth.invalid : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  // Брзо пополнување со демо профил
  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
  }

  return (
    <AuthCard title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
      <form onSubmit={submit} className="space-y-4">
        <Field id="email" label={t.common.email} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field id="password" label={t.common.password} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" size="xl" className="w-full" disabled={busy}>
          {t.auth.submitLogin}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.auth.noAccount}{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-primary hover:underline">
          {t.nav.register}
        </Link>
      </p>
      <div className="mt-6 rounded-xl border border-dashed border-primary/40 p-4 text-sm">
        <p className="mb-2 text-xs uppercase tracking-wide text-primary">{t.auth.demoTitle}</p>
        <button type="button" onClick={() => fillDemo("demo@pressesc.mk", "demo123")} className="block w-full rounded-md px-2 py-1 text-left hover:bg-muted">
          demo@pressesc.mk / demo123
        </button>
        <button type="button" onClick={() => fillDemo("admin@pressesc.mk", "admin123")} className="block w-full rounded-md px-2 py-1 text-left hover:bg-muted">
          admin@pressesc.mk / admin123 <span className="text-muted-foreground">(admin)</span>
        </button>
        <button type="button" onClick={() => fillDemo("mia@test.com", "mia")} className="block w-full rounded-md px-2 py-1 text-left hover:bg-muted">
          mia@test.com / mia <span className="text-muted-foreground">(admin)</span>
        </button>
      </div>
    </AuthCard>
  );
}

export function RegisterView() {
  const { t } = useLang();
  const { register } = useAuth();
  const router = useRouter();
  const next = useNext();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success(fill(t.auth.welcome, { name: user.name }));
      router.push(next);
    } catch (err) {
      toast.error(err instanceof ApiError && err.status === 409 ? t.auth.exists : err instanceof Error ? err.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title={t.auth.registerTitle} subtitle={t.auth.registerSubtitle}>
      <form onSubmit={submit} className="space-y-4">
        <Field id="name" label={t.common.name} minLength={2} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Field id="email" label={t.common.email} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Field
          id="password"
          label={t.common.password}
          type="password"
          minLength={6}
          autoComplete="new-password"
          hint={t.auth.passwordHint}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" size="xl" className="w-full" disabled={busy}>
          {t.auth.submitRegister}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.auth.haveAccount}{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-primary hover:underline">
          {t.nav.login}
        </Link>
      </p>
    </AuthCard>
  );
}
