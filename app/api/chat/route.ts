import { describeError } from "@/lib/errors";
import { CHAT_INSTRUCTIONS } from "@/lib/prompts";
import { chatRequestSchema } from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream} from "ai";

export async function POST(request: Request) {


   let body: unknown;
   try {
      body = await request.json();
   } catch {
      return Response.json({ error: "The request could not be read." }, { status: 400 });
   }

   const parsed = chatRequestSchema.safeParse(body);
   if (!parsed.success) {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
   }
   const messages = parsed.data.messages;

   const result = streamText({
      model: google("gemini-3.1-flash-lite"),
      instructions: CHAT_INSTRUCTIONS,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 400,
      abortSignal: request.signal,

         onError: ({ error }) => {
         console.error("Chat failed:", describeError(error));
      },
   })

   return createUIMessageStreamResponse({
      stream: toUIMessageStream({
         stream: result.stream,
      }),
   })

}

