const GEOAPIFY_AUTOCOMPLETE_URL =
  "https://api.geoapify.com/v1/geocode/autocomplete";

function getGeoapifyApiKey() {
  return import.meta.env.VITE_GEOAPIFY_API_KEY;
}

function toAddressSuggestion(feature) {
  const properties = feature?.properties || {};
  const coordinates = feature?.geometry?.coordinates || [];
  const [longitude, latitude] = coordinates;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !properties.formatted
  ) {
    return null;
  }

  return {
    formattedAddress: properties.formatted,
    latitude,
    longitude,
    placeId: properties.place_id || properties.datasource?.raw?.place_id || null,
  };
}

export async function searchAddressSuggestions(query, { signal } = {}) {
  const apiKey = getGeoapifyApiKey();
  const trimmedQuery = String(query || "").trim();

  if (!apiKey || trimmedQuery.length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    apiKey,
    format: "geojson",
    lang: "es",
    limit: "5",
    text: trimmedQuery,
  });

  const response = await fetch(`${GEOAPIFY_AUTOCOMPLETE_URL}?${params}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Geoapify autocomplete request failed");
  }

  const data = await response.json();

  return (data.features || [])
    .map(toAddressSuggestion)
    .filter(Boolean);
}
