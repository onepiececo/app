"use client";

import { useId, useState } from "react";
import type React from "react";
import { Check, Copy, FileCode, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { tv } from "tailwind-variants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CodeBlockTab = {
  label: string;
  code: string;
  lang: string;
  html: string;
};

type CodeBlockChromeProps = {
  tabs: CodeBlockTab[];
  picker: "tabs" | "select" | "filename";
  filename?: string;
  className?: string;
};

export const codeBlockChromeVariants = tv({
  slots: {
    header:
      "flex h-9 items-center gap-2 border-border border-b bg-[linear-gradient(180deg,var(--popover),color-mix(in_srgb,var(--foreground)_3%,var(--popover)))] px-3",
    filename: "font-mono text-foreground/80 text-xs",
    tabsRow: "flex items-center gap-0.5 overflow-x-auto",
    tab: "relative inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 font-mono text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
    tabIndicator: "absolute inset-0 rounded-md bg-muted",
    tabLabel: "relative z-10",
    selectValue: "font-mono text-xs",
    selectItem: "flex items-center gap-2",
    icon: "size-3.5",
    iconLanguage: "size-3.5",
    iconFallback: "size-3.5 opacity-70",
    iconTab: "relative z-10 size-3.5",
    iconSelect: "size-3.5",
    iconCopy: "inline-grid place-items-center",
    codeArea:
      "overflow-auto bg-neutral-100 px-3 py-3 font-mono text-xs leading-5 dark:bg-neutral-900 [&_.shiki]:bg-transparent! [&_.shiki]:outline-none [&_pre]:m-0 [&_pre]:bg-transparent! [&_pre]:outline-none [&_.shiki[data-line-numbers]_[data-line]::before]:hidden",
    copyButton: "ml-auto",
  },
  variants: {
    active: {
      true: {
        tab: "text-foreground",
      },
      false: {
        tab: "text-muted-foreground hover:text-foreground",
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

const codeBlockChromeStyles = codeBlockChromeVariants();

type LanguageBadge = {
  bg: string;
  fg: string;
  text: string;
};

const languageBadge = (lang: string): LanguageBadge | "shell" | null => {
  switch (lang.toLowerCase()) {
    case "ts":
    case "tsx":
    case "typescript":
      return { bg: "#3178c6", fg: "#ffffff", text: "TS" };
    case "js":
    case "jsx":
    case "javascript":
      return { bg: "#f7df1e", fg: "#111827", text: "JS" };
    case "py":
    case "python":
      return { bg: "#3776ab", fg: "#ffd43b", text: "Py" };
    case "rs":
    case "rust":
      return { bg: "#ce422b", fg: "#ffffff", text: "Rs" };
    case "go":
      return { bg: "#00add8", fg: "#ffffff", text: "Go" };
    case "html":
      return { bg: "#e34f26", fg: "#ffffff", text: "H" };
    case "css":
      return { bg: "#1572b6", fg: "#ffffff", text: "C" };
    case "json":
      return { bg: "#737373", fg: "#ffffff", text: "{}" };
    case "md":
    case "mdx":
    case "markdown":
      return { bg: "#0a0a0a", fg: "#ffffff", text: "M" };
    case "sql":
      return { bg: "#00758f", fg: "#ffffff", text: "Sq" };
    case "sh":
    case "bash":
    case "shell":
    case "zsh":
      return "shell";
    default:
      return null;
  }
};

const LangBadge = (props: LanguageBadge & {
  className?: string;
}) => (
  <svg
    viewBox="0 0 16 16"
    aria-hidden="true"
    className={codeBlockChromeStyles.iconLanguage({ class: props.className })}
  >
    <rect x="0" y="0" width="16" height="16" rx="3" fill={props.bg} />
    <text
      x="8"
      y="11.5"
      textAnchor="middle"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
      fontSize="7.5"
      fontWeight="800"
      fill={props.fg}
      letterSpacing="-0.3"
    >
      {props.text}
    </text>
  </svg>
);

type IconProps = { className?: string };

const ShIcon = (p: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    aria-hidden="true"
    className={codeBlockChromeStyles.iconLanguage({ class: p.className })}
  >
    <rect x="0" y="0" width="16" height="16" rx="3" fill="#1f2937" />
    <path
      d="M3.5 5.5l2.5 2.5-2.5 2.5"
      stroke="#10b981"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M7.5 11h4"
      stroke="#10b981"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const FallbackIcon = (p: IconProps) => (
  <FileCode className={codeBlockChromeStyles.iconFallback({ class: p.className })} />
);

const LanguageIcon = (props: IconProps & { lang: string }) => {
  const badge = languageBadge(props.lang);
  if (badge === "shell") return <ShIcon className={props.className} />;
  if (badge) return <LangBadge {...badge} className={props.className} />;
  return <FallbackIcon className={props.className} />;
};

export const CodeBlockChrome = (props: CodeBlockChromeProps) => {
  const first = props.tabs[0];
  if (!first) return null;
  if (props.picker === "filename") {
    return (
      <Card className={props.className}>
        <header className={codeBlockChromeStyles.header()}>
          <span className={codeBlockChromeStyles.filename()}>
            {props.filename ?? first.label}
          </span>
          <div className={codeBlockChromeStyles.copyButton()}>
            <CopyButton code={first.code} />
          </div>
        </header>
        <CodeArea html={first.html} />
      </Card>
    );
  }
  if (props.picker === "select") {
    return <SelectPickerCard tabs={props.tabs} className={props.className} />;
  }
  return (
    <TabsCard
      tabs={props.tabs}
      filename={props.filename}
      className={props.className}
    />
  );
};

const TabsCard = (props: {
  tabs: CodeBlockTab[];
  filename?: string;
  className?: string;
}) => {
  const [active, setActive] = useState(props.tabs[0]?.label ?? "");
  const layoutId = useId();
  const current = props.tabs.find((t) => t.label === active) ?? props.tabs[0];
  if (!current) return null;
  const tabsRow = (
    <div className={codeBlockChromeStyles.tabsRow()}>
      {props.tabs.map((t) => {
        const isActive = t.label === current.label;
        const tabStyles = codeBlockChromeVariants({ active: isActive });
        return (
          <button
            key={t.label}
            type="button"
            onClick={() => setActive(t.label)}
            className={tabStyles.tab()}
          >
            {isActive ? (
              <motion.span
                layoutId={layoutId}
                className={codeBlockChromeStyles.tabIndicator()}
                transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
              />
            ) : null}
            <LanguageIcon lang={t.lang} className={codeBlockChromeStyles.iconTab()} />
            <span className={codeBlockChromeStyles.tabLabel()}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
  return (
    <Card className={props.className}>
      <header className={codeBlockChromeStyles.header()}>
        {props.filename ? (
          <>
            <span className={codeBlockChromeStyles.filename()}>
              {props.filename}
            </span>
            <div className={codeBlockChromeStyles.copyButton()}>{tabsRow}</div>
          </>
        ) : (
          <div>{tabsRow}</div>
        )}
        <CopyButton
          code={current.code}
          className={props.filename ? undefined : codeBlockChromeStyles.copyButton()}
        />
      </header>
      <CodeArea html={current.html} />
    </Card>
  );
};

const SelectPickerCard = (props: {
  tabs: CodeBlockTab[];
  className?: string;
}) => {
  const [active, setActive] = useState(props.tabs[0]?.label ?? "");
  const current = props.tabs.find((t) => t.label === active) ?? props.tabs[0];
  if (!current) return null;
  return (
    <Card className={props.className}>
      <header className={codeBlockChromeStyles.header()}>
        <Select
          value={active}
          onValueChange={(v) => v && setActive(String(v))}
        >
          <SelectTrigger size="sm" className="w-fit">
            <LanguageIcon lang={current.lang} className={codeBlockChromeStyles.iconSelect()} />
            <SelectValue>
              {() => (
                <span className={codeBlockChromeStyles.selectValue()}>{current.label}</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectPopup>
            {props.tabs.map((t) => {
              return (
                <SelectItem key={t.label} value={t.label}>
                  <span className={codeBlockChromeStyles.selectItem()}>
                    <LanguageIcon lang={t.lang} className={codeBlockChromeStyles.iconSelect()} />
                    <span className={codeBlockChromeStyles.selectValue()}>{t.label}</span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectPopup>
        </Select>
        <div className={codeBlockChromeStyles.copyButton()}>
          <CopyButton code={current.code} />
        </div>
      </header>
      <CodeArea html={current.html} />
    </Card>
  );
};

const CodeArea = (props: { html: string }) => (
  <div
    className={codeBlockChromeStyles.codeArea()}
    // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted server-rendered Shiki output
    dangerouslySetInnerHTML={{ __html: props.html }}
  />
);

type CopyState = "idle" | "done" | "error";

const ICON_TRANSITION = { duration: 0.15, ease: "easeOut" as const };
const ICON_VARIANTS = {
  initial: { opacity: 0, scale: 0.8, filter: "blur(2px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.8 },
};

const CopyButton = (props: { code: string; className?: string }) => {
  const [state, setState] = useState<CopyState>("idle");
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.code);
      setState("done");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 1500);
  };
  return (
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label={
        state === "done"
          ? "Copied"
          : state === "error"
            ? "Copy failed"
            : "Copy"
      }
      onClick={onCopy}
      className={props.className}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {state === "idle" ? (
          <motion.span
            key="idle"
            className={codeBlockChromeStyles.iconCopy()}
            {...ICON_VARIANTS}
            transition={ICON_TRANSITION}
          >
            <Copy />
          </motion.span>
        ) : state === "done" ? (
          <motion.span
            key="done"
            className={codeBlockChromeStyles.iconCopy()}
            {...ICON_VARIANTS}
            transition={ICON_TRANSITION}
          >
            <Check strokeWidth={3} />
          </motion.span>
        ) : (
          <motion.span
            key="error"
            className={codeBlockChromeStyles.iconCopy()}
            {...ICON_VARIANTS}
            transition={ICON_TRANSITION}
          >
            <X />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
};
