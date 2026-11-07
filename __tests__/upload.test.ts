import { describe, test, expect } from "vitest";
import { validateFile, MAX_SIZE } from "@/lib/upload";

// Helper: builds a File with an exact size in bytes.
function makeFile(type: string, size: number): File {
  return new File([new Uint8Array(size)], "photo", { type });
}

describe("validateFile", () => {
  test("rejects a file over the limit", () => {
    const file = makeFile("image/jpeg", MAX_SIZE + 1);
    expect(validateFile(file)).toBe(`The image is too large. The limit is ${MAX_SIZE / 1024 / 1024} MB. Please choose a smaller image.`);
  });

  test("rejects a wrong file type", () => {
    // set up / do one thing / check one result
    expect(validateFile(makeFile("image/gif", 100))).toBe("Please choose JPEG, PNG, or WEBP image type.");
  });

  test("accepts a file of exactly the limit", () => {
    // set up / do one thing / check one result
    expect(validateFile(makeFile("image/png", MAX_SIZE))).toBe(null);
  });
});