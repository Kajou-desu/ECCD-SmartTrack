import FormField from "./FormField";

export default function ContactSection({ title, prefix, values, touched, errors, onChange, onBlur }) {
  const fieldName = (field) => `${prefix}${field}`;

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

        <FormField
          label="Address"
          name={fieldName("Address")}
          value={values[fieldName("Address")]}
          onChange={onChange}
          onBlur={onBlur}
          error={touched[fieldName("Address")] && errors[fieldName("Address")]}
          placeholder="Complete home address"
        />
      </div>
    </div>
  );
}
