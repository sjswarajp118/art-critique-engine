import { google } from "@ai-sdk/google";
import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, UIMessage } from "ai";

export async function POST(request: Request) {

   const {messages}: {messages :UIMessage[]} = await request.json();
   const result = streamText({
      model: google("gemini-3.1-flash-lite"),
      messages: await convertToModelMessages(messages),
      abortSignal: request.signal
   })

   return createUIMessageStreamResponse({
     stream: toUIMessageStream({stream: result.stream}),
   })

   // return Response.json({message:"Recieved", body : body});
}

