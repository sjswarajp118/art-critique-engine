import { describe, test, expect } from "vitest";
import { selectRecentMessages } from "@/lib/chat";

const u = (n: number) => ({ id: `u${n}`, role: "user" });
const a = (n: number) => ({ id: `a${n}`, role: "assistant" });

describe("selectRecentMessages", () => {
  test("keeps everything when under the limit", () => {
    expect(selectRecentMessages([u(1), a(1), u(2)], 4)).toEqual([u(1), a(1), u(2)]);
  });
  test("drops a leading assistant message after trimming", () => { 
    expect(selectRecentMessages([u(1), a(1), u(2), a(2), u(3)], 4)).toEqual([u(2), a(2), u(3)]);
   });
  test("returns null when the last message is from the assistant", () => { 
    expect(selectRecentMessages([u(1), a(1), u(2), a(2)], 3)).toEqual(null);
  });
  test("keeps a single user message", () => { 
    expect(selectRecentMessages([u(1)], 3)).toEqual([u(1)]);
   });
});