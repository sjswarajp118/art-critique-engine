import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import {  critiqueSchema, type Landmarks } from "@/lib/schemas";
import { artTeacherPrompt } from "@/lib/prompts";
 
// Takes CHECKED values only. The route has already run every guard.
export async function generateCritique(
  bytes: ArrayBuffer,            // what type does `await file.arrayBuffer()` give back?
  landmarks: Landmarks   // the type that comes from the schema (z.infer)
) {
  const { output } = await generateText({
    model: google("gemini-3.1-flash-lite"),
    instructions: artTeacherPrompt,   // which constant holds the art-teacher text?
    output: Output.object({ schema: critiqueSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `Landmarks: ${JSON.stringify(landmarks)}` },
          { type: "file", mediaType: "image", data: bytes },
        ],
      },
    ],
  });
 
  // Note: no try/catch in this function on purpose.
  // If the model call or the schema check fails, it THROWS and the route decides what to do.
  return output;
}