"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Row } from "./_shared";

export function ButtonVariants() {
  return (
    <div className="flex flex-col gap-3">
      <Row>
        <Button>Save changes</Button>
        <Button variant="outline">Preview</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="secondary">
          Continue
          <ArrowRight />
        </Button>
      </Row>
      <Row>
        <Button size="sm" variant="success">
          <CheckCircle2 />
          Complete
        </Button>
        <Button loading size="sm" variant="outline">
          Syncing
        </Button>
        <Button disabled size="sm" variant="secondary">
          Disabled
        </Button>
        <Button size="sm" variant="link">
          Read docs
        </Button>
      </Row>
    </div>
  );
}
