import test from "node:test";
import assert from "node:assert/strict";

import {
  completeRegistrationSchema,
  normalizeRegistrationPhone,
  startRegistrationSchema,
} from "../src/validation/registrationSchemas.js";

test("registration normalizes identity data without making names unique", () => {
  const payload = {
    body: {
      fullName: "  María   Pérez González ",
      email: " MARIA@EXAMPLE.COM ",
      phone: "(414) 123-4567",
      company: " ARCA ",
      referralSource: "instagram",
    },
  };
  const first = startRegistrationSchema.parse(payload);
  const second = startRegistrationSchema.parse(payload);
  assert.deepEqual(first.body.fullName, { firstName: "María", lastName: "Pérez González" });
  assert.equal(first.body.email, "maria@example.com");
  assert.equal(first.body.phone, "+584141234567");
  assert.deepEqual(second.body.fullName, first.body.fullName);
});

test("registration rejects incomplete names, invalid phones and unsupported sources", () => {
  const base = {
    email: "person@example.com",
    company: "",
    referralSource: "referred",
  };
  assert.equal(startRegistrationSchema.safeParse({ body: { ...base, fullName: "María", phone: "4141234567" } }).success, false);
  assert.equal(startRegistrationSchema.safeParse({ body: { ...base, fullName: "María Pérez", phone: "123" } }).success, false);
  assert.equal(startRegistrationSchema.safeParse({ body: { ...base, fullName: "María Pérez", phone: "4141234567", referralSource: "search" } }).success, false);
  assert.equal(normalizeRegistrationPhone("+58 414-123-4567"), "+584141234567");
});

test("registration password requires strength and matching confirmation", () => {
  const valid = { body: { token: "signed-token", password: "Password1!", passwordConfirmation: "Password1!" } };
  assert.equal(completeRegistrationSchema.safeParse(valid).success, true);
  assert.equal(completeRegistrationSchema.safeParse({ body: { ...valid.body, passwordConfirmation: "Password2!" } }).success, false);
  assert.equal(completeRegistrationSchema.safeParse({ body: { ...valid.body, password: "password", passwordConfirmation: "password" } }).success, false);
});
