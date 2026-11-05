import { expect, test } from "vitest";
import { judgeRatio, type RatioJudgement } from "@/lib/ratioGuide";

const cases: { ratio: number | null; frontFacing: boolean; expected: RatioJudgement }[] = [
  { ratio: 0.8, frontFacing: true, expected: "nothing-unusual" },
  { ratio: 1.38, frontFacing:true, expected: "unusual" },
  { ratio: 1.38, frontFacing:false, expected: "not-front-facing" },
  { ratio: 0.39, frontFacing:true, expected: "nothing-unusual" },
  { ratio: 1.04, frontFacing:true, expected: "nothing-unusual" },
  { ratio: null, frontFacing:true, expected: "not-measured" },
  { ratio: null, frontFacing:false, expected: "not-front-facing" },
  { ratio: NaN, frontFacing:true, expected: "not-measured" },
  { ratio: Infinity, frontFacing:true, expected: "not-measured" },
];

test.each(cases)(
  "judgeRatio($ratio, $frontFacing) -> $expected",
  ({ ratio, frontFacing, expected }) => {
    expect(judgeRatio(ratio, frontFacing)).toBe(expected);
  }
);



