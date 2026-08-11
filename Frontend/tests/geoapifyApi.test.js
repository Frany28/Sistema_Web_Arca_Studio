import assert from "node:assert/strict";
import test from "node:test";

import { searchAddressSuggestions } from "../src/utils/geoapify.js";

function jsonResponse(data, { ok = true, status = 200 } = {}) {
  return {
    headers: { get: () => "application/json" },
    json: async () => data,
    ok,
    status,
  };
}

test("location autocomplete returns backend suggestions with the authenticated session", async () => {
  const originalFetch = globalThis.fetch;
  let request;

  globalThis.fetch = async (url, options) => {
    request = { options, url };
    return jsonResponse({
      suggestions: [
        {
          formattedAddress: "Estado Táchira, Venezuela",
          latitude: 7.9,
          longitude: -72.1,
          placeId: "tachira",
        },
      ],
    });
  };

  try {
    const suggestions = await searchAddressSuggestions("Táchira");

    assert.equal(request.url, "/api/geoapify/address-suggestions?q=T%C3%A1chira");
    assert.equal(request.options.credentials, "include");
    assert.equal(suggestions[0].formattedAddress, "Estado Táchira, Venezuela");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("location autocomplete exposes the backend configuration error", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    jsonResponse(
      {
        code: "GEOAPIFY_API_KEY_MISSING",
        message: "Geoapify no está configurado.",
      },
      { ok: false, status: 500 },
    );

  try {
    await assert.rejects(searchAddressSuggestions("Táchira"), {
      code: "GEOAPIFY_API_KEY_MISSING",
      message: "Geoapify no está configurado.",
      status: 500,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("location autocomplete reports network failures without hiding them", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };

  try {
    await assert.rejects(searchAddressSuggestions("Táchira"), {
      code: "LOCATION_SEARCH_UNAVAILABLE",
      message: "No se pudo conectar con el buscador de ubicaciones.",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("location autocomplete rejects a successful non-API response", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    headers: { get: () => "text/html" },
    json: async () => null,
    ok: true,
    status: 200,
  });

  try {
    await assert.rejects(searchAddressSuggestions("Táchira"), {
      code: "LOCATION_SEARCH_INVALID_RESPONSE",
      message: "El buscador de ubicaciones devolvió una respuesta no válida.",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
