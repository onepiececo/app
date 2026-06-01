"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = (props: ProvidersProps) => (
  <ThemeProvider>
    <ToastProvider>{props.children}</ToastProvider>
  </ThemeProvider>
);
