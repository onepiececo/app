"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { OAuthButton } from "@/components/auth/oauth-button";
import {
  FacebookIcon,
  GoogleIcon,
} from "@/components/auth/brand-icons";

export const VariantClassic = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("classic submit", { email, password });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="size-10 rounded-lg bg-foreground" aria-hidden />
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back to <span className="text-primary">Template</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Log in with your email and password, or create an account if you don&apos;t have one.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="font-normal">
              Keep me signed in
            </Label>
          </div>
          <Link href="#" className="text-sm font-medium underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full">
          Login now
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">Or continue with</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <OAuthButton icon={<GoogleIcon />}>Google</OAuthButton>
        <OAuthButton icon={<FacebookIcon />}>Facebook</OAuthButton>
      </div>
    </div>
  );
};
