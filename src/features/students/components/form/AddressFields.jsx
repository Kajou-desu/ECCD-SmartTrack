import { useEffect, useId, useState } from "react";
import { loadProvinces, loadProvincePlaces, loadPuroks } from "../../utils/phAddress.js";

// Province -> City/Municipality -> Barangay are picked from the Philippine
// Standard Geographic Code lists in public/data/ph-address (a province's places
// are fetched only when it is picked). The last box, "Purok / House # / Street",
// stays free text: puroks are not in any national register, so the lists can
// only suggest them (see public/data/ph-address/README.md).
//
// The saved value of each part is the place NAME, which is what the address
// string stores. `onChange` receives {target:{name,value}} like any input; a
// parent that changes also clears the parts below it with extra calls, so
// callers must apply them with functional state updates.

// Fetches `load(key)` when `key` changes. The result remembers which key it
// belongs to, so a stale answer is never shown and nothing is set in an effect.
function useLoaded(key, load, attempt) {
  const [state, setState] = useState({ key: null, data: null, failed: false });

  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;
    load(key)
      .then((data) => !cancelled && setState({ key, data, failed: false }))
      .catch(() => !cancelled && setState({ key, data: null, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [key, load, attempt]);

  const current = state.key === key;
  return {
    data: current ? state.data : null,
    failed: current && state.failed,
    loading: Boolean(key) && !current,
  };
}

const loadProvinceList = () => loadProvinces();

// The saved name may not be in the list (an address typed before these lists
// existed, or a place renamed since). It is kept as an option so editing a
// record never silently drops it.
function withSaved(options, saved) {
  return saved && !options.includes(saved) ? [saved, ...options] : options;
}

export default function AddressFields({
  label = "Address",
  baseKey,
  // Name of each part's field; the default is baseKey + suffix (addressProvince).
  fieldName = (suffix) => `${baseKey}${suffix}`,
  values,
  onChange,
  onBlur,
  error,
  required = false,
}) {
  const purokListId = useId();
  const [attempt, setAttempt] = useState(0);

  const nameOf = {
    province: fieldName("Province"),
    municipality: fieldName("Municipality"),
    barangay: fieldName("Barangay"),
    details: fieldName("Details"),
  };
  const province = values[nameOf.province] || "";
  const municipality = values[nameOf.municipality] || "";
  const barangay = values[nameOf.barangay] || "";

  const inputClass = `w-full rounded-xl border bg-white px-3 py-3 text-sm text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-[#C2570C] focus:ring-2 focus:ring-[#C2570C]/15"
  }`;

  const provinces = useLoaded("provinces", loadProvinceList, attempt);
  const provinceCode = provinces.data?.find((p) => p.n === province)?.c ?? null;
  const places = useLoaded(provinceCode, loadProvincePlaces, attempt);
  const place = places.data?.find((p) => p.n === municipality);
  const barangayCode = place?.b.find((b) => b.n === barangay)?.c ?? null;
  const puroks = useLoaded(barangayCode ? "puroks" : null, loadPuroks, attempt);

  const failed = provinces.failed || places.failed;
  const provinceOptions = withSaved((provinces.data ?? []).map((p) => p.n), province);
  const placeOptions = withSaved((places.data ?? []).map((p) => p.n), municipality);
  const barangayOptions = withSaved((place?.b ?? []).map((b) => b.n), barangay);
  const purokSuggestions = (barangayCode && puroks.data?.[barangayCode]) || [];

  const emit = (name, value) => onChange({ target: { name, value } });
  const pick = (part, value, clears) => {
    emit(nameOf[part], value);
    clears.forEach((cleared) => emit(nameOf[cleared], ""));
  };

  const mark = required && <span className="text-red-500"> *</span>;
  const select = (part, text, options, current, disabled, clears) => (
    <div>
      <label htmlFor={nameOf[part]} className="mb-1 block text-xs font-semibold text-slate-600">
        {text}
        {mark}
      </label>
      <select
        id={nameOf[part]}
        name={nameOf[part]}
        value={current}
        onChange={(event) => pick(part, event.target.value, clears)}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        aria-label={`${label} — ${text}`}
        className={inputClass}
      >
        <option value="">{`Select ${text.toLowerCase()}`}</option>
        {options.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <p className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
        {mark}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {select("province", "Province", provinceOptions, province, provinces.loading && !province, ["municipality", "barangay"])}
        {select("municipality", "Municipality / City", placeOptions, municipality, !province || places.loading, ["barangay"])}
        {select("barangay", "Barangay", barangayOptions, barangay, !municipality, [])}

        <div>
          <label htmlFor={nameOf.details} className="mb-1 block text-xs font-semibold text-slate-600">
            Purok / House # / Street
          </label>
          <input
            id={nameOf.details}
            name={nameOf.details}
            value={values[nameOf.details] || ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="Purok / House # / Street"
            aria-label={`${label} — Purok / House # / Street`}
            list={purokSuggestions.length ? purokListId : undefined}
            className={inputClass}
          />
          {purokSuggestions.length > 0 && (
            <datalist id={purokListId}>
              {purokSuggestions.map((purok) => (
                <option key={purok} value={purok} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      {failed && (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          The address list could not be loaded.{" "}
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="font-semibold underline">
            Try again
          </button>
        </p>
      )}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
