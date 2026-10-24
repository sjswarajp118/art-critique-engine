import { generateText, isStepCount, Output } from "ai";
import { google } from "@ai-sdk/google";
import { critiqueSchema, type Landmarks } from "@/lib/schemas";
import { artTeacherPrompt, buildInstructions } from "@/lib/prompts";
import type { Proportions } from "./geometry";
import { makeMeasureTool } from "./measureTool";
import { ALLOWED_MEASUREMENTS, RatioJudgement } from "./ratioGuide";


const MAX_TOOL_STEPS = 3;

export async function generateCritique(
  bytes: ArrayBuffer,
  proportions: Proportions,
  judgement: RatioJudgement
) {
  const result = await generateText({
    model: google("gemini-3.1-flash-lite"),
    instructions: buildInstructions(judgement),
    tools: { measure: makeMeasureTool(proportions, ALLOWED_MEASUREMENTS[judgement]) },
    stopWhen: isStepCount(5),
    prepareStep:({stepNumber}) => {
      if(stepNumber >= MAX_TOOL_STEPS) {
        return {toolChoice: "none"};
      }
      return {}
    },
    output: Output.object({ schema: critiqueSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Please critique this image: without including the number of coordinates or landmarks" },
          { type: "file", mediaType: "image", data: bytes },
        ],
      },
    ],
  });

  // Note: no try/catch in this function on purpose.
  // If the model call or the schema check fails, it THROWS and the route decides what to do.
  return result.output;
}


