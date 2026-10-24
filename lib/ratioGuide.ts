import { Proportions } from "./geometry";

export const RATIO_GUIDE = {
    low: 0.39,
    high: 1.04,
} as const;

export const RATIO_JUDGEMENTS = [
    "not-front-facing",
    "not-measured",
    "unusual",
    "nothing-unusual"
]

// lib/ratioGuide.ts (or measureTool.ts)
export const ALLOWED_MEASUREMENTS: Record<RatioJudgement,  readonly (keyof Proportions)[]> = {
  "unusual":          ["tiltDegrees", "eyeToNoseOverNoseToJaw"],
  "nothing-unusual":  ["tiltDegrees", "eyeToNoseOverNoseToJaw", "eyeDistance", "eyeToNoseDistance", "noseToJawDistance"],
  "not-front-facing": ["tiltDegrees"],
  "not-measured":     ["tiltDegrees"],
};

export function judgeRatio(ratio: number | null, frontFacing: boolean): RatioJudgement {
    if (!frontFacing) return "not-front-facing";
    if (ratio === null) return "not-measured";
    if (ratio < RATIO_GUIDE.low || ratio > RATIO_GUIDE.high) return "unusual";
    return "nothing-unusual";
}

export type RatioJudgement = (typeof RATIO_JUDGEMENTS)[number];