import assert from "node:assert/strict";
import test from "node:test";

import {
  PROJECT_REQUEST_REQUIRED_FIELDS,
  getProjectRequestRequiredFieldErrors,
} from "../src/utils/projectRequestValidation.js";

const VALID_REQUIRED_VALUES = {
  projectName: "Casa Jardín",
  projectType: "Residencial",
  location: "Maracaibo, Estado Zulia",
  developmentMode: "Por definir",
  investmentRange: "No lo tengo definido aún",
  capitalAvailability: "Indefinido",
  startTime: "Más de 6 meses",
};

test("project request validation requires every field marked with an asterisk", () => {
  const errors = getProjectRequestRequiredFieldErrors({});

  assert.deepEqual(Object.keys(errors), PROJECT_REQUEST_REQUIRED_FIELDS);
});

test("project request validation accepts every configured required response", () => {
  assert.deepEqual(
    getProjectRequestRequiredFieldErrors(VALID_REQUIRED_VALUES),
    {},
  );
});

test("project request validation ignores empty optional fields", () => {
  assert.deepEqual(
    getProjectRequestRequiredFieldErrors({
      ...VALID_REQUIRED_VALUES,
      description: "",
      projectSize: "",
      referenceLink: "",
    }),
    {},
  );
});
