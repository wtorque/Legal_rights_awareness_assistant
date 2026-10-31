"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { languages } from "@/config/languages";
import { fadeUp, stagger } from "@/lib/motion";
import { useAuthStore } from "@/stores/auth-store";
import { Select } from "@/components/ui/select";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { signIn, register } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isRegister) await register({ email, password, name, language });
      else await signIn(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  };

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      {/* Slow drifting shapes. Decorative; framer-motion switches them off for reduced motion. */}
      <motion.div aria-hidden className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl" animate={{ x: [0, 40, 0], y: [0, 24, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="pointer-events-none absolute -right-20 bottom-8 size-80 rounded-full bg-brass/15 blur-3xl" animate={{ x: [0, -36, 0], y: [0, -28, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="relative w-full max-w-md" variants={stagger(0.09, 0.05)} initial="hidden" animate="visible">
      <Card className="w-full space-y-6 p-6 sm:p-8">
        <motion.div variants={fadeUp}>
          <Logo />
        </motion.div>
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-3xl">{isRegister ? "Create your account" : "Sign in"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister ? "Your documents and questions stay linked to you only." : "Welcome back to Aequa."}
          </p>
        </motion.div>
        <motion.form variants={fadeUp} onSubmit={submit} className="space-y-4" noValidate>
          {isRegister && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">{isRegister ? "Email" : "Email or username"}</Label>
            <Input id="email" type={isRegister ? "email" : "text"} autoComplete={isRegister ? "email" : "username"} required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={isRegister ? 10 : 1}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={isRegister ? "password-hint" : undefined}
            />
            {isRegister && (
              <p id="password-hint" className="text-xs text-muted-foreground">
                At least 10 characters.
              </p>
            )}
          </div>
          {isRegister && (
            <div className="space-y-1.5">
              <Label htmlFor="language">Preferred language</Label>
              <Select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} · {l.native}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {error && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full transition-transform active:scale-[0.98]" disabled={busy}>
            {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </Button>
        </motion.form>
        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account? " : "New here? "}
          <Link href={isRegister ? "/login" : "/register"} className="font-medium text-primary hover:underline">
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">Email and password only. Google sign-in, phone codes and password reset by email are not available yet.</p>
      </Card>
      </motion.div>
    </main>
  );
}
