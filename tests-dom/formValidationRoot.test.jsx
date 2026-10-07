import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { z } from "zod";
import { useFormValidation } from "@hooks/useFormValidation.js";

describe("useFormValidation form-level errors", () => {
  it("stores an error with no field path under _form, not 'undefined'", async () => {
    const schema = z
      .object({ a: z.string(), b: z.string() })
      .refine((v) => v.a === v.b, { message: "Fields must match" });
    const { result } = renderHook(() =>
      useFormValidation({ a: "x", b: "y" }, async () => {}, schema),
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault() {} });
    });

    expect(result.current.errors._form).toBe("Fields must match");
    expect("undefined" in result.current.errors).toBe(false);
  });

  it("still maps field errors to their field", async () => {
    const schema = z.object({ a: z.string().min(2, "Too short") });
    const { result } = renderHook(() => useFormValidation({ a: "x" }, async () => {}, schema));
    await act(async () => {
      await result.current.handleSubmit({ preventDefault() {} });
    });
    expect(result.current.errors.a).toBe("Too short");
  });
});
