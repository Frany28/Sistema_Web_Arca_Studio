import assert from "node:assert/strict";
import test from "node:test";

import { environmentCommentsApi } from "../src/api/http.js";

function jsonResponse(data, { ok = true, status = 200 } = {}) {
  return {
    headers: { get: () => "application/json" },
    json: async () => data,
    ok,
    status,
  };
}

test("the general observation composer posts to the environment endpoint", async () => {
  const originalFetch = globalThis.fetch;
  let request;

  globalThis.fetch = async (url, options) => {
    request = { options, url };
    return jsonResponse(
      { comment: { content: "Observación general", id: 12 } },
      { status: 201 },
    );
  };

  try {
    const result = await environmentCommentsApi.create({
      content: "Observación general",
    });

    assert.equal(request.url, "/api/environment-comments");
    assert.equal(request.options.method, "POST");
    assert.equal(request.options.credentials, "include");
    assert.deepEqual(JSON.parse(request.options.body), {
      content: "Observación general",
      parentCommentId: null,
    });
    assert.equal(result.comment.id, 12);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the environment API exposes the backend error without logging its payload", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    jsonResponse(
      {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error inesperado.",
      },
      { ok: false, status: 500 },
    );

  try {
    await assert.rejects(
      environmentCommentsApi.create({ content: "Comentario" }),
      {
        code: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error inesperado.",
        status: 500,
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
