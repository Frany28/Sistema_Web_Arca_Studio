import assert from "node:assert/strict";
import test from "node:test";

import { getAddressSuggestions } from "../src/controllers/geoapifyController.js";

function createResponse() {
  return {
    body: null,
    headers: {},
    statusCode: 200,
    json(body) {
      this.body = body;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
  };
}

test("Geoapify autocomplete prioritizes Venezuela and returns unique suggestions", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.GEOAPIFY_API_KEY;
  let requestedUrl;
  process.env.GEOAPIFY_API_KEY = "test-key";
  globalThis.fetch = async (url) => {
    requestedUrl = new URL(url);
    return {
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [-71.64, 10.65] },
            properties: { formatted: "Estado Zulia, Venezuela", place_id: "zulia" },
          },
          {
            geometry: { coordinates: [-71.64, 10.65] },
            properties: { formatted: "Estado Zulia, Venezuela", place_id: "zulia" },
          },
        ],
      }),
      ok: true,
      status: 200,
    };
  };

  try {
    const response = createResponse();
    await getAddressSuggestions(
      { query: { q: "Zulia" } },
      response,
      (error) => {
        throw error;
      },
    );

    assert.equal(requestedUrl.searchParams.get("bias"), "countrycode:ve");
    assert.equal(requestedUrl.searchParams.get("text"), "Zulia");
    assert.equal(requestedUrl.searchParams.get("apiKey"), "test-key");
    assert.equal(response.headers["cache-control"], "private, no-store");
    assert.equal(response.body.suggestions.length, 1);
    assert.equal(response.body.suggestions[0].formattedAddress, "Estado Zulia, Venezuela");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY = originalApiKey;
  }
});

test("Geoapify authentication failures produce a safe configuration error", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.GEOAPIFY_API_KEY;
  process.env.GEOAPIFY_API_KEY = "test-key";
  globalThis.fetch = async () => ({ ok: false, status: 401 });

  try {
    const response = createResponse();
    await getAddressSuggestions(
      { query: { q: "Zulia" } },
      response,
      (error) => {
        throw error;
      },
    );

    assert.equal(response.statusCode, 502);
    assert.deepEqual(response.body, {
      code: "GEOAPIFY_CONFIGURATION_INVALID",
      message: "El buscador de ubicaciones no está configurado correctamente.",
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY = originalApiKey;
  }
});
