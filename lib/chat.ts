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