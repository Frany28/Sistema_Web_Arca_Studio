import { getAuthToken } from "../api/http.js";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3000/api" : "/api")
).replace(/\/$/, "");

function looksLikeCoordinates(value) {
  return /^-?\d+(?:\.\d+)?\s*[, ]\s*-?\d*(?:\.\d*)?$/.test(
    String(value || "").trim(),
  );
}

export async function searchAddressSuggestions(query, { signal } = {}) {
  const trimmedQuery = String(query || "").trim();

  if (trimmedQuery.length < 2 && !looksLikeCoordinates(trimmedQuery)) {
    return [];
  }

  const token = getAuthToken();
  const params = new URLSearchParams({ q: trimmedQuery });

  const response = await fetch(
    `${API_BASE_URL}/geoapify/address-suggestions?${params}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    signal,
    },
  );

  if (!response.ok) {
    throw new Error("Address autocomplete request failed");
  }

  const data = await response.json();
  return Array.isArray(data.suggestions) ? data.suggestions : [];
}
