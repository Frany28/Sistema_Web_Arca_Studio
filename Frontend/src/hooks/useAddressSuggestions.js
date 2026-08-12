import { useCallback, useEffect, useMemo, useState } from "react";

import { searchAddressSuggestions } from "../utils/geoapify.js";

const EMPTY_RESULT = {
  error: "",
  query: "",
  status: "idle",
  suggestions: [],
};

export default function useAddressSuggestions({
  debounceMs = 180,
  enabled = true,
  query,
  selected = false,
} = {}) {
  const normalizedQuery = String(query || "").trim();
  const canSearch = enabled && !selected && normalizedQuery.length >= 2;
  const [result, setResult] = useState(EMPTY_RESULT);

  const clear = useCallback(() => {
    setResult(EMPTY_RESULT);
  }, []);

  useEffect(() => {
    if (!canSearch) {
      return undefined;
    }

    const requestQuery = normalizedQuery;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setResult({
        error: "",
        query: requestQuery,
        status: "searching",
        suggestions: [],
      });

      searchAddressSuggestions(requestQuery, { signal: controller.signal })
        .then((nextSuggestions) => {
          if (controller.signal.aborted) return;
          setResult({
            error: "",
            query: requestQuery,
            status: "complete",
            suggestions: nextSuggestions,
          });
        })
        .catch((requestError) => {
          if (requestError.name === "AbortError" || controller.signal.aborted) return;
          setResult({
            error: requestError.message,
            query: requestQuery,
            status: "error",
            suggestions: [],
          });
        });
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [canSearch, debounceMs, normalizedQuery]);

  return useMemo(() => {
    const belongsToCurrentQuery = canSearch && result.query === normalizedQuery;
    return {
      clear,
      error: belongsToCurrentQuery ? result.error : "",
      hasSearched: belongsToCurrentQuery && result.status === "complete",
      isSearching: belongsToCurrentQuery && result.status === "searching",
      suggestions: belongsToCurrentQuery ? result.suggestions : [],
    };
  }, [canSearch, clear, normalizedQuery, result]);
}
