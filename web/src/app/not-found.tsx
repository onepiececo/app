import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Empty, EmptyActions, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

const Focal = () => (
  <div className="relative grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm">
    <FileQuestion className="size-4.5 text-foreground/80" />
  </div>
);

export default function NotFound() {
  return (
    <main className="grid h-dvh place-items-center bg-background text-foreground">
      <Empty>
        <EmptyMedia>
          <Focal />
        </EmptyMedia>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>
          That route does not exist, the home rail and the anime database are the two anchored surfaces.
        </EmptyDescription>
        <EmptyActions>
          <Button variant="outline" size="sm" render={<Link href="/" />}>
            Back to home
          </Button>
        </EmptyActions>
      </Empty>
    </main>
  );
}
