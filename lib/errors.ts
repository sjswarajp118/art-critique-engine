import { APICallError, RetryError } from "ai";

export function describeError(error: unknown): string {
  if (RetryError.isInstance(error)) {
    return describeError(error.lastError);
  }
  if (APICallError.isInstance(error)) {
    return `provider error: status ${error.statusCode}, retryable ${error.isRetryable}`;
      }
  if (error instanceof Error) return error.name;
  return "unknown error";
}

 
export  function getProviderStatus(error: unknown): number | undefined {
  if (RetryError.isInstance(error)) {
    return getProviderStatus(error.lastError);
  }
  if (APICallError.isInstance(error)) {
    return error.statusCode;
  }
  return undefined;
}