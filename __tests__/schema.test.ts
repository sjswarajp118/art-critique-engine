import { expect, test } from "vitest";
import { frontFacingSchema } from "@/lib/schemas";

test.each([
  { input: "true", expected: true },
  { input: "false", expected: false },
])("accepts $input and gives $expected", ({ input, expected }) => {
  const result = frontFacingSchema.safeParse(input);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toBe(expected);
  }
});


test.each(["", "banana", "TRUE"])("rejects %s", (input) => {
  expect(frontFacingSchema.safeParse(input).success).toBe(false);
});