import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay`
 * ms of no further changes. Used for search inputs so a request isn't
 * fired on every keystroke - matches the backend's server-side
 * filtering design (see student.controller.js's listDrives) by not
 * hammering it with a request per character typed.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
