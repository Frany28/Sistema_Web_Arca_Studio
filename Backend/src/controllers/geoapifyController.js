const GEOAPIFY_AUTOCOMPLETE_URL =
  "https://api.geoapify.com/v1/geocode/autocomplete";

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

export async function getAddressSuggestions(req, res, next) {
  try {
    const apiKey = getGeoapifyApiKey();
    const text = String(req.query?.q || "").trim();

    if (!apiKey) {
      res.status(500).json({
        code: "GEOAPIFY_API_KEY_MISSING",
        message: "Geoapify no esta configurado.",
      });
      return;
    }

    if (text.length < 2) {
      res.status(200).json({
        suggestions: [],
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
        message: "No se pudieron obtener sugerencias de ubicacion.",
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
