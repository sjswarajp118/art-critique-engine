// Up to this many messages are taken from the END of the conversation.
// The conversation ends on a user message, so the first of these is
// usually an assistant message, which is dropped. The model usually
// gets 9 messages.
export const CHAT_CONTEXT_MESSAGES = 10;

export function selectRecentMessages<T extends { role: string }>(
  messages: T[],
  limit: number
): T[] | null {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") return null;

  let recent = messages.slice(-limit);
  while (recent.length > 0 && recent[0].role !== "user") {
    recent = recent.slice(1);
  }
  return recent;
}