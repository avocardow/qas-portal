import { useState, useEffect, useRef } from "react";
import useDebounce from "@/hooks/useDebounce";

/**
 * Search service hook that handles debounced queries, loading state,
 * cancellation of in-flight requests, and error handling.
 */
export default function useSearchService<T>(
  searchFn: (term: string, signal: AbortSignal) => Promise<T>,
  delay: number = 300
) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTerm = useDebounce(searchTerm, delay);
  const [results, setResults] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (debouncedTerm === "") {
      setResults(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    searchFn(debouncedTerm, controller.signal)
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error(String(err)));
        }
        setLoading(false);
      });
  }, [debouncedTerm, searchFn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return { searchTerm, setSearchTerm, results, loading, error };
}
