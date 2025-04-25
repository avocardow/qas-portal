import React from "react";
import { render, screen, act } from "@testing-library/react";
import useSearchService from "./useSearchService";
import { vi } from "vitest";

// Test component to utilize the hook
export function TestComponent({
  searchFn,
}: {
  searchFn: (term: string, _signal: AbortSignal) => Promise<string[]>;
}) {
  const { setSearchTerm, results, loading, error } = useSearchService<string[]>(
    searchFn,
    50
  );
  return (
    <>
      <button onClick={() => setSearchTerm("hello")}>search</button>
      <span data-testid="loading">{loading ? "loading" : "idle"}</span>
      <span data-testid="results">{JSON.stringify(results)}</span>
      <span data-testid="error">{error?.message || ""}</span>
    </>
  );
}

describe("useSearchService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces input and fetches results", async () => {
    const searchFn = vi.fn((term: string, _signal: AbortSignal) => {
      void _signal;
      return Promise.resolve([term]);
    });

    render(<TestComponent searchFn={searchFn} />);

    // Click search button to trigger setSearchTerm
    act(() => {
      screen.getByText("search").click();
    });

    // Initially, searchFn should not be called
    expect(searchFn).not.toHaveBeenCalled();

    // Advance timers to trigger the debounced call
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Now searchFn should be called
    expect(searchFn).toHaveBeenCalledWith("hello", expect.any(AbortSignal));

    // Run all pending promises
    await act(async () => {
      await Promise.resolve();
    });

    // Check the results
    expect(screen.getByTestId("loading").textContent).toBe("idle");
    expect(screen.getByTestId("results").textContent).toBe('["hello"]');
  });
});
