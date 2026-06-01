"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { serverFetch, serverJSON } from "@/lib/server-client";
import { getAnonymousKey } from "@/lib/anonymous-key";
import { GuessInput } from "@/components/games/guess-input";

const CATEGORY_LABELS: Record<string, string> = {
  format: "format",
  year: "year",
  episodes: "eps",
  score: "score",
  source: "source",
  studios: "studios",
  genres: "genres",
};

type Puzzle = {
  id: number;
  puzzleDate?: string;
  payload: {
    game: string;
    maxGuesses: number;
    categories: string[];
  };
};

type Attempt = {
  id: number;
  status: "started" | "won" | "lost";
  score: number;
  guessesCount: number;
};

type Field = {
  value: unknown;
  match: "match" | "close" | "none";
  direction?: "up" | "down";
  shared?: string[];
};

type Compare = Record<string, Field>;

type PriorGuess = {
  position: number;
  rawGuess: string;
  result: {
    correct: boolean;
    status: string;
    detail?: Compare;
    nextClue?: { answer?: string; slug?: string };
  };
};

type TodayResponse = {
  puzzle: Puzzle;
  attempt?: Attempt;
  guesses?: PriorGuess[];
};

type GuessResultResp = {
  correct: boolean;
  status: "started" | "won" | "lost";
  guessesLeft: number;
  detail?: Compare;
  nextClue?: { answer?: string; slug?: string };
};

export const WordleBoard = () => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [guesses, setGuesses] = useState<PriorGuess[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);
  const anonKey = useRef<string>("");

  useEffect(() => {
    anonKey.current = getAnonymousKey();
    let cancelled = false;
    serverJSON<TodayResponse>("/v1/puzzles/today?game=wordle", {
      headers: { "X-Anonymous-Key": anonKey.current },
    })
      .then((res) => {
        if (cancelled) return;
        setPuzzle(res.puzzle);
        setAttempt(res.attempt ?? null);
        setGuesses(res.guesses ?? []);
        if (res.attempt?.status === "lost") {
          const last = res.guesses?.[res.guesses.length - 1];
          if (last?.result.nextClue?.answer) setRevealed(last.result.nextClue.answer);
        }
      })
      .catch((err) => {
        if (!cancelled) setErrorText(err instanceof Error ? err.message : "failed to load puzzle");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !puzzle) return <BoardSkeleton categories={7} />;

  const status = attempt?.status ?? "started";
  const done = status !== "started";
  const categories = puzzle.payload.categories;

  const submit = async (raw: string, animeId: number | null) => {
    if (!raw.trim() || submitting) return;
    setSubmitting(true);
    setErrorText(null);
    try {
      const res = await serverFetch(`/v1/puzzles/${puzzle.id}/guesses`, {
        method: "POST",
        headers: { "X-Anonymous-Key": anonKey.current },
        body: JSON.stringify({ rawGuess: raw, animeId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "guess failed" }));
        setErrorText(typeof body.message === "string" ? body.message : "guess failed");
        return;
      }
      const result = (await res.json()) as GuessResultResp;
      const nextGuess: PriorGuess = {
        position: (attempt?.guessesCount ?? 0) + 1,
        rawGuess: raw,
        result,
      };
      setGuesses((g) => [...g, nextGuess]);
      setAttempt((a) => ({
        id: a?.id ?? 0,
        status: result.status,
        score: a?.score ?? 0,
        guessesCount: (a?.guessesCount ?? 0) + 1,
      }));
      if (result.nextClue?.answer) setRevealed(result.nextClue.answer);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <CategoryHeader categories={categories} />

      <div className="flex flex-col gap-2">
        {guesses.map((g) => (
          <GuessRow key={g.position} guess={g} categories={categories} />
        ))}
        {Array.from({ length: Math.max(0, puzzle.payload.maxGuesses - guesses.length) }).map((_, i) => (
          <EmptyRow key={`empty-${i}`} categories={categories} />
        ))}
      </div>

      {!done ? (
        <GuessInput onSubmit={submit} disabled={submitting} />
      ) : (
        <ResultPanel
          status={status}
          score={attempt?.score ?? 0}
          guessCount={attempt?.guessesCount ?? 0}
          maxGuesses={puzzle.payload.maxGuesses}
          revealed={revealed}
          guesses={guesses}
          categories={categories}
        />
      )}

      {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}
    </div>
  );
};

type CategoryHeaderProps = { categories: string[] };

const CategoryHeader = (props: CategoryHeaderProps) => (
  <div
    className="grid gap-1 text-[10px] uppercase tracking-wide text-muted-foreground"
    style={{ gridTemplateColumns: `minmax(0,1.8fr) repeat(${props.categories.length}, minmax(0,1fr))` }}
  >
    <span>guess</span>
    {props.categories.map((c) => (
      <span key={c} className="text-center">{CATEGORY_LABELS[c] ?? c}</span>
    ))}
  </div>
);

type GuessRowProps = {
  guess: PriorGuess;
  categories: string[];
};

const GuessRow = (props: GuessRowProps) => {
  const compare = props.guess.result.detail;
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `minmax(0,1.8fr) repeat(${props.categories.length}, minmax(0,1fr))` }}
    >
      <div className="flex items-center rounded-md border bg-card px-3 py-1.5 text-sm font-medium">
        <span className="truncate">{props.guess.rawGuess}</span>
        {props.guess.result.correct ? (
          <Badge appearance="soft" className="ms-auto text-[10px]">correct</Badge>
        ) : null}
      </div>
      {props.categories.map((cat) => (
        <Cell key={cat} field={compare?.[cat]} correct={props.guess.result.correct} />
      ))}
    </div>
  );
};

type CellProps = {
  field?: Field;
  correct: boolean;
};

const Cell = (props: CellProps) => {
  const match = props.correct ? "match" : (props.field?.match ?? "none");
  const bg = match === "match"
    ? "bg-success/25 border-success/60 text-success-foreground"
    : match === "close"
      ? "bg-warning/20 border-warning/50 text-warning-foreground"
      : "bg-muted/40 border-border text-muted-foreground";

  let display = "—";
  if (props.field) {
    const v = props.field.value;
    if (Array.isArray(v)) {
      display = v.length > 0 ? v.slice(0, 2).join(", ") + (v.length > 2 ? "+" : "") : "—";
    } else if (v != null) {
      display = String(v);
    }
  }
  const dir = props.field?.direction === "up" ? "↑" : props.field?.direction === "down" ? "↓" : "";

  return (
    <div className={cn("flex flex-col items-center justify-center gap-0.5 rounded-md border px-2 py-1.5", bg)}>
      <span className="truncate text-xs font-medium leading-tight">{display}</span>
      {dir ? <span className="text-[10px] leading-none">{dir}</span> : null}
    </div>
  );
};

type EmptyRowProps = { categories: string[] };

const EmptyRow = (props: EmptyRowProps) => (
  <div
    className="grid gap-1 opacity-40"
    style={{ gridTemplateColumns: `minmax(0,1.8fr) repeat(${props.categories.length}, minmax(0,1fr))` }}
  >
    <div className="h-9 rounded-md border border-dashed bg-muted/20" />
    {props.categories.map((c) => (
      <div key={c} className="h-9 rounded-md border border-dashed bg-muted/20" />
    ))}
  </div>
);

type ResultPanelProps = {
  status: "won" | "lost";
  score: number;
  guessCount: number;
  maxGuesses: number;
  revealed: string | null;
  guesses: PriorGuess[];
  categories: string[];
};

const ResultPanel = (props: ResultPanelProps) => {
  const headline = props.status === "won"
    ? `nailed it in ${props.guessCount}/${props.maxGuesses}`
    : `X/${props.maxGuesses}, the answer was ${props.revealed ?? "hidden"}`;

  const emojiRows: string[] = [];
  for (const g of props.guesses) {
    let row = "";
    for (const cat of props.categories) {
      if (g.result.correct) {
        row += "🟩";
      } else {
        const m = g.result.detail?.[cat]?.match ?? "none";
        row += m === "match" ? "🟩" : m === "close" ? "🟨" : "⬛";
      }
    }
    emojiRows.push(row);
  }
  const share = `onepiece wordle ${props.status === "won" ? props.guessCount : "X"}/${props.maxGuesses}\n${emojiRows.join("\n")}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(share);
    } catch {
      // user can manually select the text
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <p className="text-base font-semibold text-foreground">{headline}</p>
      <pre className="whitespace-pre-wrap font-mono text-xl leading-tight tracking-tight">{emojiRows.join("\n")}</pre>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">score</span>
        <Badge appearance="soft">{props.score}</Badge>
        <Button className="ms-auto" onClick={copy}>copy share</Button>
      </div>
    </div>
  );
};

type BoardSkeletonProps = { categories: number };

const BoardSkeleton = (props: BoardSkeletonProps) => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="grid gap-1" style={{ gridTemplateColumns: `minmax(0,1.8fr) repeat(${props.categories}, minmax(0,1fr))` }}>
        <Skeleton className="h-9 rounded-md" />
        {Array.from({ length: props.categories }).map((_, j) => (
          <Skeleton key={j} className="h-9 rounded-md" />
        ))}
      </div>
    ))}
    <div className="flex items-center gap-2 pt-2">
      <Spinner />
      <span className="text-sm text-muted-foreground">loading today's wordle</span>
    </div>
  </div>
);
