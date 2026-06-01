import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { AccordionVariants } from "./variants/accordion";
import { AutocompleteVariants } from "./variants/autocomplete";
import { AvatarVariants } from "./variants/avatar";
import { BadgeVariants } from "./variants/badge";
import { BreadcrumbVariants } from "./variants/breadcrumb";
import { ButtonVariants } from "./variants/button";
import { CalendarVariants } from "./variants/calendar";
import { CardVariants } from "./variants/card";
import { ComboboxVariants } from "./variants/combobox";
import { CommandVariants } from "./variants/command";
import { DrawerVariants } from "./variants/drawer";
import { EmptyVariants } from "./variants/empty";
import { FeedbackVariants } from "./variants/feedback";
import { FrameVariants } from "./variants/frame";
import { HeadingVariants } from "./variants/heading";
import { InputVariants } from "./variants/input";
import { MenuVariants } from "./variants/menu";
import { MeterVariants } from "./variants/meter";
import { NumberFieldVariants } from "./variants/number-field";
import { OtpFieldVariants } from "./variants/otp-field";
import { PaginationVariants } from "./variants/pagination";
import { PopoverVariants } from "./variants/popover";
import { PopupVariants } from "./variants/popup";
import { PreviewCardVariants } from "./variants/preview-card";
import { ScrollAreaVariants } from "./variants/scroll-area";
import { SelectVariants } from "./variants/select";
import { SelectionVariants } from "./variants/selection";
import { SeparatorVariants } from "./variants/separator";
import { SheetVariants } from "./variants/sheet";
import { SliderVariants } from "./variants/slider";
import { TabsVariants } from "./variants/tabs";
import { TableVariants } from "./variants/table";
import { ToolbarVariants } from "./variants/toolbar";
import { TooltipVariants } from "./variants/tooltip";

type SectionProps = {
  id: string;
  title: string;
  description?: string;
  wide?: boolean;
  children: ReactNode;
};

const Section = (props: SectionProps) => {
  return (
    <section
      id={props.id}
      className={cn(
        "min-w-0 rounded-2xl border border-border/80 bg-[color-mix(in_srgb,var(--card)_92%,var(--foreground)_3%)] p-6 shadow-sm shadow-black/5 dark:shadow-black/20",
        props.wide ? "xl:col-span-full" : null,
      )}
    >
      <div className="flex min-h-16 flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">{props.title}</h2>
        {props.description ? (
          <p className="text-sm text-muted-foreground">{props.description}</p>
        ) : null}
      </div>
      <div className="mt-5 min-w-0 overflow-visible px-1 pb-1">
        {props.children}
      </div>
    </section>
  );
};

const SECTIONS: Array<Omit<SectionProps, "children"> & { Component: () => ReactNode }> = [
  { id: "accordion", title: "Accordion", Component: AccordionVariants },
  { id: "autocomplete", title: "Autocomplete", description: "Free-form input with filtered suggestions, glassy menu chrome, and origin-aware entry motion.", Component: AutocompleteVariants },
  { id: "avatar", title: "Avatar", Component: AvatarVariants },
  { id: "badge", title: "Badge", description: "Semantic badges mark status, priority, and workflow state at a glance.", Component: BadgeVariants },
  { id: "breadcrumb", title: "Breadcrumb", description: "Chevron, slash, home, and collapsed breadcrumb patterns keep paths compact and readable.", Component: BreadcrumbVariants },
  { id: "button", title: "Button", description: "A compact action cluster shows primary, secondary, ghost, outline, and destructive intent.", Component: ButtonVariants },
  { id: "calendar", title: "Calendar", description: "A date-picker trigger opens a compact calendar with clear selected and today states.", Component: CalendarVariants },
  { id: "card-variants", title: "Card variants", description: "A raised plan card shows the default grouped-content surface.", Component: CardVariants },
  { id: "combobox", title: "Combobox", description: "A searchable country picker keeps selection compact until the user opens it.", Component: ComboboxVariants },
  { id: "command", title: "Command", description: "A real trigger opens the command palette with actions and settings.", Component: CommandVariants },
  { id: "drawer", title: "Drawer", description: "A filter button opens a right-side drawer with form controls and actions.", Component: DrawerVariants },
  { id: "empty", title: "Empty", description: "A focused empty state pairs a single visual, a short message, and clear actions.", Component: EmptyVariants },
  { id: "feedback", title: "Feedback", description: "Progress anatomy shows labelled, striped, soft, and directly adjustable states.", Component: FeedbackVariants },
  { id: "frame", title: "Frame", description: "Frames create settings-style trays with header text, panel stacks, and footer notes.", Component: FrameVariants },
  { id: "heading", title: "Heading", description: "Level-aware headings for surface titles and subsection labels.", Component: HeadingVariants },
  { id: "input", title: "Input & Textarea", description: "Input groups combine fields, addons, inline actions, validation, and textarea chrome.", Component: InputVariants },
  { id: "menu", title: "Menu", description: "An account button opens a compact action menu with grouped and destructive items.", Component: MenuVariants },
  { id: "meter", title: "Meter", description: "Meters show passive usage and limit visuals with chunky tinted tracks.", Component: MeterVariants },
  { id: "number-field", title: "Number field", description: "Number fields pair formatted input with steppers and optional drag scrubbing.", Component: NumberFieldVariants },
  { id: "otp-field", title: "OTP field", description: "A six-digit verification field shows grouped cells with a centered separator.", Component: OtpFieldVariants },
  { id: "pagination", title: "Pagination", description: "Pagination balances previous, status, and next actions across the row.", Component: PaginationVariants },
  { id: "popover", title: "Popover", description: "Popovers show anchored floating panels for lightweight contextual content.", Component: PopoverVariants },
  { id: "popup", title: "Popup", description: "Popups preview modal, alert, and mobile drawer presentations from one responsive pattern.", Component: PopupVariants },
  { id: "preview-card", title: "Preview card", description: "Preview cards reveal linked people, projects, and docs in a hover-anchored panel.", Component: PreviewCardVariants },
  { id: "scroll-area", title: "Scroll area", description: "A bounded navigation list reveals overflow with a soft scroll fade.", Component: ScrollAreaVariants },
  { id: "select", title: "Select", description: "Base UI select with labels, grouped items, separators, disabled options, and origin-aware popup animation.", Component: SelectVariants },
  { id: "selection", title: "Selection", description: "Checkbox groups, radio groups, and switches show direct preference toggles in context.", Component: SelectionVariants },
  { id: "separator", title: "Separator & Kbd", description: "Horizontal, vertical, and labelled separators structure compact action rows.", Component: SeparatorVariants },
  { id: "sheet", title: "Sheet", description: "A settings button opens a right-side desktop panel with form controls.", Component: SheetVariants },
  { id: "slider", title: "Slider", Component: SliderVariants },
  { id: "table", title: "Table & DataTable", description: "A wide data table combines selection, filters, resizing, pagination, and horizontal scroll.", wide: true, Component: TableVariants },
  { id: "tabs", title: "Tabs", description: "A compact tab list switches between peer sections without crowding the card.", Component: TabsVariants },
  { id: "toolbar", title: "Toolbar", description: "Toolbars combine grouped toggles, separators, and one-off actions in a keyboardable row.", Component: ToolbarVariants },
  { id: "tooltip", title: "Tooltip", description: "Tooltips use inverse panels and side-aware motion for compact contextual hints.", Component: TooltipVariants },
];

export default function ComponentsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[color-mix(in_srgb,var(--background)_90%,var(--foreground)_4%)]">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border/80 bg-[color-mix(in_srgb,var(--background)_82%,var(--foreground)_5%)] px-4 py-3 backdrop-blur sm:px-6">
        <Link href="/" className="text-sm font-medium">← Template</Link>
        <span className="text-sm text-muted-foreground">Components</span>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Components</h1>
          <p className="text-muted-foreground">
            A working gallery of installed coss ui primitives, previewed with their real states, surfaces, and interaction patterns.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,42rem),1fr))] gap-6">
          {SECTIONS.map(({ Component, ...section }) => (
            <Section key={section.id} {...section}>
              <Component />
            </Section>
          ))}
        </div>
      </main>
    </div>
  );
}
