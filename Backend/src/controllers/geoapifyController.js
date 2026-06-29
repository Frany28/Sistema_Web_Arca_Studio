const GEOAPIFY_AUTOCOMPLETE_URL =
  "https://api.geoapify.com/v1/geocode/autocomplete";
const GEOAPIFY_REVERSE_URL = "https://api.geoapify.com/v1/geocode/reverse";

function getGeoapifyApiKey() {
  return process.env.GEOAPIFY_API_KEY || process.env.VITE_GEOAPIFY_API_KEY;
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

function parseCoordinateText(value) {
  const match = String(value || "")
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/);

  if (!match) {
    return null;
  }

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

async function searchByCoordinates({ apiKey, latitude, longitude }) {
  const params = new URLSearchParams({
    apiKey,
    format: "geojson",
    lang: "es",
    lat: String(latitude),
    lon: String(longitude),
    limit: "1",
  });

  const response = await fetch(`${GEOAPIFY_REVERSE_URL}?${params}`);

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return (data.features || []).map(toAddressSuggestion).find(Boolean) || null;
}

export async function getAddressSuggestions(req, res, next) {
  try {
    const apiKey = getGeoapifyApiKey();
    const text = String(req.query?.q || "").trim();

    if (!apiKey) {
      res.status(500).json({
        code: "GEOAPIFY_API_KEY_MISSING",
        message: "Geoapify no está configurado.",
      });
      return;
    }

    if (text.length < 2) {
      res.status(200).json({
        suggestions: [],
      });
      return;
    }

    const coordinates = parseCoordinateText(text);

    if (coordinates) {
      const suggestion = await searchByCoordinates({
        apiKey,
        ...coordinates,
      });

      res.status(200).json({
        suggestions: suggestion ? [suggestion] : [],
      });
      return;
    }

    const params = new URLSearchParams({
      apiKey,
      format: "geojson",
      lang: "es",
      limit: "5",
      text,
    });

    const response = await fetch(`${GEOAPIFY_AUTOCOMPLETE_URL}?${params}`);

    if (!response.ok) {
      res.status(502).json({
        code: "GEOAPIFY_REQUEST_FAILED",
        message: "No se pudieron obtener sugerencias de ubicación.",
      });
      return;
    }

    const data = await response.json();
    const suggestions = (data.features || [])
      .map(toAddressSuggestion)
      .filter(Boolean);

    res.status(200).json({
      suggestions,
    });
  } catch (error) {
    next(error);
  }
}
