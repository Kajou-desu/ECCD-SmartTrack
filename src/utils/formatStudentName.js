function formatNameParts(parts) {
  const names = parts.map((part) => String(part ?? "").trim()).filter(Boolean);
  if (names.length < 3) return names.join(" ");

  const [firstName, ...remaining] = names;
  const lastName = remaining.pop();
  const middleInitials = remaining.map((name) => `${name.charAt(0).toUpperCase()}.`);

  return [firstName, ...middleInitials, lastName].join(" ");
}

export default function formatStudentName(studentOrName) {
  if (!studentOrName) return "";

  if (typeof studentOrName === "string") {
    return formatNameParts(studentOrName.split(/\s+/));
  }

  const { firstName, middleName, lastName, name } = studentOrName;
  if (firstName || middleName || lastName) {
    return formatNameParts([firstName, middleName, lastName]);
  }

  return formatStudentName(name);
}