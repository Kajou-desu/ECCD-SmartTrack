import FormField from "./FormField";
import AddressFields from "./AddressFields";

export default function ContactSection({
  title,
  prefix,
  values,
  touched,
  errors,
  onChange,
  onBlur,
  onAddressChange,
  onAddressBlur,
}) {
  const fieldName = (field) => `${prefix}${field}`;
  const addressKey = fieldName("Address");

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <h3 className="mb-4 text-sm font-bold text-slate-800">{title}</h3>

      <div className="space-y-4">
        <FormField
          label={`${title} Name`}
          name={fieldName("Name")}
          value={values[fieldName("Name")]}
          onChange={onChange}
          onBlur={onBlur}
          error={touched[fieldName("Name")] && errors[fieldName("Name")]}
          placeholder={`${title}'s full name`}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Phone Number"
            name={fieldName("Phone")}
            type="tel"
            value={values[fieldName("Phone")]}
            onChange={onChange}
            onBlur={onBlur}
            error={touched[fieldName("Phone")] && errors[fieldName("Phone")]}
            placeholder="0912-345-6789"
          />

          <FormField
            label="Email Address"
            name={fieldName("Email")}
            type="email"
            value={values[fieldName("Email")]}
            onChange={onChange}
            onBlur={onBlur}
            error={touched[fieldName("Email")] && errors[fieldName("Email")]}
            placeholder="email@example.com"
          />
        </div>

        <AddressFields
          label="Address"
          purokName={fieldName("AddressPurok")}
          barangayName={fieldName("AddressBarangay")}
          purokValue={values[fieldName("AddressPurok")]}
          barangayValue={values[fieldName("AddressBarangay")]}
          onChange={onAddressChange}
          onBlur={onAddressBlur}
          error={touched[addressKey] && errors[addressKey]}
        />
      </div>
    </div>
  );
}
