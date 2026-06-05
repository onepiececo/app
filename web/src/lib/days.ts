export type Day = {
  weekday: string;
  weekdayShort: string;
  month: string;
  monthShort: string;
  day: number;
  year: number;
  iso: string;
  date: Date;
};

const fmt = (date: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", opts).format(date);

export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const makeDay = (iso: string): Day => {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    weekday: fmt(date, { weekday: "long" }),
    weekdayShort: fmt(date, { weekday: "short" }),
    month: fmt(date, { month: "long" }),
    monthShort: fmt(date, { month: "short" }),
    day: date.getDate(),
    year: date.getFullYear(),
    iso,
    date,
  };
};

export const safeParseIso = (input: unknown, fallback: string): string => {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return fallback;
  const [y, m, d] = input.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return fallback;
  return input;
};

// Calendar selected-day override. The recipe paints a dark gradient over dark
// text in dark mode; clear the gradient and force a primary fill so the cell
// inverts per theme.
export const SELECTED_DAY_CLASS = [
  "in-[[data-selected]:not(.range-middle)]:bg-none!",
  "in-[[data-selected]:not(.range-middle)]:shadow-none!",
  "in-[[data-selected]:not(.range-middle)]:inset-shadow-none!",
  "in-[[data-selected]:not(.range-middle)]:bg-primary!",
  "in-[[data-selected]:not(.range-middle)]:text-primary-foreground!",
].join(" ");

export const todayIso = () => toIso(new Date());
