import { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";

const { default: AddressFields } = await import("@features/students/components/form/AddressFields.jsx");

// Serves the real files in public/data/ph-address, as the dev server would.
function serveAddressData() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      const file = String(url).split("/data/ph-address/")[1];
      try {
        const body = JSON.parse(readFileSync(`public/data/ph-address/${file}`, "utf8"));
        return { ok: true, status: 200, json: async () => body };
      } catch {
        return { ok: false, status: 404, json: async () => ({}) };
      }
    }),
  );
}

// Applies each change the way the real forms do: functional state updates.
function Harness({ initial = {}, onValues = () => {} }) {
  const [values, setValues] = useState({ addressProvince: "", addressMunicipality: "", addressBarangay: "", addressDetails: "", ...initial });
  onValues(values);
  return (
    <AddressFields
      label="Home Address"
      baseKey="address"
      values={values}
      onChange={(event) => setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }))}
      required
    />
  );
}

const field = (name) => screen.getByLabelText(new RegExp(`Home Address — ${name}`));
const optionTexts = (el) => [...el.options].map((o) => o.textContent);

beforeEach(serveAddressData);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AddressFields (Philippine address lists)", () => {
  it("lists the provinces, and Metro Manila's cities appear under NCR", async () => {
    render(<Harness />);
    await waitFor(() => expect(optionTexts(field("Province")).length).toBeGreaterThan(80));
    const provinces = optionTexts(field("Province"));
    expect(provinces).toContain("Cebu");
    expect(provinces).toContain("Pampanga");
    expect(provinces.some((p) => p.startsWith("National Capital Region"))).toBe(true);
  });

  it("offers only the picked province's cities, then that city's barangays", async () => {
    render(<Harness />);
    await waitFor(() => expect(optionTexts(field("Province")).length).toBeGreaterThan(80));

    expect(field("Municipality / City").disabled).toBe(true);
    fireEvent.change(field("Province"), { target: { value: "Cebu" } });
    await waitFor(() => expect(optionTexts(field("Municipality / City"))).toContain("City of Cebu"));
    expect(optionTexts(field("Municipality / City"))).toContain("City of Mandaue");
    expect(optionTexts(field("Municipality / City"))).not.toContain("City of Davao");

    expect(field("Barangay").disabled).toBe(true);
    fireEvent.change(field("Municipality / City"), { target: { value: "City of Cebu" } });
    await waitFor(() => expect(optionTexts(field("Barangay")).length).toBeGreaterThan(50));
  });

  it("clears the city and barangay when the province changes", async () => {
    let latest;
    render(<Harness onValues={(v) => (latest = v)} />);
    await waitFor(() => expect(optionTexts(field("Province")).length).toBeGreaterThan(80));
    fireEvent.change(field("Province"), { target: { value: "Cebu" } });
    await waitFor(() => expect(optionTexts(field("Municipality / City"))).toContain("City of Cebu"));
    fireEvent.change(field("Municipality / City"), { target: { value: "City of Cebu" } });
    await waitFor(() => expect(field("Barangay").disabled).toBe(false));
    fireEvent.change(field("Barangay"), { target: { value: field("Barangay").options[1].value } });
    expect(latest.addressBarangay).not.toBe("");

    fireEvent.change(field("Province"), { target: { value: "Pampanga" } });

    expect(latest).toMatchObject({ addressProvince: "Pampanga", addressMunicipality: "", addressBarangay: "" });
  });

  it("keeps a saved place that is not in the lists instead of dropping it", async () => {
    render(<Harness initial={{ addressProvince: "Old Province Name" }} />);
    expect(field("Province").value).toBe("Old Province Name");
  });

  it("marks the three list fields required but not the purok / street box", () => {
    render(<Harness />);
    expect(field("Province").required).toBe(true);
    expect(field("Municipality / City").required).toBe(true);
    expect(field("Barangay").required).toBe(true);
    expect(field("Purok / House # / Street").required).toBe(false);
  });

  it("says so, and can try again, when the list cannot be loaded", async () => {
    // The loader remembers each file for the page's life, so start with a fresh one.
    vi.resetModules();
    const { default: Fresh } = await import("@features/students/components/form/AddressFields.jsx");
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })));
    render(<Fresh label="Home Address" baseKey="address" values={{}} onChange={() => {}} />);
    expect(await screen.findByRole("alert")).toBeTruthy();

    serveAddressData();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(optionTexts(field("Province")).length).toBeGreaterThan(80));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
