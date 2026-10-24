import { measureProportions } from "./geometry"
import { lookupMeasurement } from "./measure";
import { z } from "zod";

// const landmarks = {
//     rightEye: { x: 0.5180, y: 0.3971 },
//     leftEye: { x: 0.3028, y: 0.4305 },
//     nose: { x: 0.3469, y: 0.4862 },
//     jaw: { x: 0.4167, y: 0.6169 },
// }

const landmarks = {
    jaw: { x: 0.3942192792892456, y: 0.48021817207336426 },
    leftEye: { x: 0.2964726686477661, y: 0.2756193280220032 },
    nose: { x: 0.3512647747993469, y: 0.36649996042251587 },
    rightEye: { x: 0.5091473460197449, y: 0.28362035751342773 }
}


const schema = z.coerce.boolean();


const frontFacingSchema = z
    .enum(["true", "false"])
    .transform((value) => value === "true");


console.log(frontFacingSchema.safeParse("true"))
console.log(frontFacingSchema.safeParse("false"))

console.log(frontFacingSchema.safeParse("banana"))


console.log(schema.parse("false"));
console.log(schema.parse("true"));
console.log(schema.parse(""));
console.log(schema.parse("banana"));


// lib/ratioGuide.ts
export const RATIO_GUIDE = {
  low: 0.39,
  high: 1.04,
  // source: 9 front-facing real photos, range 0.49–0.94.
  // widened by 0.10 on each side because slight pose changes slip past the
  // student's front-facing choice and the sample is small. A rough guide, not a standard.
} as const;

export type RatioJudgement =  "not-front-facing" | "not-measured" | "unusual" | "nothing-unusual";
export function judgeRatio(ratio: number | null, frontFacing: boolean): RatioJudgement {
  if (!frontFacing) return "not-front-facing";
  if (ratio === null) return "not-measured";
  if (ratio < RATIO_GUIDE.low || ratio > RATIO_GUIDE.high) return "unusual";
  return "nothing-unusual";
}

console.log(judgeRatio(0.45, true))
console.log(judgeRatio(1.10, true))
console.log(judgeRatio(0.70, false))
console.log(judgeRatio(null, true))


const p = measureProportions(landmarks, 1392, 1952);

const levelFace = { ...p, tiltDegrees: 0 };
const noRatio = { ...p, eyeToNoseOverNoseToJaw: null };
console.log(lookupMeasurement(p, "tiltDegrees").value);
console.log(lookupMeasurement(p, "eyeToNoseOverNoseToJaw").value);

// console.log(lookupMeasurement(noRatio, "eyeToNoseOverNoseToJaw"))
// console.log(lookupMeasurement(levelFace, "tiltDegrees"));

