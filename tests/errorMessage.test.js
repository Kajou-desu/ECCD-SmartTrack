import { test } from "node:test";
import assert from "node:assert/strict";
import { getErrorMessage } from "../src/api/errorMessage.js";

const apiError = (status, message) =>
  Object.assign(new Error("Something went wrong."), { name: "ApiError", status, details: message ? { message } : {} });

test("shows the server's message for a client error (wrong OTP, lockout, validation)", () => {
  assert.equal(getErrorMessage(apiError(400, "Invalid or expired OTP"), "fallback"), "Invalid or expired OTP");
  assert.equal(getErrorMessage(apiError(429, "Too many attempts, please try again later"), "fallback"), "Too many attempts, please try again later");
});

test("uses the fallback for server errors and for errors with no message", () => {
  assert.equal(getErrorMessage(apiError(500, "Something went wrong"), "fallback"), "fallback");
  assert.equal(getErrorMessage(apiError(400), "fallback"), "fallback");
});

test("keeps the message of a local (non-API) Error", () => {
  assert.equal(getErrorMessage(new Error("Please enter your email address."), "fallback"), "Please enter your email address.");
});

test("never throws on a non-error value", () => {
  assert.equal(getErrorMessage(undefined, "fallback"), "fallback");
  assert.equal(getErrorMessage(null, "fallback"), "fallback");
});
