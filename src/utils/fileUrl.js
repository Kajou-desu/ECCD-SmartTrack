// Gallery tiles and album covers are a few hundred pixels wide, but the file
// URL serves the original (often a multi-megabyte phone photo). The API serves
// a small version of an image when asked with ?v=thumb, so tiles use that and
// only the full-size viewer loads the original.
//
// Adding the parameter doesn't change the signature, so the same signed URL
// works for both. Anything that isn't one of the API's file URLs is returned
// untouched.
export function thumbnailUrl(url) {
  if (typeof url !== "string" || !url.includes("/api/files/")) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("v", "thumb");
    return parsed.toString();
  } catch {
    return url;
  }
}
