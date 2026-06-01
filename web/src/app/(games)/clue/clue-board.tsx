"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getAnonymousKey } from "@/lib/anonymous-key";
import { GuessInput } from "@/components/games/guess-input";
import { ScoreBreakdownRow } from "@/components/games/score-breakdown";
import { getTodayPuzzle, submitGuess, type TodayResponse, type PriorGuess, type Puzzle, type Attempt, type ScoreBreakdown } from "@/app/actions/puzzles";

type ClueBoardProps = {
  initial: TodayResponse | null;
  initialError: string | null;
};

export const ClueBoard = (props: ClueBoardProps) => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(props.initial?.puzzle ?? null);
  const [attempt, setAttempt] = useState<Attempt | null>(props.initial?.attempt ?? null);
  const [guesses, setGuesses] = useState<PriorGuess[]>(props.initial?.guesses ?? []);
  const [errorText, setErrorText] = useState<string | null>(props.initialError);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const anonKey = useRef<string>("");

  useEffect(() => {
    anonKey.current = getAnonymousKey();
    let cancelled = false;
    startTransition(async () => {
      const res = await getTodayPuzzle("clue", anonKey.current);
      if (cancelled) return;
      if (!res.success) {
        setErrorText(res.error);
        return;
      }
      setPuzzle(res.data.puzzle);
      setAttempt(res.data.attempt ?? null);
      setGuesses(res.data.guesses ?? []);
      if (res.data.attempt?.status === "lost") {
        const last = res.data.guesses?.[res.data.guesses.length - 1];
        if (last?.result.nextClue?.answer) setRevealed(last.result.nextClue.answer);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!puzzle) return <ClueBoardSkeleton />;

  const cluesPayload = (puzzle.payload as { clues?: Clue[] }).clues ?? [];
  const visibleClueCount = Math.min(cluesPayload.length, (attempt?.guessesCount ?? 0) + 1);
  const status = attempt?.status ?? "started";
  const done = status !== "started";

  const submit = (raw: string, animeId: number | null) => {
    if (!raw.trim() || pending) return;
    setErrorText(null);
    startTransition(async () => {
      const res = await submitGuess(puzzle.id, raw, animeId, anonKey.current);
      if (!res.success) {
        setErrorText(res.error);
        return;
      }
      const next: PriorGuess = {
        position: (attempt?.guessesCount ?? 0) + 1,
        rawGuess: raw,
        result: res.result,
      };
      setGuesses((g) => [...g, next]);
      setAttempt((a) => ({
        id: a?.id ?? 0,
        status: res.result.status,
        score: a?.score ?? 0,
        guessesCount: (a?.guessesCount ?? 0) + 1,
      }));
      if (res.result.nextClue?.answer) setRevealed(res.result.nextClue.answer);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <ClueStack clues={cluesPayload} visible={visibleClueCount} status={status} />

      {guesses.length > 0 ? (
        <ul className="flex flex-col gap-1.5 text-sm">
          {guesses.map((g) => (
            <li
              key={g.position}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2",
                g.result.correct
                  ? "border-success/50 bg-success/10 text-success-foreground"
                  : "border-border bg-muted/40 text-muted-foreground",
              )}
            >
              <span className="font-medium text-foreground">{g.rawGuess}</span>
              <span className="text-xs">{g.result.correct ? "correct" : "wrong"}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {!done ? (
        <GuessInput onSubmit={submit} disabled={pending} />
      ) : (
        <ResultPanel
          status={status}
          score={attempt?.score ?? 0}
          guessCount={attempt?.guessesCount ?? 0}
          maxGuesses={puzzle.payload.maxGuesses}
          revealed={revealed}
          breakdown={attempt?.breakdown}
        />
      )}

      {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}
    </div>
  );
};

type Clue = { type: string; value: string };

type ClueStackProps = {
  clues: Clue[];
  visible: number;
  status: "started" | "won" | "lost";
};

const ClueStack = (props: ClueStackProps) => {
  return (
    <ol className="flex flex-col gap-2">
      {props.clues.map((clue, idx) => {
        const shown = idx < props.visible || props.status !== "started";
        return (
          <li
            key={idx}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-opacity",
              shown ? "border-border bg-card text-foreground opacity-100" : "border-dashed border-border/60 bg-muted/20 text-muted-foreground opacity-60",
            )}
          >
            <Badge appearance="soft" className="shrink-0 font-mono">
              {idx + 1}
            </Badge>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {clue.type.replace(/_/g, " ")}
            </span>
            <span className="ms-auto font-medium">{shown ? clue.value : "locked"}</span>
          </li>
        );
      })}
    </ol>
  );
};

type ResultPanelProps = {
  status: "won" | "lost";
  score: number;
  guessCount: number;
  maxGuesses: number;
  revealed: string | null;
  breakdown?: ScoreBreakdown;
};

const ResultPanel = (props: ResultPanelProps) => {
  const emoji = buildEmojiRow(props.status, props.guessCount, props.maxGuesses);
  const headline =
    props.status === "won"
      ? `nailed it in ${props.guessCount}/${props.maxGuesses}`
      : `X/${props.maxGuesses}, the answer was ${props.revealed ?? "hidden"}`;
  const share = `onepiece clue ${props.status === "won" ? `${props.guessCount}` : "X"}/${props.maxGuesses}\n${emoji}`;

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
      <p className="font-mono text-xl tracking-tight">{emoji}</p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">score</span>
        <Badge appearance="soft">{props.score}</Badge>
        <Button className="ms-auto" onClick={copy}>
          copy share
        </Button>
      </div>
      {props.breakdown && props.status === "won" ? <ScoreBreakdownRow breakdown={props.breakdown} /> : null}
    </div>
  );
};

const ClueBoardSkeleton = () => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full rounded-lg" />
    ))}
    <div className="flex items-center gap-2 pt-2">
      <Spinner />
      <span className="text-sm text-muted-foreground">loading today's puzzle</span>
    </div>
  </div>
);

const buildEmojiRow = (status: "won" | "lost", count: number, max: number): string => {
  let row = "";
  if (status === "won") {
    for (let i = 0; i < count - 1; i++) row += "⬛";
    row += "🟩";
  } else {
    for (let i = 0; i < max; i++) row += "⬛";
  }
  return row;
};
