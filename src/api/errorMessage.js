// The API client deliberately gives every ApiError the generic message
// "Something went wrong.", so reading err.message hides everything useful:
// a wrong OTP, an expired OTP, a 429 lockout and a validation failure all
// looked identical. The server's own message is in err.details.message.
//
// Server (5xx) errors keep the caller's fallback — their text is generic by
// design and not something to show. Errors that are not ApiErrors (e.g. a
// local `new Error("Please enter your email")`) keep their own message.
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  // Identified by name rather than instanceof so this file needn't import the
  // API client (which would also tie every test that mocks it to this helper).
  if (err?.name === "ApiError") {
    const serverMessage = err.details?.message;
    if (err.status < 500 && typeof serverMessage === "string" && serverMessage.trim()) {
      return serverMessage;
    }
    return fallback;
  }
  return err?.message || fallback;
}
