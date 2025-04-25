import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
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
  it("debounces input and fetches results", async () => {
    vi.useFakeTimers();
    const searchFn = vi.fn((term: string, _signal: AbortSignal) => {
      void _signal;
      return Promise.resolve([term]);
    });
    render(<TestComponent searchFn={searchFn} />);
    act(() => {
      screen.getByText("search").click();
      vi.advanceTimersByTime(50);
    });
    expect(searchFn).toHaveBeenCalledWith("hello", expect.any(AbortSignal));
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("idle");
      expect(screen.getByTestId("results").textContent).toBe('["hello"]');
    });
    vi.useRealTimers();
  });
});
