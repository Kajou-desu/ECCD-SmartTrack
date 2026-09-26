import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Reads a one-shot flag off `location.state` (set by a caller via
 * `navigate(path, { state: { [key]: true } })`) and returns its initial
 * value for the lifetime of this mount, then strips it from history state
 * so navigating back to this entry doesn't re-trigger whatever it opened.
 */
export function useConsumeLocationState(key) {
  const location = useLocation();
  const navigate = useNavigate();
  const consumedRef = useRef(false);
  const [value] = useState(() => location.state?.[key]);

  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;

    if (location.state?.[key] === undefined) return;

    const rest = { ...location.state };
    delete rest[key];
    navigate(location.pathname, { replace: true, state: rest });
    // Runs once per mount, right after reading the initial value above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}

export default useConsumeLocationState;
