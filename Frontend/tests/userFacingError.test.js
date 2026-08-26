import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_USER_ERROR_MESSAGE,
  NETWORK_USER_ERROR_MESSAGE,
  getUserFacingErrorMessage,
} from "../src/utils/userFacingError.js";

test("technical network errors become coherent user messages", () => {
  for (const message of [
    "Failed to fetch",
    "NetworkError when attempting to fetch resource.",
    "TypeError: Load failed",
    "ECONNREFUSED",
  ]) {
    assert.equal(
      getUserFacingErrorMessage(message),
      NETWORK_USER_ERROR_MESSAGE,
    );
  }
});

test("friendly API messages are preserved and internal details are hidden", () => {
  assert.equal(
    getUserFacingErrorMessage("No tienes permisos para realizar esta acción."),
    "No tienes permisos para realizar esta acción.",
  );
  assert.equal(
    getUserFacingErrorMessage("Internal Server Error"),
    DEFAULT_USER_ERROR_MESSAGE,
  );
  assert.equal(getUserFacingErrorMessage(null), DEFAULT_USER_ERROR_MESSAGE);
});
