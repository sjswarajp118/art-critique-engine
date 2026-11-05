import { expect, test } from "vitest";
import { APICallError, RetryError } from "ai";
import  { describeError, getProviderStatus } from "@/lib/errors";

function apiError(statusCode?: number) {
  return new APICallError({
    message: "fake",
    url: "https://example.test",
    requestBodyValues: { image: "SECRET-IMAGE-DATA" }, // planted on purpose
    statusCode,
    isRetryable: true,
  });
}

test("reads the status of a provider error", () => {
  expect(getProviderStatus(apiError(429))).toBe(429);
});

test("unwraps a RetryError", () => {
  const wrapped = new RetryError({
    message: "fake",
    reason: "errorNotRetryable",            // Go to Definition on RetryErrorReason and pick one of its values
    errors: [apiError(503)],
  });
  expect(getProviderStatus(wrapped)).toBe(503);
});

// cases 3, 4, 5: write these yourself. For "undefined", what matcher fits?

test("describeError never leaks the request body", () => {
  expect(describeError(apiError(401))).not.toContain("SECRET-IMAGE-DATA");
});


test("returns undefined when the provider error has no status", () => {
  expect(getProviderStatus(apiError())).toBeUndefined();
});

test("returns undefined for an ordinary Error", () => {
  expect(getProviderStatus(new Error("boom"))).toBeUndefined();
});

test("returns undefined for something that isn't an error at all", () => {
  expect(getProviderStatus("oops")).toBeUndefined();
});