"use client";

import type { ReactNode } from "react";
import { useDay } from "@/components/day-provider";

export type DayScrollerProps = {
  children: ReactNode;
};

export const DayScroller = (props: DayScrollerProps) => {
  const day = useDay();
  return (
    <>
      <main
        ref={day.registerScroller}
        className="hidden min-h-0 flex-1 snap-y snap-mandatory overflow-y-scroll overscroll-y-contain lg:block"
      >
        {day.days.map((d, i) => (
          <section
            key={d.iso}
            ref={day.registerSection(i)}
            className="h-full snap-start"
          >
            {props.children}
          </section>
        ))}
      </main>
      <main className="min-h-0 flex-1 overflow-y-auto lg:hidden">{props.children}</main>
    </>
  );
};
