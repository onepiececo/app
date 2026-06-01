import { Badge } from "@/components/ui/badge";
import type { ScoreBreakdown } from "@/app/actions/puzzles";

type ScoreBreakdownProps = {
  breakdown: ScoreBreakdown;
};

export const ScoreBreakdownRow = (props: ScoreBreakdownProps) => {
  const b = props.breakdown;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <span>{b.base} base</span>
      <span aria-hidden>×</span>
      <Badge appearance="soft" className="font-mono">{`${b.multiplier} ${b.tier}`}</Badge>
      {b.speedBonus > 0 ? (
        <>
          <span aria-hidden>+</span>
          <span>{b.speedBonus} speed</span>
        </>
      ) : null}
      <span aria-hidden>=</span>
      <span className="font-semibold text-foreground">{b.total}</span>
    </div>
  );
};
