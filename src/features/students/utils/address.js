const ADDRESS_PARTS = [
  ["province", "Province"],
  ["municipality", "Municipality"],
  ["barangay", "Barangay"],
  ["details", "Details"],
];

export function combineAddress(parts) {
  return ADDRESS_PARTS
    .map(([key, label]) => {
      const value = (parts[key] ?? "").trim();
      return value ? `${label}: ${value}` : "";
    })
    .filter(Boolean)
    .join(" | ");
}

export function splitAddress(address) {
  const value = (address ?? "").trim();
  const emptyParts = { province: "", municipality: "", barangay: "", details: "" };
  if (!value) return emptyParts;

  if (/^(Province|Municipality|Barangay|Details):/i.test(value)) {
    return value.split(" | ").reduce((parts, segment) => {
      const match = segment.match(/^(Province|Municipality|Barangay|Details):\s*(.*)$/i);
      if (match) parts[match[1].toLowerCase()] = match[2].trim();
      return parts;
    }, emptyParts);
  }

  const match = value.match(/^purok\s*:?\s*(.*?),?\s*barangay\s*:?\s*(.*)$/i);
  if (match) {
    return {
      ...emptyParts,
      barangay: match[2].trim(),
      details: `Purok ${match[1].trim()}`.trim(),
    };
  }

  return { ...emptyParts, details: value };
}
