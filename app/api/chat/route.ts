import { CHAT_INSTRUCTIONS } from "@/lib/prompts";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, UIMessage } from "ai";

export async function POST(request: Request) {


   let body: unknown;
   try {
      body = await request.json();
   } catch {
      return Response.json({ error: "The request could not be read." }, { status: 400 });
   }
   const { messages } =body as { messages: UIMessage[] }
   const result = streamText({
      model: google("gemini-3.1-flash-lite"),
      instructions: CHAT_INSTRUCTIONS,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 400,
      abortSignal: request.signal
   })

   return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
   })

}

