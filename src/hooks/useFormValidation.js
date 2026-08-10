import { useCallback, useState } from "react";

export function useFormValidation(initialValues, onSubmit, schema) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const validated = await schema.parseAsync(values);
        setErrors({});
        await onSubmit(validated);
      } catch (error) {
        if (error.errors) {
          const newErrors = {};
          error.errors.forEach(({ path, message }) => {
            newErrors[path[0]] = message;
          });
          setErrors(newErrors);
          setTouched(
            Object.keys(newErrors).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {}),
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, schema, values],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
  };
}
