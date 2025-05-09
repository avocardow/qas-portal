// src/utils/error.ts
// Utility functions to extract and handle errors from API interactions

/**
 * Extracts a user-friendly message from an unknown error.
 * @param error - The error thrown during an API interaction
 * @returns A string message suitable for displaying to users
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Wraps a promise and returns a tuple of [error, data].
 * Useful for avoiding try/catch in async functions.
 * @param promise - The promise to wrap
 * @returns A tuple where the first element is an Error or null, and the second is the resolved value or undefined
 */
export async function to<T>(
  promise: Promise<T>
): Promise<[Error | null, T | undefined]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), undefined];
  }
} 