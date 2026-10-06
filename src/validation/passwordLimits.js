// The backend hashes with bcrypt, which only uses the first 72 BYTES of a
// password (a non-English character is 2-4 bytes), so it rejects anything
// longer rather than silently truncating it. Checking here gives the person
// a clear message instead of a failed request.
export const MAX_PASSWORD_BYTES = 72;

export function exceedsMaxPasswordBytes(password) {
  return new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES;
}

export const MAX_PASSWORD_MESSAGE =
  "Password is too long. Use at most 72 characters (non-English characters count as more than one).";
