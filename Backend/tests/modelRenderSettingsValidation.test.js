import assert from "node:assert/strict";
import test from "node:test";

import { updateModelRenderSettingsSchema } from "../src/validation/schemas.js";
import { sanitizePublicPayload } from "../src/utils/publicPayload.js";

const validRequest = {
  params: { fileId: "8", projectId: "3" },
  body: {
    environment: "studio",
    exposure: 1.1,
    materialOverrides: {
      "0:Glass": { category: "glass", opacity: 0.45 },
    },
    profile: "exterior",
    shadowIntensity: 1.5,
  },
};

test("render settings accept bounded architectural overrides", () => {
  const result = updateModelRenderSettingsSchema.safeParse(validRequest);
  assert.equal(result.success, true);
  assert.equal(result.data.params.fileId, 8);
});

test("render settings reject unknown profiles and unsafe values", () => {
  const result = updateModelRenderSettingsSchema.safeParse({
    ...validRequest,
    body: { ...validRequest.body, exposure: 10, profile: "custom" },
  });
  assert.equal(result.success, false);
});

test("render settings SSE payload cannot expose storage data", () => {
  assert.deepEqual(
    sanitizePublicPayload({
      fileId: 8,
      settings: validRequest.body,
      storageKey: "projects/private/model.glb",
    }),
    { fileId: 8, settings: validRequest.body },
  );
});
