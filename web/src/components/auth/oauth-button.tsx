"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type OAuthButtonProps = {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
};

export const OAuthButton = (props: OAuthButtonProps) => (
  <Button variant="outline" className="w-full justify-center gap-2" onClick={props.onClick}>
    {props.icon}
    {props.children}
  </Button>
);
