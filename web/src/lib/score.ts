// The six-stop scale shared by the Dial gauge and every score readout, red for weak up to dark green for excellent.
const SCORE_COLORS = ["#ef4444", "#f97316", "#facc15", "#a3e635", "#4ade80", "#22c55e"];
const SCORE_BUCKETS = [16, 33, 50, 66, 83, 100];

// scoreColor maps a 0-100 score to its hex on the scale, the same buckets the Dial lights its segments by.
export const scoreColor = (score: number): string => {
  const i = SCORE_BUCKETS.findIndex((t) => score <= t);
  return SCORE_COLORS[i === -1 ? SCORE_COLORS.length - 1 : i];
};
