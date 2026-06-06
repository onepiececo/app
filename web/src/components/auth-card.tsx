"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { signIn, signUp } from "@/lib/auth-client";

type TabValue = "signin" | "signup";

export type AuthCardProps = {
  initialTab?: TabValue;
};

export const AuthCard = (props: AuthCardProps) => {
  const router = useRouter();
  const [tab, setTab] = useState<TabValue>(props.initialTab ?? "signin");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const switchTab = (value: TabValue) => {
    setTab(value);
    setFormError(null);
    router.replace(value === "signin" ? "/signin" : "/signup", { scroll: false });
  };

  const onSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    setFormError(null);
    startTransition(async () => {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setFormError(result.error.message ?? "Could not sign in");
        return;
      }
      router.replace("/");
      router.refresh();
    });
  };

  const onSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    setFormError(null);
    startTransition(async () => {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        setFormError(result.error.message ?? "Could not create account");
        return;
      }
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="grid size-10 place-items-center rounded-lg bg-foreground font-bold font-mono text-background text-sm tracking-tighter outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90"
        >
          OP
        </Link>
        <h1 className="font-semibold text-2xl tracking-tight">
          {tab === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {tab === "signin"
            ? "Sign in to sync your puzzles and history across devices."
            : "An account keeps your streak, scores, and history synced everywhere."}
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => switchTab(v as TabValue)}>
        <TabsList variant="inset" fullWidth>
          <TabsTab value="signin" className="flex-1">Sign in</TabsTab>
          <TabsTab value="signup" className="flex-1">Create account</TabsTab>
        </TabsList>

        <TabsPanel value="signin" className="pt-6">
          <Form onSubmit={onSignIn} className="flex flex-col gap-4">
            <Field name="email">
              <FieldLabel>Email</FieldLabel>
              <Input type="email" required autoComplete="email" placeholder="you@example.com" />
              <FieldError />
            </Field>
            <Field name="password">
              <FieldLabel>Password</FieldLabel>
              <Input type="password" required autoComplete="current-password" />
              <FieldError />
            </Field>
            {formError ? <p className="text-destructive-foreground text-xs">{formError}</p> : null}
            <Button type="submit" loading={pending} className="mt-2 w-full">
              Sign in
            </Button>
          </Form>
        </TabsPanel>

        <TabsPanel value="signup" className="pt-6">
          <Form onSubmit={onSignUp} className="flex flex-col gap-4">
            <Field name="name">
              <FieldLabel>Name</FieldLabel>
              <Input required autoComplete="name" placeholder="Kyle" />
              <FieldError />
            </Field>
            <Field name="email">
              <FieldLabel>Email</FieldLabel>
              <Input type="email" required autoComplete="email" placeholder="you@example.com" />
              <FieldError />
            </Field>
            <Field name="password">
              <FieldLabel>Password</FieldLabel>
              <Input type="password" required autoComplete="new-password" minLength={8} />
              <FieldError />
            </Field>
            {formError ? <p className="text-destructive-foreground text-xs">{formError}</p> : null}
            <Button type="submit" loading={pending} className="mt-2 w-full">
              Create account
            </Button>
          </Form>
        </TabsPanel>
      </Tabs>
    </div>
  );
};
