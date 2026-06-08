"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";

export const SignInForm = () => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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

  return (
    <Form onSubmit={onSubmit} className="flex flex-col gap-4">
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
  );
};
