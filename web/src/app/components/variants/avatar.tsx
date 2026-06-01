"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Row } from "./_shared";

export function AvatarVariants() {
  return (
    <Row>
      <Avatar>
        <AvatarImage src="https://github.com/kylegrahammatzen.png" alt="Kyle" />
        <AvatarFallback>KG</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>KM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>+3</AvatarFallback>
      </Avatar>
    </Row>
  );
}
