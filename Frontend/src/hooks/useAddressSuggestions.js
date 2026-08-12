import { useCallback, useEffect, useState } from "react";

import { searchAddressSuggestions } from "../utils/geoapify.js";

export default function useAddressSuggestions({
  debounceMs = 180,
  enabled = true,
  query,
  selected = false,
} = {}) {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError("");
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const normalizedQuery = String(query || "").trim();
    if (!enabled || selected || normalizedQuery.length < 2) {
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      searchAddressSuggestions(normalizedQuery, { signal: controller.signal })
        .then((nextSuggestions) => {
          setSuggestions(nextSuggestions);
          setError("");
        })
        .catch((requestError) => {
          if (requestError.name !== "AbortError") {
            setSuggestions([]);
            setError(requestError.message);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsSearching(false);
          }
        });
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, enabled, query, selected]);

  return { clear, error, isSearching, suggestions };
}
